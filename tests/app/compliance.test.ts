import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { auditarCompliance, verifyToken, adminConfigured, reserve, release } = vi.hoisted(() => ({
  auditarCompliance: vi.fn(),
  verifyToken: vi.fn(),
  adminConfigured: vi.fn(),
  reserve: vi.fn(),
  release: vi.fn(),
}));

vi.mock("@/lib/ai/provider", () => ({ auditarCompliance }));
vi.mock("@/lib/firebase/admin", () => ({ verifyFirebaseIdToken: verifyToken, isFirebaseAdminConfigured: adminConfigured }));
vi.mock("@/lib/usage-limit", () => ({ reserveGeneration: reserve, releaseGeneration: release }));

import { POST } from "@/app/api/compliance/route";
import { __resetAiGuardForTests } from "@/lib/ai-guard";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/compliance", {
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
  auditarCompliance.mockReset().mockResolvedValue({
    aprovado: true,
    problemas: [],
  });
  verifyToken.mockReset().mockResolvedValue(null);
  adminConfigured.mockReset().mockReturnValue(true);
  reserve.mockReset().mockResolvedValue({ allowed: true, paid: true, remaining: Infinity, reserved: false });
  release.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/compliance", () => {
  it("returns 400 when texto is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(auditarCompliance).not.toHaveBeenCalled();
  });

  it("returns 400 when texto is empty string", async () => {
    const res = await POST(makeRequest({ texto: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 200 with valid texto", async () => {
    const res = await POST(makeRequest({ texto: "Agende sua avaliação!" }));
    expect(res.status).toBe(200);
    expect(auditarCompliance).toHaveBeenCalledTimes(1);
  });

  it("passes texto to auditarCompliance trimmed", async () => {
    await POST(makeRequest({ texto: "  algum texto  " }));
    expect(auditarCompliance).toHaveBeenCalledWith(
      expect.objectContaining({ texto: "algum texto" })
    );
  });

  it("filters providerChain to valid providers only", async () => {
    await POST(
      makeRequest({
        texto: "teste",
        providerChain: ["openai", "invalid", "anthropic", "gemini", 42],
      })
    );
    expect(auditarCompliance).toHaveBeenCalledWith(
      expect.objectContaining({
        providerChain: ["openai", "anthropic", "gemini"],
      })
    );
  });

  it("omits providerChain when empty after filtering", async () => {
    await POST(
      makeRequest({
        texto: "teste",
        providerChain: ["invalid", "nope"],
      })
    );
    expect(auditarCompliance).toHaveBeenCalledWith(
      expect.objectContaining({ providerChain: undefined })
    );
  });

  it("omits providerChain when not an array", async () => {
    await POST(makeRequest({ texto: "teste", providerChain: "openai" }));
    expect(auditarCompliance).toHaveBeenCalledWith(
      expect.objectContaining({ providerChain: undefined })
    );
  });

  it("returns 500 when AI provider throws", async () => {
    auditarCompliance.mockRejectedValue(new Error("AI down"));
    const res = await POST(makeRequest({ texto: "teste" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 402 when a logged-in free user has exhausted the shared quota", async () => {
    verifyToken.mockResolvedValue({ uid: "free-user" });
    reserve.mockResolvedValue({ allowed: false, paid: false, remaining: 0, reserved: false });
    const res = await POST(makeRequest({ texto: "texto valido", firebaseIdToken: "valid" }));
    expect(res.status).toBe(402);
    await expect(res.json()).resolves.toMatchObject({ limitReached: true, freeRemaining: 0 });
    expect(auditarCompliance).not.toHaveBeenCalled();
  });

  it("releases a free slot when AI generation fails", async () => {
    verifyToken.mockResolvedValue({ uid: "free-user" });
    reserve.mockResolvedValue({ allowed: true, paid: false, remaining: 4, reserved: true });
    auditarCompliance.mockRejectedValue(new Error("AI down"));
    const res = await POST(makeRequest({ texto: "texto valido", firebaseIdToken: "valid" }));
    expect(res.status).toBe(500);
    expect(release).toHaveBeenCalledWith("free-user");
  });
});
