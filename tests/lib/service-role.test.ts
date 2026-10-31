import { describe, expect, it } from "vitest";
import {
  SERVICE_ROLES,
  SERVICE_ROUTE_PREFIXES,
  getServiceRole,
  isPathServedByRole,
  listRoutesForRole,
} from "@/lib/service-role";

describe("service-role", () => {
  it("default é web e valores desconhecidos caem em web", () => {
    expect(getServiceRole({})).toBe("web");
    expect(getServiceRole({ SERVICE_ROLE: "" })).toBe("web");
    expect(getServiceRole({ SERVICE_ROLE: "banana" })).toBe("web");
    expect(getServiceRole({ SERVICE_ROLE: " Billing " })).toBe("billing");
    expect(getServiceRole({ SERVICE_ROLE: "ai" })).toBe("ai");
  });

  it("web serve qualquer caminho (páginas e API)", () => {
    expect(isPathServedByRole("web", "/")).toBe(true);
    expect(isPathServedByRole("web", "/dashboard")).toBe(true);
    expect(isPathServedByRole("web", "/api/stripe/webhook")).toBe(true);
  });

  it("papéis de API só servem sua própria superfície + health/config", () => {
    expect(isPathServedByRole("ai", "/api/generate")).toBe(true);
    expect(isPathServedByRole("ai", "/api/health")).toBe(true);
    expect(isPathServedByRole("ai", "/api/config")).toBe(true);
    expect(isPathServedByRole("ai", "/api/stripe/webhook")).toBe(false);
    expect(isPathServedByRole("ai", "/")).toBe(false);
    expect(isPathServedByRole("ai", "/dashboard")).toBe(false);

    expect(isPathServedByRole("billing", "/api/stripe/checkout")).toBe(true);
    expect(isPathServedByRole("billing", "/api/clerk/webhook")).toBe(true);
    expect(isPathServedByRole("billing", "/api/generate")).toBe(false);

    expect(isPathServedByRole("whatsapp", "/api/whatsapp/webhook")).toBe(true);
    expect(isPathServedByRole("whatsapp", "/api/waitlist")).toBe(false);

    expect(isPathServedByRole("growth", "/api/waitlist")).toBe(true);
    expect(isPathServedByRole("growth", "/api/zapier/lead")).toBe(true);
    expect(isPathServedByRole("growth", "/api/whatsapp/webhook")).toBe(false);
  });

  it("casa prefixo por segmento, não por substring", () => {
    expect(isPathServedByRole("ai", "/api/generate/extra")).toBe(true);
    expect(isPathServedByRole("ai", "/api/generatefoo")).toBe(false);
    expect(isPathServedByRole("ai", "/api/healthz")).toBe(false);
  });

  it("nenhuma rota de API pertence a dois papéis", () => {
    const seen = new Map<string, string>();
    for (const [role, prefixes] of Object.entries(SERVICE_ROUTE_PREFIXES)) {
      for (const prefix of prefixes) {
        expect(seen.has(prefix), `${prefix} já está em ${seen.get(prefix)}`).toBe(
          false
        );
        seen.set(prefix, role);
      }
    }
  });

  it("listRoutesForRole(web) é a união de todos os papéis", () => {
    const all = new Set(listRoutesForRole("web"));
    for (const role of SERVICE_ROLES) {
      for (const route of listRoutesForRole(role)) {
        expect(all.has(route)).toBe(true);
      }
    }
  });
});
