import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { auditarCompliance } = vi.hoisted(() => ({
  auditarCompliance: vi.fn(),
}));

vi.mock("@/lib/ai/provider", () => ({ auditarCompliance }));

import { POST } from "@/app/api/compliance/route";

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
  auditarCompliance.mockReset().mockResolvedValue({
    aprovado: true,
    problemas: [],
  });
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
});
