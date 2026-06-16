import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { InboundMessage } from "@/lib/whatsapp-types";

// ---------------------------------------------------------------------------
// O webhook do WhatsApp (Z-API) é público: valida → parseia → responde 200 e
// processa em `after()` (fora do caminho HTTP). Capturamos os callbacks de
// `after` para exercitar `processarMensagem` e mockamos toda a periferia
// (Firestore Admin, IA, provedor, roteamento, conversas).
// ---------------------------------------------------------------------------
const afterCallbacks = vi.hoisted(() => [] as Array<() => unknown>);
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (fn: () => unknown) => afterCallbacks.push(fn) };
});

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));

const { gerarRespostas } = vi.hoisted(() => ({ gerarRespostas: vi.fn() }));
vi.mock("@/lib/ai/provider", () => ({ gerarRespostas }));

const { provider } = vi.hoisted(() => ({
  provider: {
    name: "zapi" as const,
    isConfigured: vi.fn(() => true),
    validateWebhook: vi.fn(),
    parseInbound: vi.fn(),
    sendText: vi.fn(),
    sendImage: vi.fn(),
    sendButtons: vi.fn(),
  },
}));
vi.mock("@/lib/whatsapp", () => ({ getWhatsAppProvider: () => provider }));

const { resolverClinicaPorNumero } = vi.hoisted(() => ({
  resolverClinicaPorNumero: vi.fn(),
}));
vi.mock("@/lib/numeros", () => ({ resolverClinicaPorNumero }));

const {
  registrarMensagemRecebida,
  registrarMensagemEnviada,
  marcarPrecisaAtencao,
  reservarProcessamento,
  liberarProcessamento,
} = vi.hoisted(() => ({
  registrarMensagemRecebida: vi.fn(),
  registrarMensagemEnviada: vi.fn(),
  marcarPrecisaAtencao: vi.fn(),
  reservarProcessamento: vi.fn(),
  liberarProcessamento: vi.fn(),
}));
vi.mock("@/lib/conversas", () => ({
  registrarMensagemRecebida,
  registrarMensagemEnviada,
  marcarPrecisaAtencao,
  reservarProcessamento,
  liberarProcessamento,
}));

import { GET, POST } from "@/app/api/whatsapp/webhook/route";

const MSG: InboundMessage = {
  from: "5591985156690",
  to: "5591980000000",
  text: "quanto custa?",
  providerMessageId: "M1",
  contactName: "Ana",
};

function makeDb(clinica?: Record<string, unknown>) {
  const historico: Record<string, unknown>[] = [];
  const db = {
    collection: (name: string) => {
      if (name === "clinicas") {
        return {
          doc: () => ({
            get: async () => ({ exists: !!clinica, data: () => clinica }),
          }),
        };
      }
      if (name === "historico") {
        return { add: async (d: Record<string, unknown>) => historico.push(d) };
      }
      return { doc: () => ({ get: async () => ({ exists: false }) }) };
    },
  };
  return { db, historico };
}

function webhookRequest(body = "{}") {
  return new Request("http://localhost:3000/api/whatsapp/webhook", {
    method: "POST",
    body,
  });
}

async function runAfter() {
  for (const fn of [...afterCallbacks]) await fn();
}

let ctx: ReturnType<typeof makeDb>;

