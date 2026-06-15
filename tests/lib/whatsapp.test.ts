import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isWhatsappConfigured, sendWhatsAppText } from "@/lib/whatsapp";

describe("isWhatsappConfigured", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("é true com token + phone number id", () => {
    vi.stubEnv("WHATSAPP_TOKEN", "tok");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "123");
    expect(isWhatsappConfigured()).toBe(true);
  });

  it("é false faltando qualquer um", () => {
    vi.stubEnv("WHATSAPP_TOKEN", "tok");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "");
    expect(isWhatsappConfigured()).toBe(false);
  });
});

describe("sendWhatsAppText", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retorna não configurado (status 0) sem credenciais", async () => {
    vi.stubEnv("WHATSAPP_TOKEN", "");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendWhatsAppText("5591999999999", "oi");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("monta a chamada à Graph API e propaga ok/status/data", async () => {
    vi.stubEnv("WHATSAPP_TOKEN", "tok");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "PHONE123");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messages: [{ id: "wamid.X" }] }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendWhatsAppText("5591985156690", "olá");
    expect(res).toEqual({
      ok: true,
      status: 200,
      data: { messages: [{ id: "wamid.X" }] },
    });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://graph.facebook.com/v21.0/PHONE123/messages");
    expect((init as RequestInit).method).toBe("POST");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({
      messaging_product: "whatsapp",
      to: "5591985156690",
      type: "text",
      text: { preview_url: false, body: "olá" },
    });
  });

  it("tolera corpo de resposta sem JSON (json rejeita)", async () => {
    vi.stubEnv("WHATSAPP_TOKEN", "tok");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "PHONE123");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error("not json")),
      })
    );

    const res = await sendWhatsAppText("5591985156690", "olá");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
    expect(res.data).toEqual({});
  });
});
