import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({
  isFirebaseAdminConfigured: vi.fn().mockReturnValue(false),
}));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns status ok with readiness flags", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("leadbellus");
    expect(typeof body.time).toBe("string");
  });

  it("includes readiness object with expected keys", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.readiness).toBeDefined();
    expect(typeof body.readiness.ai).toBe("boolean");
    expect(typeof body.readiness.firebase).toBe("boolean");
    expect(typeof body.readiness.stripe).toBe("boolean");
    expect(body.readiness.whatsapp_provider).toBe("zapi");
  });

  it("includes ai_providers object", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.ai_providers).toBeDefined();
    expect(typeof body.ai_providers.openai).toBe("boolean");
    expect(typeof body.ai_providers.anthropic).toBe("boolean");
    expect(typeof body.ai_providers.gemini).toBe("boolean");
  });
});
