import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Controla a config (canais/destinos) e os envios (Z-API e fetch do Resend) por
// mocks, para testar o formato da mensagem e o gating sem env real nem rede.
const state = vi.hoisted(() => ({
  whatsapp: true,
  email: false,
  phone: "5511999990000",
}));
const sendText = vi.hoisted(() => vi.fn());
const fetchMock = vi.fn();

vi.mock("@/lib/config", () => ({
  get isOpsWhatsAppConfigured() {
    return state.whatsapp;
  },
  get isOpsEmailConfigured() {
    return state.email;
  },
  get opsNotifyPhone() {
    return state.phone;
  },
  opsNotifyEmail: "suporte@leadbellus.com.br",
  opsEmailFrom: "LeadBellus <alertas@leadbellus.com.br>",
  resendApiKey: "re_test",
}));
vi.mock("@/lib/whatsapp", () => ({ sendWhatsAppText: sendText }));

import { sendOpsNotify } from "@/lib/ops-notify";

beforeEach(() => {
  state.whatsapp = true;
  state.email = false;
  state.phone = "5511999990000";
  sendText.mockReset();
  sendText.mockResolvedValue({ ok: true, status: 200 });
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendOpsNotify gating", () => {
  it("não envia quando nenhum canal está configurado", async () => {
    state.whatsapp = false;
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

describe("sendOpsNotify por e-mail (Resend)", () => {
  beforeEach(() => {
    state.whatsapp = false;
    state.email = true;
  });

  it("envia para a caixa de ops com assunto do evento", async () => {
    const res = await sendOpsNotify("waitlist.joined", { email: "a@b.com", plan: "premium" });
    expect(res).toEqual({ sent: true });
    expect(sendText).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["suporte@leadbellus.com.br"]);
    expect(body.from).toBe("LeadBellus <alertas@leadbellus.com.br>");
    expect(body.subject).toBe("LeadBellus · Lista de espera");
    expect(body.text).toContain("a@b.com");
    expect(body.text).toContain("premium");
  });

  it("reporta failed com status quando o Resend recusa", async () => {
    fetchMock.mockResolvedValue(new Response("bad", { status: 422 }));
    const res = await sendOpsNotify("signup.created", { email: "a@b.com" });
    expect(res).toEqual({ sent: false, reason: "failed", status: 422 });
  });

  it("com os dois canais, basta um entregar", async () => {
    state.whatsapp = true;
    sendText.mockRejectedValue(new Error("z-api fora"));
    const res = await sendOpsNotify("checkout.started", { email: "a@b.com" });
    expect(res).toEqual({ sent: true });
    expect(sendText).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
