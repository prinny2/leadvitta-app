import { describe, it, expect } from "vitest";
import { cn, formatarData, numeroDigits, candidatosNumero } from "@/lib/utils";

describe("cn", () => {
  it("junta classes simples", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignora valores falsy (false/undefined/null/'')", () => {
    expect(cn("a", false && "b", undefined, null, "", "c")).toBe("a c");
  });

  it("resolve conflitos do Tailwind mantendo a última classe", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("aceita objetos condicionais (clsx)", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});

describe("numeroDigits", () => {
  it("mantém só os dígitos (remove +, espaços, máscara)", () => {
    expect(numeroDigits("+55 (91) 98515-6690")).toBe("5591985156690");
    expect(numeroDigits("whatsapp:+5591985156690")).toBe("5591985156690");
  });

  it("tolera null/undefined/vazio retornando string vazia", () => {
    expect(numeroDigits(null)).toBe("");
    expect(numeroDigits(undefined)).toBe("");
    expect(numeroDigits("")).toBe("");
  });
});

describe("candidatosNumero", () => {
  it("retorna [] para entrada vazia", () => {
    expect(candidatosNumero("")).toEqual([]);
    expect(candidatosNumero(null)).toEqual([]);
  });

  it("gera variantes com/sem DDI 55 a partir de um número com DDI", () => {
    // 55 + DDD(91) + 9 dígitos → deve casar com e sem o 55.
    const cands = candidatosNumero("5591985156690");
    expect(cands).toContain("5591985156690");
    expect(cands).toContain("91985156690");
  });

  it("gera a variante SEM o nono dígito para celular BR de 11 dígitos", () => {
    // 91 9 8515-6690 → sem o 9: 91 8515-6690.
    const cands = candidatosNumero("91985156690");
    expect(cands).toContain("91985156690"); // com 9
    expect(cands).toContain("9185156690"); // sem 9
    expect(cands).toContain("5591985156690"); // com DDI
    expect(cands).toContain("559185156690"); // DDI + sem 9
  });

  it("gera a variante COM o nono dígito para número de 10 dígitos", () => {
    // 91 8515-6690 (10 dígitos) → com 9: 91 9 8515-6690.
    const cands = candidatosNumero("9185156690");
    expect(cands).toContain("9185156690"); // sem 9
    expect(cands).toContain("91985156690"); // com 9
  });

  it("deduplica e respeita o limite de 10 candidatos", () => {
    const cands = candidatosNumero("5591985156690");
    expect(new Set(cands).size).toBe(cands.length);
    expect(cands.length).toBeLessThanOrEqual(10);
  });
});

describe("formatarData", () => {
  it("formata uma data ISO em dd/mm/aaaa hh:mm", () => {
    const out = formatarData("2026-06-15T21:30:00.000Z");
    expect(out).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(out).toMatch(/\d{2}:\d{2}/);
  });

  it("não lança para entrada inválida", () => {
    expect(() => formatarData("isto-nao-e-data")).not.toThrow();
    expect(typeof formatarData("isto-nao-e-data")).toBe("string");
  });
});
