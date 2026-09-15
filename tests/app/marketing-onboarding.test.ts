import { describe, expect, it } from "vitest";

import {
  ctaLabel,
  fallbackResponse,
  getStepFromUrl,
  getTreatment,
  resolveUrlStep,
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

  it("bloqueia etapas avançadas sem nome de clínica na URL", () => {
    expect(getStepFromUrl("resposta", "")).toBe("clinica");
    expect(getStepFromUrl("planos", "  ")).toBe("clinica");
    expect(getStepFromUrl("planos", "Espaço Vida")).toBe("planos");
  });

  it("não pula etapas enquanto a pessoa digita o nome da clínica", () => {
    // Com `?plan=start` e nada salvo, cada tecla digitada NÃO pode reposicionar
    // o funil — só o nome já gravado conta.
    expect(resolveUrlStep("start", null, "")).toBe("clinica");
    expect(resolveUrlStep("start", null, "E")).toBe("planos");
    expect(resolveUrlStep("start", null, "   ")).toBe("clinica");
  });

  it("leva direto aos planos quem chega por `?plan=` já com clínica salva", () => {
    expect(resolveUrlStep("start", null, "Espaço Vida")).toBe("planos");
    // `?plan=` vence a aba pedida na URL.
    expect(resolveUrlStep("start", "resposta", "Espaço Vida")).toBe("planos");
  });

  it("respeita `?aba=` quando não há plano na URL", () => {
    expect(resolveUrlStep(null, "resposta", "Espaço Vida")).toBe("resposta");
    expect(resolveUrlStep(null, "planos", "Espaço Vida")).toBe("planos");
    expect(resolveUrlStep(null, null, "Espaço Vida")).toBe("clinica");
    expect(resolveUrlStep(null, "planos", "")).toBe("clinica");
  });

  it("ignora aba desconhecida na URL", () => {
    expect(getStepFromUrl("qualquer", "Espaço Vida")).toBe("clinica");
    expect(getStepFromUrl(null, "Espaço Vida")).toBe("clinica");
  });
});
