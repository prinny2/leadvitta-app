import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockNlpServiceUrl = vi.hoisted(() => ({ value: "" }));

vi.mock("@/lib/config", () => ({
  get nlpServiceUrl() {
    return mockNlpServiceUrl.value;
  },
}));

import { classificarViaNlpService } from "@/lib/ai/nlp-service";

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  mockNlpServiceUrl.value = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("classificarViaNlpService", () => {
  it("returns null when nlpServiceUrl is not configured", async () => {
    mockNlpServiceUrl.value = "";
    const result = await classificarViaNlpService("oi");
    expect(result).toBeNull();
  });

  it("calls the /analisar endpoint with the correct body", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          intencao: "quer agendar",
          sentimento: "4 stars",
        }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await classificarViaNlpService("quero marcar horario");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("http://nlp:8000/analisar");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ texto: "quero marcar horario" });

    expect(result).toEqual({
      intent: "agendamento",
      sentiment: "4 stars",
      score: 90, // base 85 + (4-3)*5 = 90
    });
  });

  it("maps 'pergunta de preço' to pergunta_preco", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "pergunta de preço",
            sentimento: "3 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("quanto custa botox?");
    expect(result).toEqual({
      intent: "pergunta_preco",
      sentiment: "3 stars",
      score: 60, // base 60 + (3-3)*5 = 60
    });
  });

  it("maps 'achou caro ou objeção' to objecao", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "achou caro ou objeção",
            sentimento: "2 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("muito caro");
    expect(result).toEqual({
      intent: "objecao",
      sentiment: "2 stars",
      score: 40, // base 45 + (2-3)*5 = 40
    });
  });

  it("maps 'dúvida sobre o procedimento' to duvida_tecnica", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "dúvida sobre o procedimento",
            sentimento: "3 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("como funciona?");
    expect(result).toEqual({
      intent: "duvida_tecnica",
      sentiment: "3 stars",
      score: 55,
    });
  });

  it("maps 'demonstra interesse' to demonstra_interesse", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "demonstra interesse",
            sentimento: "5 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("quero saber mais");
    expect(result).toEqual({
      intent: "demonstra_interesse",
      sentiment: "5 stars",
      score: 85, // base 75 + (5-3)*5 = 85
    });
  });

  it("maps 'vai pensar ou sem interesse' to desistencia", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "vai pensar ou sem interesse",
            sentimento: "1 star",
          }),
      })
    );

    const result = await classificarViaNlpService("vou pensar");
    expect(result).toEqual({
      intent: "desistencia",
      sentiment: "1 stars",
      score: 10, // base 20 + (1-3)*5 = 10
    });
  });

  it("maps 'pediu desconto' to objecao", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "pediu desconto",
            sentimento: "3 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("tem desconto?");
    expect(result).toEqual({
      intent: "objecao",
      sentiment: "3 stars",
      score: 45,
    });
  });

  it("returns null when the service returns !ok", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );

    const result = await classificarViaNlpService("oi");
    expect(result).toBeNull();
  });

  it("returns null on network error (fallback)", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED"))
    );

    const result = await classificarViaNlpService("oi");
    expect(result).toBeNull();
  });

  it("returns null when both intent and sentiment are missing", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ intencao: "", sentimento: "" }),
      })
    );

    const result = await classificarViaNlpService("oi");
    expect(result).toBeNull();
  });

  it("returns result with only sentiment when intent is unknown", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "categoria desconhecida",
            sentimento: "4 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("blah");
    expect(result).toEqual({
      intent: undefined,
      sentiment: "4 stars",
      score: undefined,
    });
  });

  it("clamps score to 0-100 range", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: "quer agendar",
            sentimento: "5 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("quero agendar agora!");
    // base 85 + (5-3)*5 = 95, within range
    expect(result!.score).toBe(95);
    expect(result!.score).toBeLessThanOrEqual(100);
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });

  it("handles non-string intencao gracefully", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            intencao: 42,
            sentimento: "3 stars",
          }),
      })
    );

    const result = await classificarViaNlpService("algo");
    expect(result).toEqual({
      intent: undefined,
      sentiment: "3 stars",
      score: undefined,
    });
  });

  it("handles abort timeout (simulated)", async () => {
    mockNlpServiceUrl.value = "http://nlp:8000";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError"))
    );

    const result = await classificarViaNlpService("oi");
    expect(result).toBeNull();
  });
});
