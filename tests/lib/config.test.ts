import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// config.ts deriva flags a partir de process.env no momento da importação.
// Para testar cada cenário, limpamos o cache de módulos e reimportamos
// depois de ajustar as variáveis de ambiente.
async function loadConfig() {
  vi.resetModules();
  return import("@/lib/config");
}

describe("lib/config", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("isFirebaseConfigured é true com apiKey + projectId", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "abc");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "proj");
    const { isFirebaseConfigured } = await loadConfig();
    expect(isFirebaseConfigured).toBe(true);
  });

  it("isFirebaseConfigured é false sem projectId", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "abc");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "");
    const { isFirebaseConfigured } = await loadConfig();
    expect(isFirebaseConfigured).toBe(false);
  });

  it("isAnthropicConfigured / isOpenAIConfigured seguem as chaves", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant");
    vi.stubEnv("OPENAI_API_KEY", "");
    const cfg = await loadConfig();
    expect(cfg.isAnthropicConfigured).toBe(true);
    expect(cfg.isOpenAIConfigured).toBe(false);
  });

  it("aiModel usa AI_MODEL quando definido", async () => {
    vi.stubEnv("AI_MODEL", "claude-opus-4-8");
    const { aiModel } = await loadConfig();
    expect(aiModel).toBe("claude-opus-4-8");
  });

  it("aiModel cai no default gpt-4o-mini sem AI_MODEL", async () => {
    vi.stubEnv("AI_MODEL", "");
    const { aiModel } = await loadConfig();
    expect(aiModel).toBe("gpt-4o-mini");
  });

  it("isGeminiConfigured segue GEMINI_API_KEY/GOOGLE_API_KEY", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "g-key");
    const { isGeminiConfigured } = await loadConfig();
    expect(isGeminiConfigured).toBe(true);
  });

  it("isAnyAIConfigured é true se qualquer provedor tiver chave", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant");
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    const { isAnyAIConfigured } = await loadConfig();
    expect(isAnyAIConfigured).toBe(true);
  });

  it("modelos por provedor respeitam AI_MODEL conforme o vendor", async () => {
    vi.stubEnv("AI_MODEL", "claude-haiku-4-5");
    vi.stubEnv("OPENAI_MODEL", "");
    vi.stubEnv("ANTHROPIC_MODEL", "");
    vi.stubEnv("GEMINI_MODEL", "");
    const { openaiModel, anthropicModel, geminiModel } = await loadConfig();
    // AI_MODEL é claude-*, então só o anthropicModel o herda; os demais usam default.
    expect(anthropicModel).toBe("claude-haiku-4-5");
    expect(openaiModel).toBe("gpt-4o-mini");
    expect(geminiModel).toBe("gemini-2.5-flash");
  });

  it("isZApiConfigured exige ZAPI_INSTANCE_ID + ZAPI_TOKEN", async () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "inst");
    vi.stubEnv("ZAPI_TOKEN", "tok");
    const { isZApiConfigured, isWhatsappConfigured } = await loadConfig();
    expect(isZApiConfigured).toBe(true);
    expect(isWhatsappConfigured).toBe(true);
  });

  it("siteUrl usa o default localhost quando não configurado", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { siteUrl } = await loadConfig();
    expect(siteUrl).toBe("http://localhost:3000");
  });

  it("siteUrl respeita NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leadbellus.com.br");
    const { siteUrl } = await loadConfig();
    expect(siteUrl).toBe("https://leadbellus.com.br");
  });

  it("isStripeConfigured exige secret key (trim) + ao menos um price id", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("STRIPE_PRICE_ID_START", "price_1");
    vi.stubEnv("STRIPE_PRICE_ID_PRO", "");
    vi.stubEnv("STRIPE_PRICE_ID_PREMIUM", "");
    const { isStripeConfigured } = await loadConfig();
    expect(isStripeConfigured).toBe(true);
  });

  it("isStripeConfigured é false com secret só de espaços", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "   ");
    vi.stubEnv("STRIPE_PRICE_ID_START", "price_1");
    const { isStripeConfigured } = await loadConfig();
    expect(isStripeConfigured).toBe(false);
  });

  it("isStripeConfigured é false sem nenhum price id", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("STRIPE_PRICE_ID_START", "");
    vi.stubEnv("STRIPE_PRICE_ID_PRO", "");
    vi.stubEnv("STRIPE_PRICE_ID_PREMIUM", "");
    const { isStripeConfigured } = await loadConfig();
    expect(isStripeConfigured).toBe(false);
  });

  it("isOpsNotifyConfigured exige Z-API + número de alerta", async () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "inst");
    vi.stubEnv("ZAPI_TOKEN", "tok");
    vi.stubEnv("OPS_WHATSAPP_NUMBER", "55 (91) 98888-7777");
    const cfg = await loadConfig();
    expect(cfg.isOpsNotifyConfigured).toBe(true);
    expect(cfg.opsNotifyPhone).toBe("5591988887777");

    vi.stubEnv("OPS_WHATSAPP_NUMBER", "");
    const cfg2 = await loadConfig();
    expect(cfg2.isOpsNotifyConfigured).toBe(false);
  });
});
