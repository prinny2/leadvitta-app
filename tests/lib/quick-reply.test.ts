import { describe, expect, it } from "vitest";

import {
  DEMO_LIMIT,
  DEMO_USAGE_KEY,
  FORMALIDADE_OPCOES,
  QUICK_REPLY_ERRORS,
  QUICK_REPLY_PRESETS,
  QUICK_REPLY_VARIANTS,
  buildQuickReplyBody,
  getQuickReplyPreset,
  nearestFormalidade,
  parseDemoUses,
  readQuickReplyResponse,
} from "@/lib/quick-reply";
import { situacaoPorId } from "@/data/situacoes";

describe("teste rápido (demo da landing + onboarding)", () => {
  it("mantém a chave e o limite do contador compartilhado", () => {
    // A landing e o onboarding somam no MESMO contador: trocar a chave
    // devolveria 5 testes grátis a quem já usou.
    expect(DEMO_USAGE_KEY).toBe("leadbellus_landing_demo_generations_v1");
    expect(DEMO_LIMIT).toBe(5);
  });

  it("lê o contador sem passar de 0..5", () => {
    expect(parseDemoUses(null)).toBe(0);
    expect(parseDemoUses("")).toBe(0);
    expect(parseDemoUses("abc")).toBe(0);
    expect(parseDemoUses("-3")).toBe(0);
    expect(parseDemoUses("3")).toBe(3);
    expect(parseDemoUses("99")).toBe(DEMO_LIMIT);
  });

  it("todo exemplo aponta para uma situação que a IA conhece", () => {
    for (const id of Object.keys(QUICK_REPLY_PRESETS)) {
      const preset = getQuickReplyPreset(id);
      expect(preset, id).not.toBeNull();
      expect(situacaoPorId(preset!.situacao), id).toBeDefined();
      expect(preset!.mensagem.trim().length, id).toBeGreaterThan(0);
    }
  });

  it("usa a copy combinada nos exemplos", () => {
    expect(getQuickReplyPreset("preco")).toEqual({
      mensagem: "Oi! Quanto fica o botox?",
      situacao: "preco",
      procedimento: "botox",
    });
    expect(getQuickReplyPreset("sumiu")).toEqual({
      mensagem: "Vou pensar e te aviso, tá?",
      situacao: "sumiu",
      procedimento: "",
    });
  });

  it("ignora exemplo desconhecido (inclusive chaves do Object.prototype)", () => {
    expect(getQuickReplyPreset("qualquer")).toBeNull();
    expect(getQuickReplyPreset("toString")).toBeNull();
    expect(getQuickReplyPreset("")).toBeNull();
    expect(getQuickReplyPreset(null)).toBeNull();
  });

  it("exibe Suave / Consultiva / Fechamento sobre as chaves técnicas", () => {
    expect(QUICK_REPLY_VARIANTS.map((v) => [v.key, v.label])).toEqual([
      ["curta", "Suave"],
      ["consultiva", "Consultiva"],
      ["persuasiva", "Fechamento"],
    ]);
  });

  it("encaixa qualquer formalidade nas 3 opções", () => {
    expect(FORMALIDADE_OPCOES.map((o) => o.value)).toEqual([20, 50, 80]);
    expect(nearestFormalidade(0)).toBe(20);
    expect(nearestFormalidade(40)).toBe(50);
    expect(nearestFormalidade(70)).toBe(80);
    expect(nearestFormalidade(100)).toBe(80);
    expect(nearestFormalidade(undefined)).toBe(50);
    expect(nearestFormalidade(Number.NaN)).toBe(50);
  });

  it("monta o corpo sem situação nem procedimento quando a mensagem é colada", () => {
    // Sem viés: antes a demo mandava preco/botox para qualquer texto colado.
    const body = buildQuickReplyBody({ mensagem: "  Tenho medo de ficar estranha  " });
    expect(body).toMatchObject({
      modo: "gerar",
      situacao: "",
      procedimento: "",
      tom: "acolhedor",
      mensagemCliente: "Tenho medo de ficar estranha",
      providerChain: ["openai", "gemini"],
      clinica: {
        nome_clinica: "",
        formalidade: 50,
        como_chamar: "linda",
        cta_preferido: "marcar uma avaliação",
      },
    });
    expect(body).not.toHaveProperty("nomeCliente");
  });

  it("leva o tom da clínica para a IA", () => {
    const body = buildQuickReplyBody({
      mensagem: "Oi! Quanto fica o botox?",
      situacao: "preco",
      procedimento: "botox",
      clinica: { nome_clinica: " Clínica Aurora ", formalidade: 80, como_chamar: "nenhum" },
    });
    expect(body.situacao).toBe("preco");
    expect(body.procedimento).toBe("botox");
    expect(body.clinica).toEqual({
      nome_clinica: "Clínica Aurora",
      formalidade: 80,
      como_chamar: "nenhum",
      cta_preferido: "marcar uma avaliação",
    });
  });

  it("lê as 3 respostas e o aviso do modo demonstração", () => {
    const result = readQuickReplyResponse(200, {
      respostas: { curta: "A", consultiva: "B", persuasiva: "C" },
      mock: true,
    });
    expect(result).toEqual({
      ok: true,
      respostas: { curta: "A", consultiva: "B", persuasiva: "C" },
      mock: true,
      aviso: expect.stringContaining("Modo demonstração"),
    });
  });

  it("mostra a mensagem da API no limite diário (429)", () => {
    expect(
      readQuickReplyResponse(429, {
        error: "Limite diário de respostas atingido. Tente de novo amanhã.",
        dailyLimit: true,
      })
    ).toEqual({
      ok: false,
      tipo: "limite_diario",
      mensagem: "Limite diário de respostas atingido. Tente de novo amanhã.",
    });
    expect(readQuickReplyResponse(429, { dailyLimit: true })).toMatchObject({
      tipo: "limite_diario",
      mensagem: QUICK_REPLY_ERRORS.limiteDiario,
    });
  });

  it("trata erro da API ou resposta vazia como falha amigável", () => {
    expect(readQuickReplyResponse(500, { error: "Erro interno do servidor." })).toEqual({
      ok: false,
      tipo: "api",
      mensagem: QUICK_REPLY_ERRORS.api,
    });
    // 429 do rate limit por minuto (sem dailyLimit) também vira erro genérico.
    expect(readQuickReplyResponse(429, { error: "Muitas requisições" })).toMatchObject({
      tipo: "api",
    });
    expect(readQuickReplyResponse(200, { respostas: { curta: "  " } })).toMatchObject({
      ok: false,
      tipo: "api",
    });
    expect(readQuickReplyResponse(200, null)).toMatchObject({ ok: false });
  });
});
