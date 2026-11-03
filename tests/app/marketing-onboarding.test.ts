import { describe, expect, it } from "vitest";

import {
  ctaLabel,
  fallbackResponse,
  getTreatment,
  resolveOnboardingView,
} from "@/app/(marketing)/onboarding/helpers";
import { clinicaVazia } from "@/lib/types";

describe("marketing onboarding helpers", () => {
  it("usa frase correta sem nome de clínica", () => {
    const response = fallbackResponse(clinicaVazia);

    expect(response).toContain("diferente. A gente prefere");
  });

  it("escreve o exemplo em português acentuado", () => {
    const response = fallbackResponse({
      ...clinicaVazia,
      nome_clinica: "Espaço Vida",
    });

    expect(response).toContain("Espaço Vida");
    expect(response).toContain("avaliação");
    expect(response).toContain("você");
    // Nenhuma das palavras acentuadas pode aparecer "crua" no funil público.
    expect(response).not.toMatch(/avaliacao|voce|clinica\b/);
  });

  it("trata a cliente conforme o DNA da clínica", () => {
    expect(getTreatment("amor")).toBe("amor");
    expect(getTreatment("nenhum")).toBe("");
    expect(getTreatment("qualquer-outro")).toBe("linda");
    expect(fallbackResponse({ ...clinicaVazia, como_chamar: "nenhum" })).toMatch(
      /^Oi! /
    );
  });

  it("mostra o rótulo curto do CTA, não o texto do prompt", () => {
    expect(ctaLabel("marcar uma avaliação")).toBe("Marcar avaliação");
    expect(ctaLabel("ver os horários da agenda")).toBe("Ver agenda");
    // CTA personalizado (fora da lista) aparece como foi escrito.
    expect(ctaLabel("chamar no direct")).toBe("chamar no direct");
    expect(ctaLabel("   ")).toBe("Marcar avaliação");
  });

  it("abre os planos acima do teste na volta do checkout cancelado, mesmo sem nome salvo", () => {
    // cancel_url do Stripe para visitante (tests/app/stripe-checkout.test.ts).
    const url = new URL("https://www.leadbellus.com.br/onboarding?checkout=cancelado&aba=planos");
    expect(
      resolveOnboardingView(
        url.searchParams.get("plan"),
        url.searchParams.get("aba"),
        url.searchParams.get("checkout")
      )
    ).toEqual({ showPlans: true, plansFirst: true });
    expect(resolveOnboardingView(null, null, "cancelado")).toEqual({
      showPlans: true,
      plansFirst: true,
    });
  });

  it("abre os planos com `?aba=planos` sem exigir clínica cadastrada", () => {
    expect(resolveOnboardingView(null, "planos", null)).toEqual({
      showPlans: true,
      plansFirst: true,
    });
  });

  it("`?plan=` mostra os planos, mas o teste continua sendo a 1ª tela", () => {
    expect(resolveOnboardingView("start", null, null)).toEqual({
      showPlans: true,
      plansFirst: false,
    });
  });

  it("sem parâmetro (ou com aba/checkout desconhecidos) começa só pelo teste", () => {
    expect(resolveOnboardingView(null, null, null)).toEqual({
      showPlans: false,
      plansFirst: false,
    });
    expect(resolveOnboardingView(null, "resposta", null)).toEqual({
      showPlans: false,
      plansFirst: false,
    });
    // O sucesso não abre planos: o banner pede para criar/entrar com o e-mail.
    expect(resolveOnboardingView(null, null, "sucesso")).toEqual({
      showPlans: false,
      plansFirst: false,
    });
  });
});
