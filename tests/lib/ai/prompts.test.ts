import { describe, it, expect } from "vitest";
import {
  buildGeradorUser,
  buildRefineUser,
  buildFollowupUser,
  violaCompliance,
  DENYLIST,
  SYSTEM_GERADOR,
} from "@/lib/ai/prompts";
import type { GerarInput, RefineInput, FollowUpInput } from "@/lib/types";

const clinica: GerarInput["clinica"] = {
  nome_clinica: "Clínica Bella",
  cidade: "Belém",
  formalidade: 40,
  como_chamar: "linda",
  cta_preferido: "marcar uma avaliação",
};

describe("buildGeradorUser", () => {
  const base: GerarInput = {
    modo: "gerar",
    procedimento: "botox",
    situacao: "preco",
    tom: "acolhedor",
    objetivo: "direcionar para a avaliação",
    nomeCliente: "Ana",
    mensagemCliente: "Quanto custa?",
    clinica,
  };

  it("inclui a tarefa de gerar e os dados do DNA da clínica", () => {
    const out = buildGeradorUser(base);
    expect(out).toContain("TAREFA: Gere 3 respostas");
    expect(out).toContain("Clínica: Clínica Bella — Belém.");
    expect(out).toContain('Mensagem da cliente: "Quanto custa?"');
  });

  it("injeta a inteligência do procedimento conhecido", () => {
    const out = buildGeradorUser(base);
    expect(out).toContain("Procedimento: Botox (toxina botulínica).");
    expect(out).toContain("Dúvidas comuns:");
    expect(out).toContain("Medos comuns:");
  });

  it("inclui situação, tom e objetivo quando informados", () => {
    const out = buildGeradorUser(base);
    expect(out).toContain("Situação: Perguntou o preço.");
    expect(out).toContain("Tom desejado: Acolhedor.");
    expect(out).toContain("Objetivo desta resposta: direcionar para a avaliação.");
  });

  it("usa o id cru quando o procedimento é desconhecido", () => {
    const out = buildGeradorUser({ ...base, procedimento: "procedimento_x" });
    expect(out).toContain("Procedimento: procedimento_x.");
    expect(out).not.toContain("Dúvidas comuns:");
  });

  it("no modo reescrever usa a tarefa de reescrita e lista o que melhorar", () => {
    const out = buildGeradorUser({
      ...base,
      modo: "reescrever",
      oQueMelhorar: ["está fria ou seca", "parece robótica"],
    });
    expect(out).toContain("TAREFA: Reescreva a mensagem");
    expect(out).toContain("Pontos a melhorar: está fria ou seca; parece robótica.");
  });

  it("inclui perfil da cliente quando informado", () => {
    const out = buildGeradorUser({
      ...base,
      perfilCliente: "veio por indicação",
    });
    expect(out).toContain("Perfil da cliente: Indicação.");
  });
});

describe("buildRefineUser", () => {
  const base: RefineInput = {
    variante: "curta",
    respostaAtual: "Oi, te explico!",
    procedimento: "botox",
    situacao: "preco",
    tom: "acolhedor",
    objetivo: "fechar o agendamento",
    mensagemCliente: "Quanto custa?",
    clinica,
  };

  it("mapeia a variante para o nome e a postura corretos", () => {
    const out = buildRefineUser(base);
    expect(out).toContain('estilo "Suave"');
    expect(out).toContain("acolhe sem pressionar");
    expect(out).toContain('Resposta atual (a melhorar): "Oi, te explico!"');
  });

  it("usa a postura persuasiva para a variante persuasiva", () => {
    const out = buildRefineUser({ ...base, variante: "persuasiva" });
    expect(out).toContain('estilo "Fechamento"');
    expect(out).toContain("urgência leve");
  });
});

describe("buildFollowupUser", () => {
  const base: FollowUpInput = {
    gatilho: "sumiu_1h",
    contexto: "ela perguntou o preço",
    procedimento: "botox",
    tom: "acolhedor",
    clinica,
  };

  it("inclui a diretriz do gatilho de tempo e o contexto", () => {
    const out = buildFollowupUser(base);
    expect(out).toContain("TAREFA: Gere 3 mensagens de follow-up");
    expect(out).toContain("Tempo: Sumiu há 1 hora.");
    expect(out).toContain("Contexto da conversa: ela perguntou o preço.");
  });

  it("inclui o detalhe adicional quando presente", () => {
    const out = buildFollowupUser({ ...base, detalhe: "cliente VIP" });
    expect(out).toContain("Detalhe adicional: cliente VIP");
  });
});

describe("violaCompliance / DENYLIST", () => {
  it.each([
    "Esse tratamento tem resultado garantido",
    "É 100% seguro, pode confiar",
    "Procedimento sem risco nenhum",
    "Vai ficar perfeita",
    "Emagrece 10 quilos em uma sessão",
    "Cura o melasma de vez",
    "Eu garanto que você vai amar",
    "O botox custa R$ 900",
    "Fica em R$ 1200 e pronto",
    "Trabalhamos com preço fixo",
  ])("detecta promessa proibida: %s", (texto) => {
    expect(violaCompliance(texto)).toBe(true);
  });

  it.each([
    "O resultado varia de pessoa para pessoa e depende da avaliação.",
    "O investimento começa a partir de R$ 300, mas depende da avaliação.",
    "Fica tranquila, a gente avalia primeiro e te orienta.",
  ])("não acusa texto em conformidade: %s", (texto) => {
    expect(violaCompliance(texto)).toBe(false);
  });

  it("a denylist contém ao menos uma regra e todas são RegExp", () => {
    expect(DENYLIST.length).toBeGreaterThan(0);
    expect(DENYLIST.every((re) => re instanceof RegExp)).toBe(true);
  });
});

describe("SYSTEM prompts", () => {
  it("o system do gerador exige saída em JSON com as três chaves", () => {
    expect(SYSTEM_GERADOR).toContain("resposta_curta");
    expect(SYSTEM_GERADOR).toContain("resposta_consultiva");
    expect(SYSTEM_GERADOR).toContain("resposta_persuasiva");
  });
});
