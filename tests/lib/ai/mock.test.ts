import { describe, it, expect } from "vitest";
import { mockGerador, mockRefine, mockFollowup } from "@/lib/ai/mock";
import type { GerarInput, RefineInput, FollowUpInput } from "@/lib/types";

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
