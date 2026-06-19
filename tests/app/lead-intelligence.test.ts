import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const cfg = vi.hoisted(() => ({
  geminiModel: "gemini-test-model",
  isAnthropicConfigured: false,
  isGeminiConfigured: false,
  isOpenAIConfigured: false,
  siteUrl: "http://localhost:3000",
}));

const { geminiGenerateContent, openaiCreate, anthropicCreate } = vi.hoisted(() => ({
  geminiGenerateContent: vi.fn(),
  openaiCreate: vi.fn(),
  anthropicCreate: vi.fn(),
}));

vi.mock("@/lib/config", () => cfg);

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: openaiCreate } };
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: anthropicCreate };
  },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: geminiGenerateContent };
  },
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/lead-intelligence/route");
}

function intelligenceRequest(body: unknown, ip: string) {
  return new Request("http://localhost:3000/api/lead-intelligence", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const geminiResult = {
  score: 91,
  temperatura: "quente",
  perfil: "Lead pronto para marcar.",
  abordagem: "Ofereca dois horarios objetivos.",
  gatilho: "Use disponibilidade limitada.",
  eixos: {
    urgencia: 90,
    intencao: 92,
    confianca: 80,
    receptividade: 88,
    maturidade: 84,
  },
  intent: "agendamento",
  sentiment: "positivo",
};

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("GEMINI_API_KEY", "gemini-test-key");
  cfg.isOpenAIConfigured = false;
  cfg.isAnthropicConfigured = false;
  cfg.isGeminiConfigured = false;
  cfg.geminiModel = "gemini-test-model";
  openaiCreate.mockReset();
  anthropicCreate.mockReset();
  geminiGenerateContent.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Lead Intelligence - Gemini", () => {
  it("usa Gemini quando somente Gemini esta configurado", async () => {
    cfg.isGeminiConfigured = true;
    geminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(geminiResult),
    });

    const { POST } = await loadRoute();
    const res = await POST(
      intelligenceRequest({ mensagem: "Quero agendar amanha" }, "10.0.0.1")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(geminiResult);
    expect(body.mock).toBeUndefined();
    expect(openaiCreate).not.toHaveBeenCalled();
    expect(anthropicCreate).not.toHaveBeenCalled();
    expect(geminiGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-test-model",
        contents: 'Mensagem do lead: "Quero agendar amanha"',
        config: expect.objectContaining({
          responseMimeType: "application/json",
          systemInstruction: expect.stringContaining("especialista em vendas"),
        }),
      })
    );
  });

  it("cai para mock quando Gemini retorna JSON invalido", async () => {
    cfg.isGeminiConfigured = true;
    geminiGenerateContent.mockResolvedValue({ text: "nao e json" });

    const { POST } = await loadRoute();
    const res = await POST(
      intelligenceRequest({ mensagem: "Quero agendar amanha" }, "10.0.0.2")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.mock).toBe(true);
    expect(body.intent).toBe("agendamento");
    expect(geminiGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("cai para mock quando Gemini falha", async () => {
    cfg.isGeminiConfigured = true;
    geminiGenerateContent.mockRejectedValue(new Error("Gemini down"));

    const { POST } = await loadRoute();
    const res = await POST(
      intelligenceRequest({ mensagem: "Quero agendar amanha" }, "10.0.0.3")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.mock).toBe(true);
    expect(body.intent).toBe("agendamento");
    expect(geminiGenerateContent).toHaveBeenCalledTimes(1);
  });
});
