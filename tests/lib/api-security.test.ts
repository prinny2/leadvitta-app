import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  rejectCrossOriginRequest,
  enforceRateLimit,
  readJsonBody,
  jsonNoStore,
} from "@/lib/api-security";

const BASE = "http://localhost:3000/api/teste";

function req(headers: Record<string, string> = {}, init: RequestInit = {}) {
  return new Request(BASE, { headers, ...init });
}

describe("rejectCrossOriginRequest", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("permite origem igual à do próprio request", () => {
    expect(rejectCrossOriginRequest(req({ origin: "http://localhost:3000" }))).toBeNull();
  });

  it("bloqueia origem não autorizada com 403", () => {
    const res = rejectCrossOriginRequest(req({ origin: "http://evil.com" }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("permite referer autorizado", () => {
    expect(
      rejectCrossOriginRequest(req({ referer: "http://localhost:3000/pagina" }))
    ).toBeNull();
  });

  it("bloqueia referer não autorizado com 403", () => {
    const res = rejectCrossOriginRequest(req({ referer: "http://evil.com/x" }));
    expect(res!.status).toBe(403);
  });

  it("sem origin/referer fora de produção é permitido", () => {
    // NODE_ENV de teste não é 'production' e não há K_SERVICE.
    expect(rejectCrossOriginRequest(req())).toBeNull();
  });

  it("sem origin/referer em produção é bloqueado", () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = rejectCrossOriginRequest(req());
    expect(res!.status).toBe(403);
  });

  it("trata K_SERVICE (Cloud Run) como produção", () => {
    vi.stubEnv("K_SERVICE", "leadbellus");
    const res = rejectCrossOriginRequest(req());
    expect(res!.status).toBe(403);
  });
});

describe("enforceRateLimit", () => {
  it("permite enquanto abaixo do limite e bloqueia ao atingir", () => {
    const headers = { "x-forwarded-for": "1.1.1.1" };
    const opts = { bucket: "b-basico", limit: 2, windowMs: 60_000 };

    expect(enforceRateLimit(req(headers), opts)).toBeNull(); // count 1
    expect(enforceRateLimit(req(headers), opts)).toBeNull(); // count 2
    const blocked = enforceRateLimit(req(headers), opts); // >= limit
    expect(blocked!.status).toBe(429);
  });

  it("inclui cabeçalho Retry-After ao bloquear", () => {
    const headers = { "x-forwarded-for": "2.2.2.2" };
    const opts = { bucket: "b-retry", limit: 1, windowMs: 60_000 };
    expect(enforceRateLimit(req(headers), opts)).toBeNull();
    const blocked = enforceRateLimit(req(headers), opts);
    expect(blocked!.status).toBe(429);
    expect(blocked!.headers.get("Retry-After")).toBeTruthy();
    expect(blocked!.headers.get("Cache-Control")).toBe("no-store");
  });

  it("separa contadores por IP", () => {
    const opts = { bucket: "b-ip", limit: 1, windowMs: 60_000 };
    expect(enforceRateLimit(req({ "x-forwarded-for": "3.3.3.3" }), opts)).toBeNull();
    // IP diferente => contador independente, ainda permitido.
    expect(enforceRateLimit(req({ "x-forwarded-for": "4.4.4.4" }), opts)).toBeNull();
  });

  it("usa o primeiro IP de uma lista x-forwarded-for", () => {
    const opts = { bucket: "b-xff", limit: 1, windowMs: 60_000 };
    expect(
      enforceRateLimit(req({ "x-forwarded-for": "5.5.5.5, 9.9.9.9" }), opts)
    ).toBeNull();
    const blocked = enforceRateLimit(
      req({ "x-forwarded-for": "5.5.5.5, 8.8.8.8" }),
      opts
    );
    expect(blocked!.status).toBe(429);
  });

  it("reseta a janela após o tempo expirar", () => {
    vi.useFakeTimers();
    try {
      const headers = { "x-real-ip": "6.6.6.6" };
      const opts = { bucket: "b-janela", limit: 1, windowMs: 1000 };
      expect(enforceRateLimit(req(headers), opts)).toBeNull();
      expect(enforceRateLimit(req(headers), opts)!.status).toBe(429);
      vi.advanceTimersByTime(1001);
      expect(enforceRateLimit(req(headers), opts)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("readJsonBody", () => {
  it("rejeita content-type não-json com 415", async () => {
    const { data, error } = await readJsonBody(
      req({ "content-type": "text/plain" }, { method: "POST", body: "oi" }),
      1000
    );
    expect(data).toBeUndefined();
    expect(error!.status).toBe(415);
  });

  it("rejeita payload acima do limite por content-length com 413", async () => {
    const { error } = await readJsonBody(
      req(
        { "content-type": "application/json", "content-length": "5000" },
        { method: "POST", body: JSON.stringify({ a: 1 }) }
      ),
      1000
    );
    expect(error!.status).toBe(413);
  });

  it("rejeita payload acima do limite por bytes reais com 413", async () => {
    const big = JSON.stringify({ a: "x".repeat(2000) });
    const { error } = await readJsonBody(
      req({ "content-type": "application/json" }, { method: "POST", body: big }),
      1000
    );
    expect(error!.status).toBe(413);
  });

  it("retorna os dados para JSON válido", async () => {
    const { data, error } = await readJsonBody<{ nome: string }>(
      req(
        { "content-type": "application/json" },
        { method: "POST", body: JSON.stringify({ nome: "Ana" }) }
      ),
      1000
    );
    expect(error).toBeUndefined();
    expect(data).toEqual({ nome: "Ana" });
  });

  it("rejeita JSON inválido com 400", async () => {
    const { error } = await readJsonBody(
      req(
        { "content-type": "application/json" },
        { method: "POST", body: "{ nao json" }
      ),
      1000
    );
    expect(error!.status).toBe(400);
  });
});

describe("jsonNoStore", () => {
  it("seta Cache-Control: no-store", async () => {
    const res = jsonNoStore({ ok: true });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("preserva o status passado em init", () => {
    const res = jsonNoStore({ error: "x" }, { status: 422 });
    expect(res.status).toBe(422);
  });
});
