import { describe, it, expect, beforeEach, vi } from "vitest";

const cfg = vi.hoisted(() => ({
  isStripeConfigured: true,
  siteUrl: "http://localhost:3000",
}));
const { sessionsRetrieve } = vi.hoisted(() => ({ sessionsRetrieve: vi.fn() }));

vi.mock("@/lib/config", () => cfg);
vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ checkout: { sessions: { retrieve: sessionsRetrieve } } }),
}));

import { POST } from "@/app/api/stripe/session/route";

const SID = "cs_test_a1B2c3D4e5F6g7H8";
let ipSeq = 0;

function sessionRequest(body: unknown, origin = "http://localhost:3000") {
  ipSeq += 1;
  return new Request("http://localhost:3000/api/stripe/session", {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "x-forwarded-for": `198.51.100.${ipSeq % 256}`,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  cfg.isStripeConfigured = true;
  sessionsRetrieve.mockReset().mockResolvedValue({
    status: "complete",
    payment_status: "paid",
    amount_total: 7760,
    currency: "brl",
    metadata: { plan: "start" },
  });
});

describe("POST /api/stripe/session", () => {
  it("devolve o valor cobrado de uma sessão paga, sem dados do cliente", async () => {
    const res = await POST(sessionRequest({ sessionId: SID }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ paid: true, value: 77.6, currency: "BRL", plan: "start" });
    expect(sessionsRetrieve).toHaveBeenCalledWith(SID);
  });

  it("não informa valor quando a sessão não foi paga", async () => {
    sessionsRetrieve.mockResolvedValue({
      status: "complete",
      payment_status: "unpaid",
      amount_total: 9700,
      currency: "brl",
      metadata: {},
    });
    const body = await (await POST(sessionRequest({ sessionId: SID }))).json();
    expect(body.paid).toBe(false);
    expect(body.value).toBeUndefined();
  });

  it("rejeita session_id fora do formato do Checkout", async () => {
    const res = await POST(sessionRequest({ sessionId: "sub_123" }));
    expect(res.status).toBe(400);
    expect(sessionsRetrieve).not.toHaveBeenCalled();
  });

  it("bloqueia outra origem", async () => {
    const res = await POST(sessionRequest({ sessionId: SID }, "https://evil.example"));
    expect(res.status).toBe(403);
  });

  it("responde 503 sem Stripe e 404 para sessão inexistente", async () => {
    cfg.isStripeConfigured = false;
    expect((await POST(sessionRequest({ sessionId: SID }))).status).toBe(503);
    cfg.isStripeConfigured = true;
    sessionsRetrieve.mockRejectedValue(new Error("No such checkout.session"));
    expect((await POST(sessionRequest({ sessionId: SID }))).status).toBe(404);
  });
});