beforeEach(() => {
  afterCallbacks.length = 0;
  for (const m of [
    provider.validateWebhook,
    provider.parseInbound,
    provider.sendText,
    gerarRespostas,
    resolverClinicaPorNumero,
    registrarMensagemRecebida,
    registrarMensagemEnviada,
    marcarPrecisaAtencao,
    reservarProcessamento,
    liberarProcessamento,
    getDb,
  ]) {
    m.mockReset();
  }
  ctx = makeDb({
    billing: { status: "active" },
    nome_clinica: "Clínica X",
    tom_padrao: "acolhedor",
  });
  getDb.mockReturnValue(ctx.db);
  provider.validateWebhook.mockResolvedValue(true);
  provider.parseInbound.mockReturnValue(MSG);
  provider.sendText.mockResolvedValue({ ok: true, status: 200, data: {} });
  reservarProcessamento.mockResolvedValue(true);
  liberarProcessamento.mockResolvedValue(undefined);
  resolverClinicaPorNumero.mockResolvedValue("c1");
  registrarMensagemRecebida.mockResolvedValue("c1__5591985156690");
  registrarMensagemEnviada.mockResolvedValue(undefined);
  marcarPrecisaAtencao.mockResolvedValue(undefined);
  gerarRespostas.mockResolvedValue({
    respostas: { consultiva: "resposta consultiva" },
    intent: "preco",
    sentiment: "positivo",
    score: 60,
  });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/whatsapp/webhook", () => {
  it("confirma que o endpoint está vivo (200 'ok')", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

describe("POST /api/whatsapp/webhook — entrada", () => {
  it("recusa webhook com assinatura/token inválido (403) e não parseia", async () => {
    provider.validateWebhook.mockResolvedValue(false);
    const res = await POST(webhookRequest());
    expect(res.status).toBe(403);
    expect(provider.parseInbound).not.toHaveBeenCalled();
    expect(afterCallbacks).toHaveLength(0);
  });

  it("retorna 200 e não agenda processamento para eventos não-mensagem", async () => {
    provider.parseInbound.mockReturnValue(null);
    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    expect(afterCallbacks).toHaveLength(0);
  });

  it("retorna 200 e agenda processamento para uma mensagem válida", async () => {
    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    expect(afterCallbacks).toHaveLength(1);
  });
});

describe("processarMensagem", () => {
  it("ignora reentrega (idempotência): reserva já tomada → não roteia nem grava", async () => {
    reservarProcessamento.mockResolvedValue(false);
    await POST(webhookRequest());
    await runAfter();
    expect(resolverClinicaPorNumero).not.toHaveBeenCalled();
    expect(registrarMensagemRecebida).not.toHaveBeenCalled();
  });

  it("sem Firestore Admin: não reserva nem processa", async () => {
    getDb.mockReturnValue(null);
    await POST(webhookRequest());
    await runAfter();
    expect(reservarProcessamento).not.toHaveBeenCalled();
  });

  it("número sem clínica conectada: devolve a reserva e não grava", async () => {
    resolverClinicaPorNumero.mockResolvedValue(null);
    await POST(webhookRequest());
    await runAfter();
    expect(liberarProcessamento).toHaveBeenCalledWith("M1");
    expect(registrarMensagemRecebida).not.toHaveBeenCalled();
  });

  it("clínica sem plano ativo: ARMAZENA a mensagem mas NÃO auto-responde", async () => {
    ctx = makeDb({ billing: { status: "canceled" } });
    getDb.mockReturnValue(ctx.db);

    await POST(webhookRequest());
    await runAfter();

    expect(registrarMensagemRecebida).toHaveBeenCalledTimes(1);
    expect(gerarRespostas).not.toHaveBeenCalled();
    expect(provider.sendText).not.toHaveBeenCalled();
    expect(ctx.historico).toHaveLength(0);
  });

  it("plano ativo: gera, registra com NLP, envia e grava o histórico", async () => {
    await POST(webhookRequest());
    await runAfter();

    expect(gerarRespostas).toHaveBeenCalledTimes(1);
    expect(registrarMensagemRecebida).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicaId: "c1",
        from: MSG.from,
        text: MSG.text,
        intent: "preco",
        sentiment: "positivo",
        score: 60,
      })
    );
    expect(provider.sendText).toHaveBeenCalledWith(
      MSG.from,
      "resposta consultiva",
      expect.any(Object)
    );
    // Auto-resposta NÃO marca como lida (fica na triagem).
    expect(registrarMensagemEnviada).toHaveBeenCalledWith(
      "c1",
      MSG.from,
      "resposta consultiva",
      { marcarLida: false }
    );
    expect(marcarPrecisaAtencao).not.toHaveBeenCalled();
    expect(ctx.historico).toHaveLength(1);
    expect(ctx.historico[0]).toMatchObject({
      user_id: "c1",
      tipo: "gerador",
      contexto: expect.objectContaining({ canal: "whatsapp", entregue: true }),
    });
  });

  it("falha no envio: marca a conversa como 'precisa atenção' e registra entregue=false", async () => {
    provider.sendText.mockResolvedValue({ ok: false, status: 500, data: {} });
    await POST(webhookRequest());
    await runAfter();

    expect(marcarPrecisaAtencao).toHaveBeenCalledWith("c1", MSG.from);
    expect(registrarMensagemEnviada).not.toHaveBeenCalled();
    expect(ctx.historico[0]).toMatchObject({
      contexto: expect.objectContaining({ entregue: false }),
    });
  });

  it("crash no processamento devolve a reserva (não perde a mensagem no retry)", async () => {
    registrarMensagemRecebida.mockRejectedValue(new Error("Firestore down"));
    await POST(webhookRequest());
    await runAfter();
    expect(liberarProcessamento).toHaveBeenCalledWith("M1");
  });
});
