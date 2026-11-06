import { jsonNoStore, enforceRateLimit, parseProviderChain, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { gerarRespostas, refinarResposta, type GerarResultado } from "@/lib/ai/provider";
import type { GerarInput, RefineInput, RespostaTripla } from "@/lib/types";
import { verifyFirebaseIdToken, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { upsertClinica, upsertHistorico } from "@/lib/supabase/server";
import { reserveGeneration, releaseGeneration } from "@/lib/usage-limit";
import { TRIAL_ENDED_MESSAGE } from "@/lib/free-limit";
import { enforceAiDailyLimit } from "@/lib/ai-guard";

export const runtime = "nodejs";

type GenerateBody = Partial<GerarInput & RefineInput & {
  acao?: string;
  firebaseIdToken?: string;
}>;

function respostasToArray(respostas: GerarResultado["respostas"]): string[] {
  if (Array.isArray(respostas)) return respostas.map(String).filter(Boolean);
  const r = respostas as RespostaTripla;
  return [r.curta, r.consultiva, r.persuasiva].map(String).filter(Boolean);
}

function clinicaMirrorPayload(firebaseUid: string, clinica: GenerateBody["clinica"]) {
  return {
    firebase_uid: firebaseUid,
    nome_clinica: clinica?.nome_clinica,
    cidade: clinica?.cidade,
    tom_padrao: clinica?.tom_padrao,
    procedimentos: clinica?.procedimentos,
    formalidade: clinica?.formalidade,
    como_chamar: clinica?.como_chamar,
    cta_preferido: clinica?.cta_preferido,
    onboarded: clinica?.onboarded,
  };
}

async function mirrorGeneration(
  firebaseUid: string,
  body: GenerateBody,
  result: GerarResultado
) {
  const contexto = {
    canal: "web",
    modo: body.modo === "reescrever" ? "reescrever" : "gerar",
    procedimento: body.procedimento ?? "",
    situacao: body.situacao ?? "",
    tom: body.tom ?? "acolhedor",
    objetivo: body.objetivo ?? "",
    perfilCliente: body.perfilCliente ?? "",
    nomeCliente: body.nomeCliente ?? "",
    mensagemCliente: String(body.mensagemCliente ?? ""),
  };

  const writes: Promise<unknown>[] = [
    upsertHistorico({
      firebase_uid: firebaseUid,
      tipo: contexto.modo === "reescrever" ? "reescrever" : "gerador",
      contexto,
      respostas: respostasToArray(result.respostas),
      favorito: false,
      intent: result.intent ?? null,
      sentiment: result.sentiment ?? null,
      score: result.score ?? null,
    }),
  ];

  if (body.clinica) {
    writes.push(upsertClinica(clinicaMirrorPayload(firebaseUid, body.clinica)));
  }

  await Promise.allSettled(writes);
}

export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "api-generate",
    limit: 30,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const parsed = await readJsonBody<GenerateBody>(req, 32_768);
    if (parsed.error) return parsed.error;

    const body = parsed.data ?? {};

    // Ação: "Melhorar essa resposta" (refina uma variante).
    if (body?.acao === "refinar") {
      if (!body.respostaAtual || !body.variante) {
        return jsonNoStore(
          { error: "Resposta atual e variante são obrigatórias." },
          { status: 400 }
        );
      }
      const token = body.firebaseIdToken;
      const decoded = await verifyFirebaseIdToken(token);
      if (token && !decoded?.uid && isFirebaseAdminConfigured()) {
        return jsonNoStore(
          { error: "Sessão expirada. Entre novamente para continuar.", reauth: true },
          { status: 401 }
        );
      }
      const dailyLimit = enforceAiDailyLimit(req, { uid: decoded?.uid });
      if (dailyLimit) return dailyLimit;
      const r = await refinarResposta({
        modo: body.modo === "reescrever" ? "reescrever" : "gerar",
        variante: body.variante,
        respostaAtual: String(body.respostaAtual),
        procedimento: body.procedimento ?? "",
        situacao: body.situacao ?? "",
        tom: body.tom ?? "acolhedor",
        objetivo: body.objetivo ?? "",
        perfilCliente: body.perfilCliente,
        nomeCliente: body.nomeCliente,
        mensagemCliente: body.mensagemCliente ?? "",
        clinica: body.clinica,
      });
      return jsonNoStore(r);
    }

    if (!body?.mensagemCliente || !String(body.mensagemCliente).trim()) {
      return jsonNoStore(
        { error: "Informe a mensagem da cliente." },
        { status: 400 }
      );
    }

    // Teste grátis: usuário LOGADO tem 7 dias; pagante é ilimitado.
    // Sem token (ex.: demo pública da landing) não conta nem bloqueia.
    // CLERK_MIGRATION: this firebaseIdToken pattern is used across many routes.
    const token = (body as { firebaseIdToken?: string }).firebaseIdToken;
    const decoded = await verifyFirebaseIdToken(token);

    // Token ENVIADO mas inválido/expirado não pode rebaixar para "anônimo
    // ilimitado" (senão um grátis logado driblaria o limite mandando lixo, e um
    // legítimo com token expirado geraria sem contar). Só vale quando o Admin
    // SDK existe — sem credencial, verify falha por config, não por token ruim.
    if (token && !decoded?.uid && isFirebaseAdminConfigured()) {
      return jsonNoStore(
        { error: "Sessão expirada. Entre novamente para continuar.", reauth: true },
        { status: 401 }
      );
    }

    // Reserva ATÔMICA do slot grátis ANTES de gerar (check + increment na mesma
    // transação) pra fechar a corrida: sem isso, chamadas concorrentes do mesmo
    // usuário não contam errado nem marcam o início do teste duas vezes.
    let limit = null as Awaited<ReturnType<typeof reserveGeneration>> | null;
    if (decoded?.uid) {
      limit = await reserveGeneration(decoded.uid);
      if (!limit.allowed) {
        return jsonNoStore(
          {
            error: TRIAL_ENDED_MESSAGE,
            limitReached: true,
            freeRemaining: 0,
          },
          { status: 402 }
        );
      }
    }

    const dailyLimit = enforceAiDailyLimit(req, { uid: decoded?.uid, paid: limit?.paid });
    if (dailyLimit) {
      if (decoded?.uid && limit?.reserved) await releaseGeneration(decoded.uid);
      return dailyLimit;
    }

    const providerChain = parseProviderChain(body.providerChain);

    let result;
    try {
      result = await gerarRespostas({
        modo: body.modo === "reescrever" ? "reescrever" : "gerar",
        procedimento: body.procedimento ?? "",
        situacao: body.situacao ?? "",
        tom: body.tom ?? "acolhedor",
        objetivo: body.objetivo ?? "",
        perfilCliente: body.perfilCliente,
        oQueMelhorar: body.oQueMelhorar,
        nomeCliente: body.nomeCliente,
        mensagemCliente: String(body.mensagemCliente),
        clinica: body.clinica,
        providerChain: providerChain?.length ? providerChain : undefined,
      });
    } catch (genErr) {
      // Geração falhou: devolve o slot reservado pra não "gastar" uma grátis.
      if (decoded?.uid && limit?.reserved) await releaseGeneration(decoded.uid);
      throw genErr;
    }

    // Dias que restam do teste (só pra não-pagante).
    const freeRemaining = limit?.reserved ? limit.remaining : undefined;

    if (decoded?.uid) {
      try {
        await mirrorGeneration(decoded.uid, body, result);
      } catch (err) {
        console.warn("[api/generate] supabase mirror falhou:", err instanceof Error ? err.message : err);
      }
    }

    return jsonNoStore(
      freeRemaining === undefined ? result : { ...result, freeRemaining }
    );
  } catch (err: unknown) {
    console.error("[api/generate] erro fatal:", err);
    return jsonNoStore(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
