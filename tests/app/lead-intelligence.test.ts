import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/config")>();
  return {
    ...actual,
    isOpenAIConfigured: false,
    isAnthropicConfigured: false,
  };
});

import { POST } from "@/app/api/lead-intelligence/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/lead-intelligence", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/lead-intelligence — validation", () => {
  it("returns 400 when mensagem is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when mensagem is empty", async () => {
    const res = await POST(makeRequest({ mensagem: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when mensagem is too short", async () => {
    const res = await POST(makeRequest({ mensagem: "oi" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("curta");
  });
});

describe("POST /api/lead-intelligence — mock analysis", () => {
  it("returns mock analysis for a price question", async () => {
    const res = await POST(makeRequest({ mensagem: "quanto custa o procedimento?" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.mock).toBe(true);
    expect(body.intent).toBe("preco");
    expect(body.temperatura).toBeDefined();
    expect(body.score).toBeGreaterThan(0);
    expect(body.eixos).toBeDefined();
    expect(body.perfil).toBeDefined();
    expect(body.abordagem).toBeDefined();
    expect(body.gatilho).toBeDefined();
  });

  it("returns scheduling intent for 'quero agendar'", async () => {
    const res = await POST(makeRequest({ mensagem: "quero agendar uma avaliação" }));
    const body = await res.json();

    expect(body.intent).toBe("agendamento");
    expect(body.sentiment).toBe("positivo");
    expect(body.temperatura).toBe("quente");
    expect(body.score).toBeGreaterThanOrEqual(72);
  });

  it("returns fear intent for 'tenho medo'", async () => {
    const res = await POST(makeRequest({ mensagem: "tenho medo de fazer botox" }));
    const body = await res.json();

    expect(body.intent).toBe("medo");
    expect(body.sentiment).toBe("negativo");
  });

  it("returns trust intent for 'me mostra resultado antes e depois'", async () => {
    const res = await POST(
      makeRequest({ mensagem: "me mostra resultado antes e depois da harmonização" })
    );
    const body = await res.json();

    expect(body.intent).toBe("confianca");
  });

  it("returns return intent for 'quando volta o resultado'", async () => {
    const res = await POST(makeRequest({ mensagem: "o resultado sumiu, quando volta?" }));
    const body = await res.json();

    expect(body.intent).toBe("retorno");
    expect(body.sentiment).toBe("positivo");
  });

  it("returns interest intent for 'gostaria de saber mais'", async () => {
    const res = await POST(makeRequest({ mensagem: "gostaria de mais informações sobre o serviço" }));
    const body = await res.json();

    expect(body.intent).toBe("interesse");
  });

  it("returns default informacao for generic messages", async () => {
    const res = await POST(makeRequest({ mensagem: "bom dia, tudo bem com vocês?" }));
    const body = await res.json();

    expect(body.intent).toBe("informacao");
    expect(body.temperatura).toBeDefined();
  });

  it("always includes eixos with 5 numeric axes", async () => {
    const res = await POST(makeRequest({ mensagem: "quanto custa o botox?" }));
    const body = await res.json();
    const { eixos } = body;

    expect(typeof eixos.urgencia).toBe("number");
    expect(typeof eixos.intencao).toBe("number");
    expect(typeof eixos.confianca).toBe("number");
    expect(typeof eixos.receptividade).toBe("number");
    expect(typeof eixos.maturidade).toBe("number");
  });

  it("temperatura is derived from score", async () => {
    const res = await POST(makeRequest({ mensagem: "quero agendar agora" }));
    const body = await res.json();

    if (body.score >= 72) expect(body.temperatura).toBe("quente");
    else if (body.score >= 50) expect(body.temperatura).toBe("morno");
    else expect(body.temperatura).toBe("frio");
  });
});
