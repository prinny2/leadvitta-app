import { describe, it, expect } from "vitest";
import {
  comoChamarInstrucao,
  formalidadeLabel,
  comoChamarOptions,
  ctaOptions,
  objetivoOptions,
  oQueMelhorarOptions,
  followupContextoOptions,
} from "@/data/opcoes";

describe("comoChamarInstrucao", () => {
  it("'amor' com e sem nome", () => {
    expect(comoChamarInstrucao("amor", "Ana")).toContain('"Ana"');
    expect(comoChamarInstrucao("amor", "Ana")).toContain("amor");
    expect(comoChamarInstrucao("amor")).toContain('"amor"');
  });

  it("'nome' não usa apelidos carinhosos", () => {
    expect(comoChamarInstrucao("nome", "Bia")).toContain('"Bia"');
    expect(comoChamarInstrucao("nome")).toContain("não use apelidos");
  });

  it("'nenhum' evita 'linda/amor'", () => {
    expect(comoChamarInstrucao("nenhum", "Bia")).toContain("não use apelidos");
    expect(comoChamarInstrucao("nenhum")).toContain("não use apelidos");
  });

  it("'linda' é o padrão (inclusive para valores desconhecidos)", () => {
    expect(comoChamarInstrucao("linda")).toContain('"linda"');
    expect(comoChamarInstrucao(undefined)).toContain('"linda"');
    expect(comoChamarInstrucao("xpto")).toContain('"linda"');
    expect(comoChamarInstrucao("linda", "Ana")).toContain('"Ana"');
  });
});

describe("formalidadeLabel", () => {
  it.each([
    [0, "Bem íntimo e acolhedor"],
    [24, "Bem íntimo e acolhedor"],
    [25, "Próximo e caloroso"],
    [49, "Próximo e caloroso"],
    [50, "Equilibrado (caloroso, mas profissional)"],
    [74, "Equilibrado (caloroso, mas profissional)"],
    [75, "Mais formal e técnico"],
    [100, "Mais formal e técnico"],
  ])("%i => %s", (n, esperado) => {
    expect(formalidadeLabel(n)).toBe(esperado);
  });
});

describe("listas de opções", () => {
  it("expõem listas não vazias com value/label", () => {
    for (const lista of [
      comoChamarOptions,
      ctaOptions,
      objetivoOptions,
      oQueMelhorarOptions,
      followupContextoOptions,
    ]) {
      expect(lista.length).toBeGreaterThan(0);
      expect(lista.every((o) => "value" in o && "label" in o)).toBe(true);
    }
  });
});
