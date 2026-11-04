import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/config")>();
  return {
    ...actual,
    isOpenAIConfigured: true,
    isAnthropicConfigured: false,
  };
});
const { openaiCreate, verifyToken, adminConfigured, reserve, release } = vi.hoisted(() => ({
  openaiCreate: vi.fn(),
  verifyToken: vi.fn(),
  adminConfigured: vi.fn(),
  reserve: vi.fn(),
  release: vi.fn(),
}));
vi.mock("openai", () => ({
  default: class OpenAIMock {
    chat = { completions: { create: openaiCreate } };
    constructor() {}
  },
}));
vi.mock("@/lib/firebase/admin", () => ({ verifyFirebaseIdToken: verifyToken, isFirebaseAdminConfigured: adminConfigured }));
vi.mock("@/lib/usage-limit", () => ({ reserveGeneration: reserve, releaseGeneration: release }));

import { POST } from "@/app/api/lead-intelligence/route";
import { __resetAiGuardForTests } from "@/lib/ai-guard";
import { afirmaFatoSemFonte } from "@/lib/ai/prompts";

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
  __resetAiGuardForTests();
  openaiCreate.mockReset().mockRejectedValue(new Error("AI down"));
  verifyToken.mockReset().mockResolvedValue(null);
  adminConfigured.mockReset().mockReturnValue(true);
  reserve.mockReset().mockResolvedValue({ allowed: true, paid: true, remaining: Infinity, reserved: false });
  release.mockReset().mockResolvedValue(undefined);
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

describe("POST /api/lead-intelligence — não inventa fatos", () => {
  // IP próprio: estes casos não dividem o limite por minuto com o resto do arquivo.
  const pedir = (mensagem: string) => {
    const req = makeRequest({ mensagem });
    req.headers.set("x-forwarded-for", "10.0.0.1");
    return POST(req);
  };

  it.each([
    "Quero agendar um horário",
    "Quanto custa? Dá pra parcelar?",
    "Voltei, o resultado sumiu",
    "bom dia, tudo bem com vocês?",
    "tenho medo de fazer botox",
  ])("o texto pronto não afirma fato: %s", async (mensagem) => {
    const body = await (await pedir(mensagem)).json();
    expect(afirmaFatoSemFonte(body.gatilho)).toBe(false);
    expect(afirmaFatoSemFonte(body.abordagem)).toBe(false);
  });

  const analise = (gatilho: string) => ({
    choices: [{
      message: {
        content: JSON.stringify({
          score: 80,
          temperatura: "quente",
          perfil: "Lead decidido.",
          abordagem: "Responda rápido.",
          gatilho,
          eixos: { urgencia: 1, intencao: 2, confianca: 3, receptividade: 4, maturidade: 5 },
          intent: "agendamento",
          sentiment: "positivo",
        }),
      },
    }],
  });

  it.each([
    "Crie urgência com disponibilidade limitada. 'Tenho horário amanhã às 14h ou quinta às 10h.'",
    "Ofereça 2 opções de horário.",
    "Mencionar parcelamento pode reduzir a resistência.",
    "Ofereça desconto exclusivo de fidelidade.",
    "Ofereça uma avaliação gratuita.",
  ])("a sugestão da IA que inventa fato cai no texto seguro: %s", async (gatilho) => {
    openaiCreate.mockResolvedValue(analise(gatilho));
    const body = await (await pedir("Quero agendar um horário")).json();
    expect(body.score).toBe(80);
    expect(body.gatilho).not.toBe(gatilho);
    expect(afirmaFatoSemFonte(body.gatilho)).toBe(false);
  });

  it("a sugestão honesta da IA passa, com a regra de fatos no prompt", async () => {
    const gatilho = "Pergunte qual período é melhor pra ela.";
    openaiCreate.mockResolvedValue(analise(gatilho));
    const body = await (await pedir("Quero agendar um horário")).json();
    expect(body.gatilho).toBe(gatilho);
    expect(openaiCreate.mock.calls[0][0].messages[0].content).toContain("NÃO INVENTE FATOS");
  });
});

describe("POST /api/lead-intelligence — free quota", () => {
  it("returns 402 when a logged-in free user has exhausted the shared quota", async () => {
    verifyToken.mockResolvedValue({ uid: "free-user" });
    reserve.mockResolvedValue({ allowed: false, paid: false, remaining: 0, reserved: false });
    const res = await POST(makeRequest({ mensagem: "mensagem válida", firebaseIdToken: "valid" }));
    expect(res.status).toBe(402);
    await expect(res.json()).resolves.toMatchObject({ limitReached: true, freeRemaining: 0 });
  });

  it("releases a free slot when AI analysis fails and falls back to mock", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    verifyToken.mockResolvedValue({ uid: "free-user" });
    reserve.mockResolvedValue({ allowed: true, paid: false, remaining: 4, reserved: true });
    const res = await POST(makeRequest({ mensagem: "mensagem válida", firebaseIdToken: "valid" }));
    expect(res.status).toBe(200);
    expect(release).toHaveBeenCalledWith("free-user");
  });
});
