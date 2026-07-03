import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { gerarFollowUp } = vi.hoisted(() => ({
  gerarFollowUp: vi.fn(),
}));

vi.mock("@/lib/ai/provider", () => ({ gerarFollowUp }));

import { POST } from "@/app/api/follow-up/route";

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
  gerarFollowUp.mockReset().mockResolvedValue({ texto: "Follow-up gerado" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
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
});
