import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Resposta manual da clínica de dentro do inbox. Foco: auth + posse da conversa
// (uid == clinica_id) + mapeamento de status do envio. api-security roda de
// verdade (origin/rate limit); o resto é mockado.
const { verifyToken } = vi.hoisted(() => ({ verifyToken: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ verifyFirebaseIdToken: verifyToken }));

const { provider } = vi.hoisted(() => ({
  provider: { name: "zapi" as const, sendText: vi.fn() },
}));
vi.mock("@/lib/whatsapp", () => ({ getWhatsAppProvider: () => provider }));

const { getConversaServidor, registrarMensagemEnviada, getCanalClinica } =
  vi.hoisted(() => ({
    getConversaServidor: vi.fn(),
    registrarMensagemEnviada: vi.fn(),
    getCanalClinica: vi.fn(),
  }));
vi.mock("@/lib/conversas", () => ({
  getConversaServidor,
  registrarMensagemEnviada,
  getCanalClinica,
}));

import { POST } from "@/app/api/conversas/reply/route";

function replyRequest(
  body: unknown,
  headers: Record<string, string> = { origin: "http://localhost:3000" }
) {
  return new Request("http://localhost:3000/api/conversas/reply", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  verifyToken.mockReset().mockResolvedValue({ uid: "dona" });
  provider.sendText.mockReset().mockResolvedValue({ ok: true, status: 200, data: {} });
  getConversaServidor.mockReset().mockResolvedValue({
    clinica_id: "dona",
    cliente_numero: "5591985156690",
  });
  registrarMensagemEnviada.mockReset().mockResolvedValue(undefined);
  getCanalClinica.mockReset().mockResolvedValue("channel_key");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/conversas/reply", () => {
  it("bloqueia origem não autorizada (403)", async () => {
    const res = await POST(
      replyRequest(
        { conversaId: "x", texto: "oi" },
        { origin: "http://evil.example" }
      )
    );
    expect(res.status).toBe(403);
  });

  it("retorna 400 para JSON inválido", async () => {
    const res = await POST(replyRequest("{ nao json"));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando faltam conversaId/texto", async () => {
    expect((await POST(replyRequest({ conversaId: "x" }))).status).toBe(400);
    expect((await POST(replyRequest({ texto: "   " }))).status).toBe(400);
  });

  it("retorna 401 sem token válido", async () => {
    verifyToken.mockResolvedValue(null);
    const res = await POST(replyRequest({ conversaId: "x", texto: "oi" }));
    expect(res.status).toBe(401);
  });

  it("retorna 404 quando a conversa não existe", async () => {
    getConversaServidor.mockResolvedValue(null);
    const res = await POST(replyRequest({ conversaId: "x", texto: "oi" }));
    expect(res.status).toBe(404);
  });

  it("retorna 403 quando a conversa é de OUTRA clínica (isolamento)", async () => {
    getConversaServidor.mockResolvedValue({
      clinica_id: "outra",
      cliente_numero: "5591985156690",
    });
    const res = await POST(replyRequest({ conversaId: "x", texto: "oi" }));
    expect(res.status).toBe(403);
    expect(provider.sendText).not.toHaveBeenCalled();
  });

  it("retorna 502 quando o envio falha (e não marca como lida)", async () => {
    provider.sendText.mockResolvedValue({ ok: false, status: 500, data: {} });
    const res = await POST(replyRequest({ conversaId: "x", texto: "oi" }));
    expect(res.status).toBe(502);
    expect(registrarMensagemEnviada).not.toHaveBeenCalled();
  });

  it("envia, marca como lida e confirma 200 no caminho feliz", async () => {
    const res = await POST(replyRequest({ conversaId: "x", texto: "  olá  " }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(provider.sendText).toHaveBeenCalledWith(
      "5591985156690",
      "olá",
      expect.objectContaining({ channelApiKey: "channel_key" })
    );
    expect(registrarMensagemEnviada).toHaveBeenCalledWith("dona", "5591985156690", "olá", {
      marcarLida: true,
    });
  });
});
