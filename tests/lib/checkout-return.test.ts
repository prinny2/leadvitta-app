import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const SID = "cs_test_a1B2c3D4e5F6g7H8";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

let win: Record<string, any>;
let fetchMock: ReturnType<typeof vi.fn>;

const track = vi.fn();

async function loadHelper() {
  vi.resetModules();
  const { recordCheckoutReturn } = await import("@/lib/analytics/checkout-return");
  return (sessionId: string | null) => recordCheckoutReturn(sessionId, track);
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "123456789");
  win = { localStorage: memoryStorage() };
  vi.stubGlobal("window", win);
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ paid: true, value: 77.6, currency: "BRL", plan: "start" }),
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("recordCheckoutReturn", () => {
  it("enfileira o Purchase com o valor cobrado quando o Pixel ainda não carregou", async () => {
    const trackCheckoutReturn = await loadHelper();
    await trackCheckoutReturn(SID);

    expect(win.__lbMetaPending).toEqual([
      [
        "Purchase",
        { value: 77.6, currency: "BRL", content_name: "start" },
        { eventID: `purchase_${SID}` },
      ],
    ]);
    expect(win.localStorage.getItem(`lb_checkout_returned_${SID}`)).toBe("1");
  });

  it("envia direto ao Pixel quando ele já existe e não repete na mesma sessão", async () => {
    win.fbq = vi.fn();
    const trackCheckoutReturn = await loadHelper();
    await Promise.all([trackCheckoutReturn(SID), trackCheckoutReturn(SID)]);
    await trackCheckoutReturn(SID);

    const purchases = win.fbq.mock.calls.filter((c: unknown[]) => c[1] === "Purchase");
    expect(purchases).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("não manda Purchase de sessão não paga", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ paid: false }) });
    const trackCheckoutReturn = await loadHelper();
    await trackCheckoutReturn(SID);
    expect(win.__lbMetaPending).toBeUndefined();
  });

  it("não marca a sessão quando a consulta falha, para tentar de novo", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    const trackCheckoutReturn = await loadHelper();
    await trackCheckoutReturn(SID);
    expect(win.localStorage.getItem(`lb_checkout_returned_${SID}`)).toBeNull();

    await trackCheckoutReturn(SID);
    expect(win.__lbMetaPending).toHaveLength(1);
  });
});
