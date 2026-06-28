import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadGa4Server() {
  vi.resetModules();
  return import("@/lib/analytics/ga4-server");
}

describe("lib/analytics/ga4-server", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("GA4_MEASUREMENT_ID", "G-TEST123");
    vi.stubEnv("GA4_API_SECRET", "mp_secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("não envia eventos server-side sem client_id real", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { sendGa4Event } = await loadGa4Server();

    await expect(sendGa4Event({ name: "purchase" })).resolves.toEqual({
      sent: false,
      reason: "missing_client_id",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia Measurement Protocol com ecommerce seguro e sem PII", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);
    const { sendGa4Event } = await loadGa4Server();

    const result = await sendGa4Event({
      name: "purchase",
      clientId: "123.456",
      userId: "uid_1",
      params: {
        transaction_id: "cs_1",
        currency: "BRL",
        value: 97,
        email: "ana@exemplo.com",
        whatsapp: "5591999999999",
        customer_details: { email: "cliente@exemplo.com" },
        stripe_subscription_id: "sub_1",
        items: [
          {
            item_id: "price_1",
            item_name: "LeadBellus Start",
            customer_name: "Ana Cliente",
            quantity: 1,
            price: 97,
          },
        ],
      },
    });

    expect(result).toEqual({ sent: true, status: 204 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("measurement_id=G-TEST123");
    expect(String(url)).toContain("api_secret=mp_secret");

    const payload = JSON.parse(String(init.body));
    expect(payload.client_id).toBe("123.456");
    expect(payload.user_id).toBe("uid_1");
    expect(payload.events[0].name).toBe("purchase");
    expect(payload.events[0].params.items[0].item_name).toBe(
      "LeadBellus Start"
    );
    expect(JSON.stringify(payload)).not.toContain("ana@exemplo.com");
    expect(JSON.stringify(payload)).not.toContain("5591999999999");
    expect(JSON.stringify(payload)).not.toContain("cliente@exemplo.com");
    expect(JSON.stringify(payload)).not.toContain("sub_1");
    expect(JSON.stringify(payload)).not.toContain("Ana Cliente");
  });
});
