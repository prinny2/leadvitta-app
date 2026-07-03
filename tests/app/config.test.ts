import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({
  isFirebaseAdminConfigured: vi.fn().mockReturnValue(false),
}));

import { GET } from "@/app/api/config/route";

describe("GET /api/config", () => {
  it("returns feature flags without leaking secrets", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(typeof body.stripe_enabled).toBe("boolean");
    expect(typeof body.firebase_enabled).toBe("boolean");
    expect(typeof body.ai_enabled).toBe("boolean");
    expect(typeof body.nlp_enabled).toBe("boolean");
    expect(typeof body.ga4_server_enabled).toBe("boolean");
    expect(typeof body.ops_notify_enabled).toBe("boolean");
    expect(typeof body.zapi_enabled).toBe("boolean");
    expect(body.whatsapp_provider).toBe("zapi");
  });

  it("includes ai_providers and ai_models", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.ai_providers).toBeDefined();
    expect(typeof body.ai_providers.openai).toBe("boolean");
    expect(typeof body.ai_providers.anthropic).toBe("boolean");
    expect(typeof body.ai_providers.gemini).toBe("boolean");

    expect(body.ai_models).toBeDefined();
  });

  it("uses Cache-Control: no-store header", async () => {
    const res = await GET();
    expect(res.headers.get("cache-control")).toContain("no-store");
  });
});
