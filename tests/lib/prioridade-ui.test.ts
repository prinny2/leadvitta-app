import { describe, it, expect } from "vitest";
import { PRIO, prioridadeFromScore } from "@/lib/prioridade-ui";

describe("PRIO lookup table", () => {
  it("contains entries for quente, morno, frio", () => {
    expect(PRIO.quente).toBeDefined();
    expect(PRIO.morno).toBeDefined();
    expect(PRIO.frio).toBeDefined();
  });

  it("each entry has emoji, label, and cls", () => {
    for (const key of ["quente", "morno", "frio"] as const) {
      expect(typeof PRIO[key].emoji).toBe("string");
      expect(typeof PRIO[key].label).toBe("string");
      expect(typeof PRIO[key].cls).toBe("string");
    }
  });
});

describe("prioridadeFromScore", () => {
  it("returns 'quente' for scores above 70", () => {
    expect(prioridadeFromScore(71)).toBe("quente");
    expect(prioridadeFromScore(85)).toBe("quente");
    expect(prioridadeFromScore(100)).toBe("quente");
  });

  it("returns 'morno' for scores between 41 and 70 (inclusive)", () => {
    expect(prioridadeFromScore(41)).toBe("morno");
    expect(prioridadeFromScore(55)).toBe("morno");
    expect(prioridadeFromScore(70)).toBe("morno");
  });

  it("returns 'frio' for scores 40 and below", () => {
    expect(prioridadeFromScore(40)).toBe("frio");
    expect(prioridadeFromScore(20)).toBe("frio");
    expect(prioridadeFromScore(0)).toBe("frio");
  });

  it("returns 'morno' for undefined or null", () => {
    expect(prioridadeFromScore(undefined)).toBe("morno");
    expect(prioridadeFromScore(null)).toBe("morno");
  });

  it("returns 'morno' for non-number types (string, boolean)", () => {
    expect(prioridadeFromScore("42" as unknown as number)).toBe("morno");
    expect(prioridadeFromScore(true as unknown as number)).toBe("morno");
  });

  it("handles boundary values exactly", () => {
    expect(prioridadeFromScore(70)).toBe("morno");
    expect(prioridadeFromScore(71)).toBe("quente");
    expect(prioridadeFromScore(40)).toBe("frio");
    expect(prioridadeFromScore(41)).toBe("morno");
  });
});
