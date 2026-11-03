// Lógica pura do "teste rápido" (demo da landing + onboarding): exemplos,
// cota anônima, corpo da chamada a /api/generate e leitura da resposta.
// Sem React aqui, para dar para testar com Vitest.
import type { ComoChamar, RespostaTripla, Variante } from "@/lib/types";

/** Testes grátis sem cadastro, somados entre a landing e o onboarding. */
export const DEMO_LIMIT = 5;
/** Mesma chave nas duas telas: o contador é um só por navegador. */
export const DEMO_USAGE_KEY = "leadbellus_landing_demo_generations_v1";

/**
 * CustomEvent (detail = id do exemplo) que os chips da seção Situações da
 * landing disparam para preencher a caixa da demo sem recarregar a página.
 */
export const DEMO_PRESET_EVENT = "lb:demo-preset";

/** Só OpenAI e Gemini na demo anônima (custo menor por chamada). */
export const QUICK_REPLY_PROVIDER_CHAIN = ["openai", "gemini"] as const;

export type QuickReplyPreset = {
  mensagem: string;
  /** Situação enviada à IA; por padrão, o próprio id do exemplo. */
  situacao?: string;
  procedimento?: string;
};

/** Exemplos usados pelos chips da demo, da seção Situações e do `?demo=`. */
export const QUICK_REPLY_PRESETS: Record<string, QuickReplyPreset> = {
  preco: { mensagem: "Oi! Quanto fica o botox?", procedimento: "botox" },
  achou_caro: { mensagem: "Achei caro… tem como melhorar esse valor?" },
  medo: { mensagem: "Tenho receio de ficar artificial. Como vocês fazem?" },
  sumiu: { mensagem: "Vou pensar e te aviso, tá?", situacao: "sumiu" },
  desconto: { mensagem: "Se eu fechar hoje você faz um desconto?" },
  dor: { mensagem: "Dói? Tenho muito medo de agulha…" },
};

export function getQuickReplyPreset(id: string | null | undefined) {
  if (!id || !Object.prototype.hasOwnProperty.call(QUICK_REPLY_PRESETS, id)) {
    return null;
  }
  const preset = QUICK_REPLY_PRESETS[id];
  return {
    mensagem: preset.mensagem,
    situacao: preset.situacao ?? id,
    procedimento: preset.procedimento ?? "",
  };
}

/** Rótulos de exibição das 3 variantes (as chaves técnicas não mudam). */
export const QUICK_REPLY_VARIANTS: {
  key: Variante;
  label: string;
  descricao: string;
}[] = [
  { key: "curta", label: "Suave", descricao: "Curta e acolhedora" },
  {
    key: "consultiva",
    label: "Consultiva",
    descricao: "Explica antes de falar de valor",
  },
  {
    key: "persuasiva",
    label: "Fechamento",
    descricao: "Convida para o próximo passo",
  },
];

/** "Jeito de falar" em 3 opções (formalidade 0–100 que a IA já entende). */
export const FORMALIDADE_OPCOES: { value: number; label: string }[] = [
  { value: 20, label: "Bem próximo" },
  { value: 50, label: "Equilibrado" },
  { value: 80, label: "Mais formal" },
];

/** Opção de formalidade mais próxima (rascunhos antigos guardam 0–100 livre). */
export function nearestFormalidade(value: number | undefined | null): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 50;
  return FORMALIDADE_OPCOES.reduce((best, opt) =>
    Math.abs(opt.value - n) < Math.abs(best.value - n) ? opt : best
  ).value;
}

/** Lê o contador gravado no localStorage, sempre entre 0 e DEMO_LIMIT. */
export function parseDemoUses(raw: string | null | undefined): number {
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(DEMO_LIMIT, Math.max(0, parsed));
}

export type QuickReplyClinica = {
  nome_clinica?: string;
  formalidade?: number;
  como_chamar?: ComoChamar;
  cta_preferido?: string;
};

export type QuickReplyInput = {
  mensagem: string;
  situacao?: string;
  procedimento?: string;
  clinica?: QuickReplyClinica;
};

/** Corpo do POST /api/generate. Sem nome nem telefone da cliente. */
export function buildQuickReplyBody(input: QuickReplyInput) {
  const clinica = input.clinica ?? {};
  return {
    modo: "gerar" as const,
    procedimento: input.procedimento ?? "",
    situacao: input.situacao ?? "",
    tom: "acolhedor",
    objetivo: "direcionar para a avaliação",
    mensagemCliente: input.mensagem.trim(),
    providerChain: [...QUICK_REPLY_PROVIDER_CHAIN],
    clinica: {
      nome_clinica: clinica.nome_clinica?.trim() ?? "",
      formalidade: nearestFormalidade(clinica.formalidade),
      como_chamar: clinica.como_chamar ?? "linda",
      cta_preferido: clinica.cta_preferido?.trim() || "marcar uma avaliação",
    },
  };
}

export const QUICK_REPLY_ERRORS = {
  vazio: "Cole a mensagem da cliente para ver as respostas.",
  api: "Não deu para gerar agora. Tente de novo em instantes.",
  conexao: "Falha de conexão. Tente de novo.",
  limiteDiario: "Limite diário de respostas atingido. Tente de novo amanhã.",
} as const;

export type QuickReplyResult =
  | { ok: true; respostas: RespostaTripla; mock: boolean; aviso: string }
  | {
      ok: false;
      tipo: "api" | "limite_diario";
      mensagem: string;
    };

type GenerateData = {
  respostas?: Partial<Record<Variante, unknown>> | null;
  mock?: boolean;
  aviso?: string;
  error?: string;
  dailyLimit?: boolean;
};

/** Interpreta a resposta de /api/generate para a demo. */
export function readQuickReplyResponse(
  status: number,
  data: GenerateData | null | undefined
): QuickReplyResult {
  const body = data ?? {};
  if (status === 429 && body.dailyLimit) {
    return {
      ok: false,
      tipo: "limite_diario",
      mensagem:
        typeof body.error === "string" && body.error.trim()
          ? body.error
          : QUICK_REPLY_ERRORS.limiteDiario,
    };
  }

  const r = body.respostas ?? {};
  const pick = (k: Variante) => (typeof r[k] === "string" ? (r[k] as string).trim() : "");
  const respostas: RespostaTripla = {
    curta: pick("curta"),
    consultiva: pick("consultiva"),
    persuasiva: pick("persuasiva"),
  };
  const hasAny = Object.values(respostas).some(Boolean);

  if (status < 200 || status >= 300 || !hasAny) {
    return { ok: false, tipo: "api", mensagem: QUICK_REPLY_ERRORS.api };
  }

  const mock = body.mock === true;
  const aviso =
    typeof body.aviso === "string" && body.aviso.trim()
      ? body.aviso
      : mock
        ? "Modo demonstração: mostramos um exemplo realista para você ver como fica."
        : "";

  return { ok: true, respostas, mock, aviso };
}
