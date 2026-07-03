import { describe, it, expect } from "vitest";
import {
  palette,
  fontFamily,
  borderRadius,
  boxShadow,
  keyframes,
  animation,
  tokens,
} from "@/lib/design-system/tokens";

describe("palette", () => {
  it("contains all expected color families", () => {
    expect(palette.nude).toBeDefined();
    expect(palette.brand).toBeDefined();
    expect(palette.gold).toBeDefined();
    expect(palette.lavender).toBeDefined();
    expect(palette.pain).toBeDefined();
    expect(palette.navy).toBeDefined();
    expect(palette.champagne).toBeDefined();
  });

  it("brand has shade 500 matching the LeadBellus brand hex", () => {
    expect(palette.brand[500]).toBe("#0E3A30");
    expect(palette.brand.dark).toBe("#0E3A30");
  });

  it("all hex values are valid #RRGGBB format", () => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    for (const [, family] of Object.entries(palette)) {
      if (typeof family === "string") {
        expect(family).toMatch(hexRe);
      } else {
        for (const [, hex] of Object.entries(family)) {
          expect(hex).toMatch(hexRe);
        }
      }
    }
  });

  it("ink and muted are direct hex strings", () => {
    expect(palette.ink).toBe("#0E3A30");
    expect(typeof palette.muted).toBe("string");
  });
});

describe("fontFamily", () => {
  it("has sans and serif stacks", () => {
    expect(fontFamily.sans).toBeInstanceOf(Array);
    expect(fontFamily.serif).toBeInstanceOf(Array);
    expect(fontFamily.sans.length).toBeGreaterThan(0);
    expect(fontFamily.serif.length).toBeGreaterThan(0);
  });

  it("sans starts with Inter CSS variable", () => {
    expect(fontFamily.sans[0]).toBe("var(--font-inter)");
  });

  it("serif starts with Fraunces CSS variable", () => {
    expect(fontFamily.serif[0]).toBe("var(--font-fraunces)");
  });
});

describe("borderRadius", () => {
  it("has 2xl and 3xl tokens", () => {
    expect(borderRadius["2xl"]).toBe("1rem");
    expect(borderRadius["3xl"]).toBe("1.5rem");
  });
});

describe("boxShadow", () => {
  it("has soft, card, and cta shadow definitions", () => {
    expect(typeof boxShadow.soft).toBe("string");
    expect(typeof boxShadow.card).toBe("string");
    expect(typeof boxShadow.cta).toBe("string");
  });
});

describe("keyframes", () => {
  it("has fade-in keyframe with from/to", () => {
    expect(keyframes["fade-in"].from).toBeDefined();
    expect(keyframes["fade-in"].to).toBeDefined();
  });

  it("has float keyframe with three stops", () => {
    expect(keyframes.float["0%, 100%"]).toBeDefined();
    expect(keyframes.float["50%"]).toBeDefined();
  });
});

describe("animation", () => {
  it("defines fade-in, float, and float-delayed", () => {
    expect(typeof animation["fade-in"]).toBe("string");
    expect(typeof animation.float).toBe("string");
    expect(typeof animation["float-delayed"]).toBe("string");
  });
});

describe("tokens bundle", () => {
  it("aggregates all sub-tokens", () => {
    expect(tokens.colors).toBe(palette);
    expect(tokens.fontFamily).toBe(fontFamily);
    expect(tokens.borderRadius).toBe(borderRadius);
    expect(tokens.boxShadow).toBe(boxShadow);
    expect(tokens.keyframes).toBe(keyframes);
    expect(tokens.animation).toBe(animation);
  });
});
