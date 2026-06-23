import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// A rota de geração orquestra: validação → verificação de token → reserva atômica
// do plano grátis → IA → (rollback se falhar). Mockamos IA, Firebase e usage-limit
// para testar a orquestração (em especial o gating do plano grátis) sem rede.
const { gerar, refinar, verifyToken, adminConfigured, reserve, release } =
  vi.hoisted(() => ({
    gerar: vi.fn(),
    refinar: vi.fn(),
    verifyToken: vi.fn(),
    adminConfigured: vi.fn(),
    reserve: vi.fn(),
    release: vi.fn(),
  }));

vi.mock("@/lib/ai/provider", () => ({
  gerarRespostas: gerar,
  refinarResposta: refinar,
}));
vi.mock("@/lib/firebase/admin", () => ({
  verifyFirebaseIdToken: verifyToken,
  isFirebaseAdminConfigured: adminConfigured,
}));
vi.mock("@/lib/usage-limit", () => ({
  reserveGeneration: reserve,
  releaseGeneration: release,
}));

import { POST } from "@/app/api/generate/route";

function genRequest(body: unknown) {
  return new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { origin: "http://localhost:3000", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const PAID = {
  allowed: true,
  paid: true,
  used: 0,
  remaining: Number.POSITIVE_INFINITY,
  reserved: false,
};

beforeEach(() => {
  gerar.mockReset().mockResolvedValue({ respostas: ["a", "b", "c"], mock: true });
  refinar.mockReset().mockResolvedValue({ resposta: "refinada" });
  verifyToken.mockReset().mockResolvedValue(null);
  adminConfigured.mockReset().mockReturnValue(true);
  reserve.mockReset().mockResolvedValue(PAID);
  release.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generate — validação", () => {
  it("400 quando falta a mensagem da cliente", async () => {
    const res = await POST(genRequest({}));
    expect(res.status).toBe(400);
    expect(gerar).not.toHaveBeenCalled();
  });

  it("400 quando a mensagem é só espaços", async () => {
    const res = await POST(genRequest({ mensagemCliente: "   " }));
    expect(res.status).toBe(400);
  });

  it("refinar exige respostaAtual e variante (400)", async () => {
    const res = await POST(genRequest({ acao: "refinar", variante: "suave" }));
    expect(res.status).toBe(400);
    expect(refinar).not.toHaveBeenCalled();
  });

  it("refinar válido chama refinarResposta e retorna 200", async () => {
    const res = await POST(
      genRequest({ acao: "refinar", variante: "suave", respostaAtual: "oi" })
    );
    expect(res.status).toBe(200);
    expect(refinar).toHaveBeenCalledTimes(1);
    expect(gerar).not.toHaveBeenCalled();
  });
});

describe("generate — demo pública (sem token)", () => {
  it("gera sem reservar limite quando não há token", async () => {
    const res = await POST(genRequest({ mensagemCliente: "quanto custa?" }));
    expect(res.status).toBe(200);
    expect(reserve).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
    await expect(res.json()).resolves.not.toHaveProperty("freeRemaining");
  });
});

describe("generate — token inválido", () => {
  it("401 quando o token é inválido e o Admin SDK existe", async () => {
    verifyToken.mockResolvedValue(null);
    adminConfigured.mockReturnValue(true);
    const res = await POST(
      genRequest({ mensagemCliente: "oi", firebaseIdToken: "lixo" })
    );
    expect(res.status).toBe(401);
    expect(gerar).not.toHaveBeenCalled();
    expect(reserve).not.toHaveBeenCalled();
  });

  it("sem Admin SDK, token inválido não bloqueia (cai em anônimo)", async () => {
    verifyToken.mockResolvedValue(null);
    adminConfigured.mockReturnValue(false);
    const res = await POST(
      genRequest({ mensagemCliente: "oi", firebaseIdToken: "lixo" })
    );
    expect(res.status).toBe(200);
    expect(reserve).not.toHaveBeenCalled();
  });
});

describe("generate — plano grátis (logado)", () => {
  it("bloqueia com 402 quando o limite grátis acabou", async () => {
    verifyToken.mockResolvedValue({ uid: "u1" });
    reserve.mockResolvedValue({
      allowed: false,
      paid: false,
      used: 5,
      remaining: 0,
      reserved: false,
    });

    const res = await POST(
      genRequest({ mensagemCliente: "oi", firebaseIdToken: "tok" })
    );
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.limitReached).toBe(true);
    expect(gerar).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
  });

  it("usuário grátis dentro do limite gera e devolve freeRemaining", async () => {
    verifyToken.mockResolvedValue({ uid: "u1" });
    reserve.mockResolvedValue({
      allowed: true,
      paid: false,
      used: 2,
      remaining: 3,
      reserved: true,
    });

    const res = await POST(
      genRequest({ mensagemCliente: "oi", firebaseIdToken: "tok" })
    );
    expect(res.status).toBe(200);
    expect(reserve).toHaveBeenCalledWith("u1");
    expect(release).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.freeRemaining).toBe(2); // remaining 3 - 1
  });

  it("usuário pagante gera ilimitado e NÃO reserva nem devolve freeRemaining", async () => {
    verifyToken.mockResolvedValue({ uid: "u1" });
    reserve.mockResolvedValue(PAID);

    const res = await POST(
      genRequest({ mensagemCliente: "oi", firebaseIdToken: "tok" })
    );
    expect(res.status).toBe(200);
    expect(release).not.toHaveBeenCalled();
    await expect(res.json()).resolves.not.toHaveProperty("freeRemaining");
  });

  it("geração falha → devolve o slot reservado (releaseGeneration)", async () => {
    verifyToken.mockResolvedValue({ uid: "u1" });
    reserve.mockResolvedValue({
      allowed: true,
      paid: false,
      used: 2,
      remaining: 3,
      reserved: true,
    });
    gerar.mockRejectedValue(new Error("AI down"));

    const res = await POST(
      genRequest({ mensagemCliente: "oi", firebaseIdToken: "tok" })
    );
    expect(res.status).toBe(500);
    expect(release).toHaveBeenCalledWith("u1");
  });
});

describe("generate — erros", () => {
  it("500 quando a IA lança (demo, sem reserva pra devolver)", async () => {
    gerar.mockRejectedValue(new Error("AI down"));
    const res = await POST(genRequest({ mensagemCliente: "oi" }));
    expect(res.status).toBe(500);
    expect(release).not.toHaveBeenCalled();
  });
});
