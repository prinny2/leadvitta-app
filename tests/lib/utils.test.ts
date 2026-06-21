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

describe("numeroDigits", () => {
  it("remove +, espaços e máscara, deixando só dígitos", () => {
    expect(numeroDigits("+55 (11) 99999-8888")).toBe("5511999998888");
  });

  it("trata null/undefined/'' como string vazia", () => {
    expect(numeroDigits(null)).toBe("");
    expect(numeroDigits(undefined)).toBe("");
    expect(numeroDigits("")).toBe("");
  });

  it("devolve '' quando não há nenhum dígito", () => {
    expect(numeroDigits("sem numero")).toBe("");
  });
});

describe("candidatosNumero", () => {
  it("devolve [] para entrada vazia/sem dígitos", () => {
    expect(candidatosNumero("")).toEqual([]);
    expect(candidatosNumero(null)).toEqual([]);
    expect(candidatosNumero("abc")).toEqual([]);
  });

  it("gera variantes com/sem DDI 55 a partir de um celular completo", () => {
    const out = candidatosNumero("+55 11 99999-8888");
    // dígitos puros, base sem 55 e base com 55
    expect(out).toContain("5511999998888");
    expect(out).toContain("11999998888");
    // sem o nono dígito, com e sem DDI
    expect(out).toContain("1199998888");
    expect(out).toContain("551199998888");
  });

  it("a partir de um número SEM DDI gera a forma com 55", () => {
    const out = candidatosNumero("11999998888");
    expect(out).toContain("11999998888");
    expect(out).toContain("5511999998888");
  });

  it("número de 10 dígitos (sem o 9) gera a variante com o nono dígito", () => {
    const out = candidatosNumero("1133334444");
    expect(out).toContain("1133334444");
    expect(out).toContain("11933334444");
    expect(out).toContain("551133334444");
    expect(out).toContain("5511933334444");
  });

  it("não passa de 10 candidatos (limite do operador `in` do Firestore)", () => {
    const out = candidatosNumero("+55 11 99999-8888");
    expect(out.length).toBeLessThanOrEqual(10);
  });

  it("não retorna duplicatas", () => {
    const out = candidatosNumero("5511999998888");
    expect(new Set(out).size).toBe(out.length);
  });
});
