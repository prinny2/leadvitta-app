import { describe, it, expect } from "vitest";
import { mockGerador, mockNeutro, mockRefine, mockFollowup, softenText } from "@/lib/ai/mock";
import { afirmaDisponibilidade, reprovaGeracao } from "@/lib/ai/prompts";
import { situacoes } from "@/data/situacoes";
import type { GerarInput, RefineInput, FollowUpInput } from "@/lib/types";

describe("textos seguros não afirmam disponibilidade", () => {
  const procedimento = "botox";
  const comum = { procedimento, situacao: "preco", tom: "acolhedor", objetivo: "" };

  it("mockGerador faz o fechamento perguntando", () => {
    const r = mockGerador({ ...comum, modo: "gerar", mensagemCliente: "Oi" });
    expect(Object.values(r).some((t) => afirmaDisponibilidade(t))).toBe(false);
    expect(r.persuasiva).toContain("?");
  });

  it.each(["curta", "consultiva", "persuasiva"] as const)("mockRefine (%s)", (variante) => {
    const texto = mockRefine({ ...comum, variante, respostaAtual: "x", mensagemCliente: "Oi" });
    expect(afirmaDisponibilidade(texto)).toBe(false);
  });

  it("mockFollowup não afirma disponibilidade", () => {
    const msgs = mockFollowup({ gatilho: "sumiu_7d", contexto: "", procedimento, tom: "acolhedor" });
    expect(msgs.some((m) => afirmaDisponibilidade(m))).toBe(false);
    expect(msgs.join(" ")).not.toMatch(/abrimos|tenho horários|horário sugerido/i);
  });

  it.each(situacoes.map((s) => s.id))("mockNeutro não fala de preço nem reprova: %s", (situacao) => {
    const r = mockNeutro({ situacao });
    for (const texto of Object.values(r)) {
      expect(texto).not.toMatch(/valor|preço/i);
      expect(reprovaGeracao(texto)).toBe(false);
    }
  });

  it("no pós-atendimento e no review o texto seguro não pede horário", () => {
    for (const situacao of ["pos_atendimento", "pedir_avaliacao"]) {
      expect(Object.values(mockNeutro({ situacao })).join(" ")).not.toMatch(/horário/i);
    }
  });

  it.each(["agendar", "desmarcou", "pos_atendimento", "pedir_avaliacao"])(
    "mockGerador em %s não responde com preço",
    (situacao) => {
      const r = mockGerador({ ...comum, situacao, modo: "gerar", mensagemCliente: "Oi" });
      expect(Object.values(r).join(" ")).not.toMatch(/valor/i);
    }
  );

  it("mockRefine não fala de valor no fechamento", () => {
    const texto = mockRefine({ ...comum, variante: "persuasiva", respostaAtual: "x", mensagemCliente: "Oi" });
    expect(texto).not.toMatch(/valor/i);
  });

  it("softenText não introduz disponibilidade nem remove a da própria clínica", () => {
    const seguro = softenText("Resultado garantido, sem risco e custa R$ 900.");
    expect(afirmaDisponibilidade(seguro)).toBe(false);
    expect(softenText("Temos horários essa semana")).toBe("Temos horários essa semana");
  });
});

describe("mockGerador", () => {
  const base: GerarInput = {
    modo: "gerar",
    procedimento: "botox",
    situacao: "preco",
    tom: "acolhedor",
    objetivo: "",
    mensagemCliente: "Quanto custa?",
  };

  it("retorna as três variantes não vazias", () => {
    const r = mockGerador(base);
    expect(r.curta).toBeTruthy();
    expect(r.consultiva).toBeTruthy();
    expect(r.persuasiva).toBeTruthy();
  });

  it("usa o label do procedimento em minúsculas", () => {
    const r = mockGerador(base);
    expect(r.curta.toLowerCase()).toContain("botox (toxina botulínica)");
  });

  it("usa 'o procedimento' como fallback para id desconhecido", () => {
    const r = mockGerador({ ...base, procedimento: "inexistente" });
    expect(r.curta).toContain("o procedimento");
  });

  describe("abertura conforme o DNA (como_chamar)", () => {
    it("'linda' sem nome => 'Oi, linda!'", () => {
      const r = mockGerador({ ...base, clinica: { como_chamar: "linda" } });
      expect(r.curta.startsWith("Oi, linda!")).toBe(true);
    });

    it("'linda' com nome => usa o nome", () => {
      const r = mockGerador({
        ...base,
        nomeCliente: "Ana",
        clinica: { como_chamar: "linda" },
      });
      expect(r.curta.startsWith("Oi, Ana!")).toBe(true);
    });

    it("'amor' sem nome => 'Oi, amor!'", () => {
      const r = mockGerador({ ...base, clinica: { como_chamar: "amor" } });
      expect(r.curta.startsWith("Oi, amor!")).toBe(true);
    });

    it("'amor' com nome => 'Oi, {nome}, amor!'", () => {
      const r = mockGerador({
        ...base,
        nomeCliente: "Bia",
        clinica: { como_chamar: "amor" },
      });
      expect(r.curta.startsWith("Oi, Bia, amor!")).toBe(true);
    });

    it("'nenhum' sem nome => 'Oi, tudo bem?'", () => {
      const r = mockGerador({ ...base, clinica: { como_chamar: "nenhum" } });
      expect(r.curta.startsWith("Oi, tudo bem?")).toBe(true);
    });
  });
});

describe("mockRefine", () => {
  const base: RefineInput = {
    variante: "curta",
    respostaAtual: "x",
    procedimento: "botox",
    situacao: "preco",
    tom: "acolhedor",
    objetivo: "",
    mensagemCliente: "Quanto custa?",
  };

  it("retorna uma string para cada variante conhecida", () => {
    expect(typeof mockRefine({ ...base, variante: "curta" })).toBe("string");
    expect(typeof mockRefine({ ...base, variante: "consultiva" })).toBe("string");
    expect(typeof mockRefine({ ...base, variante: "persuasiva" })).toBe("string");
  });

  it("a variante consultiva capitaliza o procedimento", () => {
    const out = mockRefine({ ...base, variante: "consultiva" });
    expect(out).toContain("Botox (toxina botulínica)");
  });

  it("variante desconhecida cai no caminho persuasivo (default)", () => {
    const out = mockRefine({ ...base, variante: "inexistente" as RefineInput["variante"] });
    expect(out).toContain("horário de avaliação");
  });
});

describe("mockFollowup", () => {
  it("retorna exatamente 3 mensagens não vazias", () => {
    const msgs = mockFollowup({
      gatilho: "sumiu_1h",
      contexto: "",
      procedimento: "botox",
      tom: "acolhedor",
      nomeCliente: "Ana",
      clinica: { como_chamar: "nome" },
    } as FollowUpInput);
    expect(msgs).toHaveLength(3);
    expect(msgs.every((m) => m.length > 0)).toBe(true);
    expect(msgs[0].startsWith("Oi, Ana!")).toBe(true);
  });
});
