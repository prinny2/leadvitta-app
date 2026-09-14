import { describe, expect, it } from "vitest";

import {
  buildCheckoutReturnPaths,
  parseCheckoutOrigin,
} from "@/lib/stripe/checkout-return";

describe("parseCheckoutOrigin", () => {
  it("aceita apenas origens conhecidas", () => {
    expect(parseCheckoutOrigin("onboarding")).toBe("onboarding");
    expect(parseCheckoutOrigin("app")).toBe("app");
  });

  it("recusa qualquer coisa fora do enum (sem redirecionamento aberto)", () => {
    expect(parseCheckoutOrigin("https://evil.example.com")).toBeNull();
    expect(parseCheckoutOrigin("//evil.example.com")).toBeNull();
    expect(parseCheckoutOrigin("")).toBeNull();
    expect(parseCheckoutOrigin(undefined)).toBeNull();
    expect(parseCheckoutOrigin(42)).toBeNull();
    expect(parseCheckoutOrigin({ toString: () => "onboarding" })).toBeNull();
  });
});

describe("buildCheckoutReturnPaths", () => {
  it("manda quem pagou sem conta para o cadastro", () => {
    const { successPath } = buildCheckoutReturnPaths({
      origin: "onboarding",
      signedIn: false,
    });

    expect(successPath).toContain("/signup");
    expect(successPath).toContain("session_id={CHECKOUT_SESSION_ID}");
  });

  it("manda quem já está logado para as configurações", () => {
    const { successPath } = buildCheckoutReturnPaths({
      origin: null,
      signedIn: true,
    });

    expect(successPath).toContain("/configuracoes");
  });

  it("devolve quem desistiu no funil para a etapa de planos", () => {
    for (const signedIn of [true, false]) {
      const { cancelPath } = buildCheckoutReturnPaths({
        origin: "onboarding",
        signedIn,
      });

      expect(cancelPath).toBe("/onboarding?aba=planos&checkout=cancelado");
    }
  });

  it("mantém o cancelamento antigo fora do funil", () => {
    expect(
      buildCheckoutReturnPaths({ origin: null, signedIn: true }).cancelPath
    ).toBe("/configuracoes?checkout=cancelado");
    expect(
      buildCheckoutReturnPaths({ origin: null, signedIn: false }).cancelPath
    ).toBe("/#demo");
  });
});
