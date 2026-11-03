import { describe, expect, it, vi } from "vitest";
import { trackFreeGeneration } from "@/lib/analytics/free-generation";
import { dispatchMetaEvent } from "@/lib/analytics/meta-event";

describe("eventos de analytics", () => {
  it("envia eventos padrão do Meta com track e eventos próprios com trackCustom", () => {
    const fbq = vi.fn();

    dispatchMetaEvent(fbq, "sign_up", { method: "Onboarding" });
    dispatchMetaEvent(fbq, "checkout_click", { value: 97 });
    dispatchMetaEvent(fbq, "purchase", { value: 97 });
    dispatchMetaEvent(fbq, "contact_whatsapp", { placement: "header" });
    dispatchMetaEvent(fbq, "view_demo", { content_name: "landing_demo" });
    dispatchMetaEvent(fbq, "free_generation", { source: "gerador", mock: true });
    dispatchMetaEvent(fbq, "cta_click", { placement: "hero" });

    expect(fbq.mock.calls).toEqual([
      ["track", "Lead", { method: "Onboarding" }],
      ["track", "InitiateCheckout", { value: 97 }],
      ["track", "Purchase", { value: 97 }],
      ["track", "Contact", { placement: "header" }],
      ["track", "ViewContent", { content_name: "landing_demo" }],
      ["trackCustom", "free_generation", { source: "gerador", mock: true }],
      ["trackCustom", "cta_click", { placement: "hero" }],
    ]);
  });

  it("não registra free_generation em resposta falha ou sem respostas", () => {
    const track = vi.fn();

    trackFreeGeneration("gerador", {
      ok: false,
      respostas: { curta: "Resposta exemplo" },
    }, track);
    trackFreeGeneration("gerador", { ok: true, respostas: {} }, track);

    expect(track).not.toHaveBeenCalled();
  });

  it("registra free_generation apenas com respostas e sem conteúdo sensível", () => {
    const track = vi.fn();

    trackFreeGeneration("landing_demo", {
      ok: true,
      mock: true,
      respostas: { consultiva: "Uma resposta" },
    }, track);

    expect(track).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledWith("free_generation", {
      source: "landing_demo",
      mock: true,
    });
  });
});
