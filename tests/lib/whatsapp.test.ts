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

describe("zapiProvider.sendImage", () => {
  it("returns not configured without credentials", async () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "");
    vi.stubEnv("ZAPI_TOKEN", "");
    const res = await zapiProvider.sendImage("5591985156690", "https://img.jpg", "caption");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(0);
  });

  it("calls send-image endpoint with correct payload", async () => {
    configureZapi();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messageId: "IMG1" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const res = await zapiProvider.sendImage(
      "whatsapp:+5591985156690",
      "https://example.com/photo.jpg",
      "Antes e depois"
    );
    expect(res).toEqual({ ok: true, status: 200, data: { messageId: "IMG1" } });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.z-api.io/instances/INST123/token/TOK456/send-image");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      phone: "5591985156690",
      image: "https://example.com/photo.jpg",
      caption: "Antes e depois",
    });
  });

  it("includes Client-Token header when ZAPI_CLIENT_TOKEN is set", async () => {
    configureZapi();
    vi.stubEnv("ZAPI_CLIENT_TOKEN", "CLIENT789");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await zapiProvider.sendImage("5591985156690", "https://img.jpg");
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["Client-Token"]).toBe("CLIENT789");
  });

  it("tolerates non-JSON response body", async () => {
    configureZapi();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error("not json")),
      })
    );
    const res = await zapiProvider.sendImage("5591985156690", "https://img.jpg");
    expect(res.ok).toBe(false);
    expect(res.data).toEqual({});
  });
});

describe("zapiProvider.sendButtons", () => {
  it("returns not configured without credentials", async () => {
    vi.stubEnv("ZAPI_INSTANCE_ID", "");
    vi.stubEnv("ZAPI_TOKEN", "");
    const res = await zapiProvider.sendButtons("5591985156690", "Choose:", [
      { id: "1", label: "Sim" },
    ]);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(0);
  });

  it("calls send-button-list endpoint with correct payload", async () => {
    configureZapi();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messageId: "BTN1" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const buttons = [
      { id: "opt_sim", label: "Sim" },
      { id: "opt_nao", label: "Não" },
    ];
    const res = await zapiProvider.sendButtons("5591985156690", "Quer agendar?", buttons);
    expect(res).toEqual({ ok: true, status: 200, data: { messageId: "BTN1" } });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://api.z-api.io/instances/INST123/token/TOK456/send-button-list"
    );
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      phone: "5591985156690",
      message: "Quer agendar?",
      buttonList: {
        buttons: [
          { id: "opt_sim", label: "Sim" },
          { id: "opt_nao", label: "Não" },
        ],
      },
    });
  });

  it("includes Client-Token header when ZAPI_CLIENT_TOKEN is set", async () => {
    configureZapi();
    vi.stubEnv("ZAPI_CLIENT_TOKEN", "CLIENT789");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await zapiProvider.sendButtons("5591985156690", "Escolha:", [{ id: "1", label: "A" }]);
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["Client-Token"]).toBe("CLIENT789");
  });

  it("tolerates non-JSON response body", async () => {
    configureZapi();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("not json")),
      })
    );
    const res = await zapiProvider.sendButtons("5591985156690", "msg", [
      { id: "1", label: "X" },
    ]);
    expect(res.ok).toBe(false);
    expect(res.data).toEqual({});
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

  it("com token configurado, valida o match via query string", async () => {
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

  it("com token configurado, valida o match via header X-Zapi-Token", async () => {
    vi.stubEnv("ZAPI_SECURITY_TOKEN", "s3cr3t");
    const good = await zapiProvider.validateWebhook(
      new Request("http://x/api/whatsapp/webhook", {
        headers: { "x-zapi-token": "s3cr3t" },
      }),
      "{}"
    );
    const bad = await zapiProvider.validateWebhook(
      new Request("http://x/api/whatsapp/webhook", {
        headers: { "x-zapi-token": "errado" },
      }),
      "{}"
    );
    expect(good).toBe(true);
    expect(bad).toBe(false);
  });
});
