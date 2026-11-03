import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { gerarFollowUp, verifyToken, adminConfigured, reserve, release } = vi.hoisted(() => ({
  gerarFollowUp: vi.fn(),
  verifyToken: vi.fn(),
  adminConfigured: vi.fn(),
  reserve: vi.fn(),
  release: vi.fn(),
}));

vi.mock("@/lib/ai/provider", () => ({ gerarFollowUp }));
vi.mock("@/lib/firebase/admin", () => ({ verifyFirebaseIdToken: verifyToken, isFirebaseAdminConfigured: adminConfigured }));
vi.mock("@/lib/usage-limit", () => ({ reserveGeneration: reserve, releaseGeneration: release }));

import { POST } from "@/app/api/follow-up/route";
import { __resetAiGuardForTests } from "@/lib/ai-guard";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/follow-up", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  __resetAiGuardForTests();
  vi.stubEnv("AI_ANON_DAILY_LIMIT", "15");
  gerarFollowUp.mockReset().mockResolvedValue({ texto: "Follow-up gerado" });
  verifyToken.mockReset().mockResolvedValue(null);
  adminConfigured.mockReset().mockReturnValue(true);
  reserve.mockReset().mockResolvedValue({ allowed: true, paid: true, remaining: Infinity, reserved: false });
  release.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/follow-up", () => {
  it("returns 400 when gatilho is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(gerarFollowUp).not.toHaveBeenCalled();
  });

  it("returns 400 when gatilho is empty string", async () => {
    const res = await POST(makeRequest({ gatilho: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 with valid gatilho", async () => {
    const res = await POST(makeRequest({ gatilho: "sumiu_3_dias" }));
    expect(res.status).toBe(200);
    expect(gerarFollowUp).toHaveBeenCalledTimes(1);
    expect(gerarFollowUp).toHaveBeenCalledWith(
      expect.objectContaining({ gatilho: "sumiu_3_dias" })
    );
  });

  it("fills optional fields with defaults", async () => {
    await POST(makeRequest({ gatilho: "sumiu_7_dias" }));
    expect(gerarFollowUp).toHaveBeenCalledWith(
      expect.objectContaining({
        gatilho: "sumiu_7_dias",
        contexto: "",
        detalhe: "",
        procedimento: "",
        tom: "acolhedor",
      })
    );
  });

  it("passes through all optional fields when provided", async () => {
    const body = {
      gatilho: "sumiu_3_dias",
      contexto: "cliente perguntou preço",
      detalhe: "botox na testa",
      procedimento: "botox",
      tom: "persuasivo",
      nomeCliente: "Ana",
      clinica: { nome_clinica: "Bella" },
    };
    await POST(makeRequest(body));
    expect(gerarFollowUp).toHaveBeenCalledWith(
      expect.objectContaining({
        gatilho: "sumiu_3_dias",
        contexto: "cliente perguntou preço",
        procedimento: "botox",
        tom: "persuasivo",
        nomeCliente: "Ana",
      })
    );
  });

  it("returns 500 when AI provider throws", async () => {
    gerarFollowUp.mockRejectedValue(new Error("AI down"));
    const res = await POST(makeRequest({ gatilho: "sumiu_3_dias" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 402 when a logged-in free user has exhausted the shared quota", async () => {
    verifyToken.mockResolvedValue({ uid: "free-user" });
    reserve.mockResolvedValue({ allowed: false, paid: false, remaining: 0, reserved: false });
    const res = await POST(makeRequest({ gatilho: "sumiu_3_dias", firebaseIdToken: "valid" }));
    expect(res.status).toBe(402);
    await expect(res.json()).resolves.toMatchObject({ limitReached: true, freeRemaining: 0 });
    expect(gerarFollowUp).not.toHaveBeenCalled();
  });

  it("releases a free slot when AI generation fails", async () => {
    verifyToken.mockResolvedValue({ uid: "free-user" });
    reserve.mockResolvedValue({ allowed: true, paid: false, remaining: 4, reserved: true });
    gerarFollowUp.mockRejectedValue(new Error("AI down"));
    const res = await POST(makeRequest({ gatilho: "sumiu_3_dias", firebaseIdToken: "valid" }));
    expect(res.status).toBe(500);
    expect(release).toHaveBeenCalledWith("free-user");
  });

  it("returns 429 when anonymous daily cap is reached", async () => {
    vi.stubEnv("AI_ANON_DAILY_LIMIT", "1");
    expect((await POST(makeRequest({ gatilho: "sumiu_3_dias" }))).status).toBe(200);
    const res = await POST(makeRequest({ gatilho: "sumiu_3_dias" }));
    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toMatchObject({ dailyLimit: true });
  });
});
