import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendZapierEvent } from "@/lib/zapier";

describe("sendZapierEvent", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retorna not_configured quando não há webhook", async () => {
    vi.stubEnv("ZAPIER_WEBHOOK_URL", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendZapierEvent("novo_lead", { id: 1 });
    expect(res).toEqual({ sent: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("envia o evento e retorna sent:true quando o webhook responde ok", async () => {
    vi.stubEnv("ZAPIER_WEBHOOK_URL", "https://hooks.zapier.com/x");
    vi.stubEnv("ZAPIER_SHARED_SECRET", "segredo");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendZapierEvent("novo_lead", { nome: "Ana" });
    expect(res).toEqual({ sent: true, status: 200 });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.zapier.com/x");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({
      event: "novo_lead",
      app: "leadbellus",
      nome: "Ana",
      zapier_shared_secret: "segredo",
    });
    expect(typeof body.sent_at).toBe("string");
  });

  it("retorna failed com status quando o webhook não responde ok", async () => {
    vi.stubEnv("ZAPIER_WEBHOOK_URL", "https://hooks.zapier.com/x");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const res = await sendZapierEvent("novo_lead", {});
    expect(res).toEqual({ sent: false, reason: "failed", status: 500 });
  });

  it("retorna failed quando o fetch lança (ex.: timeout/abort)", async () => {
    vi.stubEnv("ZAPIER_WEBHOOK_URL", "https://hooks.zapier.com/x");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = await sendZapierEvent("novo_lead", {});
    expect(res).toEqual({ sent: false, reason: "failed" });
  });
});
