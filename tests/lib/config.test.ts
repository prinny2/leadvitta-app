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

  it("usa projectId Firebase por fallback, mas exige apiKey vinda do ambiente", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "abc");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "");
    const { firebaseConfig, isFirebaseConfigured } = await loadConfig();
    expect(firebaseConfig.projectId).toBe("leadvitta-app");
    expect(isFirebaseConfigured).toBe(true);
  });

  it("não configura Firebase sem NEXT_PUBLIC_FIREBASE_API_KEY", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "proj");
    const { isFirebaseConfigured } = await loadConfig();
    expect(isFirebaseConfigured).toBe(false);
  });

  it("expõe flags Clerk somente quando public key e secret estão presentes", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", " pk_test_123 ");
    vi.stubEnv("CLERK_SECRET_KEY", "");
    const clientOnly = await loadConfig();
    expect(clientOnly.clerkPublishableKey).toBe("pk_test_123");
    expect(clientOnly.isClerkClientConfigured).toBe(true);
    expect(clientOnly.isClerkServerConfigured).toBe(false);

    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_123");
    const serverReady = await loadConfig();
    expect(serverReady.isClerkServerConfigured).toBe(true);
  });

  it("não configura NLP quando NLP_SERVICE_URL está ausente ou vazio", async () => {
    vi.stubEnv("NLP_SERVICE_URL", "");
    const { nlpServiceUrl, isNlpServiceConfigured } = await loadConfig();
    expect(nlpServiceUrl).toBe("");
    expect(isNlpServiceConfigured).toBe(false);
  });

  it("normaliza NLP_SERVICE_URL (trim) e marca isNlpServiceConfigured quando presente", async () => {
    vi.stubEnv("NLP_SERVICE_URL", "  https://nlp.service.local  ");
    const { nlpServiceUrl, isNlpServiceConfigured } = await loadConfig();
    expect(nlpServiceUrl).toBe("https://nlp.service.local");
    expect(isNlpServiceConfigured).toBe(true);
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

  it("isGa4ServerConfigured exige GA4_API_SECRET e usa Measurement ID público como fallback", async () => {
    vi.stubEnv("GA4_API_SECRET", "");
    vi.stubEnv("GA4_MEASUREMENT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_GA4_ID", "G-PUBLIC123");
    const cfgWithoutSecret = await loadConfig();
    expect(cfgWithoutSecret.ga4MeasurementId).toBe("G-PUBLIC123");
    expect(cfgWithoutSecret.isGa4ServerConfigured).toBe(false);

    vi.stubEnv("GA4_API_SECRET", "  mp_secret  ");
    const cfgWithSecret = await loadConfig();
    expect(cfgWithSecret.ga4ApiSecret).toBe("mp_secret");
    expect(cfgWithSecret.isGa4ServerConfigured).toBe(true);
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

  it("isZApiConfigured segue ZAPI_INSTANCE_ID + ZAPI_TOKEN", async () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "inst_1");
    vi.stubEnv("ZAPI_TOKEN", "tok_1");
    const cfg = await loadConfig();
    expect(cfg.isZApiConfigured).toBe(true);

    vi.stubEnv("ZAPI_TOKEN", "");
    const cfg2 = await loadConfig();
    expect(cfg2.isZApiConfigured).toBe(false);
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
