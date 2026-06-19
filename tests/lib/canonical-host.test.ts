import { describe, expect, it, vi } from "vitest";
import {
  buildCanonicalRedirectUrl,
  isLegacyPublicHost,
  shouldKeepLegacyApiRoute,
} from "@/lib/canonical-host";

describe("canonical-host", () => {
  it("detecta hosts legados do Cloud Run / Firebase", () => {
    expect(
      isLegacyPublicHost("leadbellus-3zi7un52ua-rj.a.run.app")
    ).toBe(true);
    expect(
      isLegacyPublicHost("leadbellus-87102725202.southamerica-east1.run.app")
    ).toBe(true);
    expect(isLegacyPublicHost("leadvitta-app.web.app")).toBe(true);
    expect(isLegacyPublicHost("www.leadbellus.com.br")).toBe(false);
    expect(isLegacyPublicHost("leadbellus.com.br")).toBe(false);
    expect(isLegacyPublicHost("localhost")).toBe(false);
  });

  it("mantém webhooks e health em hosts legados", () => {
    expect(shouldKeepLegacyApiRoute("/api/stripe/webhook")).toBe(true);
    expect(shouldKeepLegacyApiRoute("/api/whatsapp/webhook")).toBe(true);
    expect(shouldKeepLegacyApiRoute("/api/health")).toBe(true);
    expect(shouldKeepLegacyApiRoute("/api/stripe/checkout")).toBe(false);
    expect(shouldKeepLegacyApiRoute("/")).toBe(false);
  });

  it("monta redirect para www preservando path e query", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leadbellus.com.br");
    const target = buildCanonicalRedirectUrl(
      new URL("https://leadbellus-3zi7un52ua-rj.a.run.app/dashboard?x=1"),
      "/dashboard",
      "?x=1"
    );
    expect(target.toString()).toBe(
      "https://www.leadbellus.com.br/dashboard?x=1"
    );
  });
});