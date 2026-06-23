import { describe, it, expect, beforeEach, vi } from "vitest";

// Controla a config (telefone/flag) e o envio Z-API por mocks, para testar o
// formato da mensagem e o gating sem env real nem rede.
const state = vi.hoisted(() => ({ configured: true, phone: "5511999990000" }));
const sendText = vi.hoisted(() => vi.fn());

vi.mock("@/lib/config", () => ({
  get isOpsNotifyConfigured() {
    return state.configured;
  },
  get opsNotifyPhone() {
    return state.phone;
  },
}));
vi.mock("@/lib/whatsapp", () => ({ sendWhatsAppText: sendText }));

import { sendOpsNotify } from "@/lib/ops-notify";

beforeEach(() => {
  state.configured = true;
  state.phone = "5511999990000";
  sendText.mockReset();
  sendText.mockResolvedValue({ ok: true, status: 200 });
});

describe("sendOpsNotify gating", () => {
  it("não envia quando a flag está desligada", async () => {
    state.configured = false;
    const res = await sendOpsNotify("signup.created", { email: "a@b.com" });
    expect(res).toEqual({ sent: false, reason: "not_configured" });
    expect(sendText).not.toHaveBeenCalled();
  });

  it("não envia quando falta o telefone de ops", async () => {
    state.phone = "";
    const res = await sendOpsNotify("signup.created", { email: "a@b.com" });
    expect(res).toEqual({ sent: false, reason: "not_configured" });
    expect(sendText).not.toHaveBeenCalled();
  });
});

describe("sendOpsNotify envio", () => {
  it("envia para o telefone de ops e devolve sent:true", async () => {
    const res = await sendOpsNotify("signup.created", { email: "a@b.com" });
    expect(res).toEqual({ sent: true });
    expect(sendText).toHaveBeenCalledTimes(1);
    expect(sendText.mock.calls[0][0]).toBe("5511999990000");
  });

  it("usa o rótulo amigável do evento conhecido", async () => {
    await sendOpsNotify("stripe.checkout.completed", { email: "a@b.com" });
    const msg = sendText.mock.calls[0][1] as string;
    expect(msg).toContain("Pagamento confirmado");
  });

  it("usa o próprio nome do evento quando não há rótulo", async () => {
    await sendOpsNotify("evento.desconhecido", { email: "a@b.com" });
    const msg = sendText.mock.calls[0][1] as string;
    expect(msg).toContain("evento.desconhecido");
  });

  it("inclui só os campos presentes e omite os vazios", async () => {
    await sendOpsNotify("signup.created", {
      email: "cliente@exemplo.com",
      plan: "start",
      firebase_uid: undefined,
      status: "",
    });
    const msg = sendText.mock.calls[0][1] as string;
    expect(msg).toContain("cliente@exemplo.com");
    expect(msg).toContain("start");
    expect(msg).not.toContain("👤 UID");
    expect(msg).not.toContain("📊 Status");
  });

  it("reporta failed com status quando o envio não é ok", async () => {
    sendText.mockResolvedValue({ ok: false, status: 503 });
    const res = await sendOpsNotify("signup.created", { email: "a@b.com" });
    expect(res).toEqual({ sent: false, reason: "failed", status: 503 });
  });

  it("reporta failed quando o envio lança", async () => {
    sendText.mockRejectedValue(new Error("network"));
    const res = await sendOpsNotify("signup.created", { email: "a@b.com" });
    expect(res).toEqual({ sent: false, reason: "failed" });
  });
});
