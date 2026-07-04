import { describe, expect, it } from "vitest";

import {
  fallbackResponse,
  getStepFromUrl,
} from "@/app/(marketing)/onboarding/helpers";
import { clinicaVazia } from "@/lib/types";

describe("marketing onboarding helpers", () => {
  it("usa frase correta sem nome de clínica", () => {
    const response = fallbackResponse(clinicaVazia);

    expect(response).toContain("diferente. A gente prefere");
  });

  it("bloqueia etapas avançadas sem nome de clínica na URL", () => {
    expect(getStepFromUrl("resposta", "")).toBe("clinica");
    expect(getStepFromUrl("planos", "  ")).toBe("clinica");
    expect(getStepFromUrl("planos", "Espaço Vida")).toBe("planos");
  });
});
