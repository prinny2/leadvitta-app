import { describe, it, expect } from "vitest";
import { cn, formatarData } from "@/lib/utils";

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
