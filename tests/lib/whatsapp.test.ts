import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isWhatsappConfigured, sendWhatsAppText } from "@/lib/whatsapp";
import { zapiProvider } from "@/lib/whatsapp-zapi";

function configureZapi() {
  vi.stubEnv("ZAPI_INSTANCE_ID", "INST123");
  vi.stubEnv("ZAPI_TOKEN", "TOK456");
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("isWhatsappConfigured (Z-API)", () => {
  it("é true com ZAPI_INSTANCE_ID + ZAPI_TOKEN", () => {
    configureZapi();
    expect(isWhatsappConfigured()).toBe(true);
  });

  it("é false faltando o token", () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "INST123");
    vi.stubEnv("ZAPI_TOKEN", "");
    expect(isWhatsappConfigured()).toBe(false);
  });
});

describe("sendWhatsAppText (Z-API)", () => {
  it("retorna não configurado (status 0) sem credenciais", async () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "");
    vi.stubEnv("ZAPI_TOKEN", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendWhatsAppText("5591985156690", "oi");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("chama o endpoint send-text da Z-API e remove prefixos do número", async () => {
    configureZapi();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messageId: "Z1" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendWhatsAppText("whatsapp:+5591985156690", "olá");
    expect(res).toEqual({ ok: true, status: 200, data: { messageId: "Z1" } });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://api.z-api.io/instances/INST123/token/TOK456/send-text"
    );
    expect((init as RequestInit).method).toBe("POST");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ phone: "5591985156690", message: "olá" });
  });

  it("inclui o header Client-Token quando ZAPI_CLIENT_TOKEN existe", async () => {
    configureZapi();
    vi.stubEnv("ZAPI_CLIENT_TOKEN", "CLIENT789");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await sendWhatsAppText("5591985156690", "oi");
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers["Client-Token"]).toBe("CLIENT789");
  });

  it("tolera corpo de resposta sem JSON", async () => {
    configureZapi();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error("not json")),
      })
    );
    const res = await sendWhatsAppText("5591985156690", "oi");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
    expect(res.data).toEqual({});
  });
});

describe("zapiProvider.parseInbound", () => {
  it("extrai uma InboundMessage de um ReceivedMessage", () => {
    const raw = JSON.stringify({
      type: "ReceivedMessage",
      phone: "5591985156690",
      connectedPhone: "5591980000000",
      text: { message: "quanto custa?" },
      messageId: "M1",
      senderName: "Ana",
    });
    const msg = zapiProvider.parseInbound(raw, new Request("http://x/"));
    expect(msg).toEqual({
      from: "5591985156690",
      to: "5591980000000",
      text: "quanto custa?",
      providerMessageId: "M1",
      contactName: "Ana",
    });
  });

  it("ignora eventos que não são ReceivedMessage", () => {
    const raw = JSON.stringify({ type: "MessageStatus", phone: "55..." });
    expect(zapiProvider.parseInbound(raw, new Request("http://x/"))).toBeNull();
  });

  it("retorna null para JSON inválido", () => {
    expect(zapiProvider.parseInbound("{ nao json", new Request("http://x/"))).toBeNull();
  });
});

describe("zapiProvider.validateWebhook", () => {
  it("sem token configurado, libera fora de produção", async () => {
    vi.stubEnv("ZAPI_SECURITY_TOKEN", "");
    vi.stubEnv("NODE_ENV", "test");
    const ok = await zapiProvider.validateWebhook(
      new Request("http://x/api/whatsapp/webhook"),
      "{}"
    );
    expect(ok).toBe(true);
  });

  it("com token configurado, exige match na query ou header", async () => {
    vi.stubEnv("ZAPI_SECURITY_TOKEN", "s3cr3t");
    const good = await zapiProvider.validateWebhook(
      new Request("http://x/api/whatsapp/webhook?token=s3cr3t"),
      "{}"
    );
    const bad = await zapiProvider.validateWebhook(
      new Request("http://x/api/whatsapp/webhook?token=errado"),
      "{}"
    );
    expect(good).toBe(true);
    expect(bad).toBe(false);
  });
});
