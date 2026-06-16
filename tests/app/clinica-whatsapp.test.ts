import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Conecta/desconecta o número de WhatsApp da clínica. Foco: auth + tradução do
// resultado de reivindicarNumero/liberarNumero em status HTTP.
const { verifyToken } = vi.hoisted(() => ({ verifyToken: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ verifyFirebaseIdToken: verifyToken }));

const { reivindicarNumero, liberarNumero } = vi.hoisted(() => ({
  reivindicarNumero: vi.fn(),
  liberarNumero: vi.fn(),
}));
vi.mock("@/lib/numeros", () => ({ reivindicarNumero, liberarNumero }));

import { POST } from "@/app/api/clinica/whatsapp/route";

function req(
  body: unknown,
  headers: Record<string, string> = { origin: "http://localhost:3000" }
) {
  return new Request("http://localhost:3000/api/clinica/whatsapp", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  verifyToken.mockReset().mockResolvedValue({ uid: "dona" });
  reivindicarNumero.mockReset().mockResolvedValue({ ok: true, numero: "5591985156690" });
  liberarNumero.mockReset().mockResolvedValue({ ok: true, numero: "" });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/clinica/whatsapp", () => {
  it("retorna 400 para JSON inválido", async () => {
    expect((await POST(req("{ nao json"))).status).toBe(400);
  });

  it("retorna 401 sem token válido", async () => {
    verifyToken.mockResolvedValue(null);
    expect((await POST(req({ numero: "5591985156690" }))).status).toBe(401);
  });

  it("conecta o número (reivindica) e retorna 200", async () => {
    const res = await POST(req({ numero: "+55 91 98515-6690" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, numero: "5591985156690" });
    expect(reivindicarNumero).toHaveBeenCalledWith("dona", "+55 91 98515-6690");
    expect(liberarNumero).not.toHaveBeenCalled();
  });

  it("número vazio desconecta (libera) e retorna 200", async () => {
    const res = await POST(req({ numero: "  " }));
    expect(res.status).toBe(200);
    expect(liberarNumero).toHaveBeenCalledWith("dona");
    expect(reivindicarNumero).not.toHaveBeenCalled();
  });

  it("retorna 409 quando o número já é de outra conta", async () => {
    reivindicarNumero.mockResolvedValue({ ok: false, motivo: "em_uso" });
    expect((await POST(req({ numero: "5591985156690" }))).status).toBe(409);
  });

  it("retorna 400 quando o número é inválido (vazio após normalizar)", async () => {
    reivindicarNumero.mockResolvedValue({ ok: false, motivo: "vazio" });
    expect((await POST(req({ numero: "abc" }))).status).toBe(400);
  });

  it("retorna 500 quando o Admin SDK não está disponível", async () => {
    reivindicarNumero.mockResolvedValue({ ok: false, motivo: "sem_db" });
    expect((await POST(req({ numero: "5591985156690" }))).status).toBe(500);
  });
});
