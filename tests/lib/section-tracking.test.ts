import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SECTION_TIME_CAP_S,
  createSectionTracker,
  isMeaningfullyVisible,
  sectionTimeSeconds,
} from "@/lib/analytics/section-tracking";

function setup(pageVisible = true) {
  const send = vi.fn();
  const tracker = createSectionTracker({
    contentType: "lp",
    send,
    now: () => Date.now(),
    pageVisible,
  });
  const views = () =>
    send.mock.calls.filter(([name]) => name === "section_view").map(([, p]) => p.content_id);
  const times = () =>
    send.mock.calls.filter(([name]) => name === "section_time").map(([, p]) => p);
  return { send, tracker, views, times };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-03T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("isMeaningfullyVisible", () => {
  it("seção curta: precisa de metade da altura dela", () => {
    // 300px de seção numa tela de 800px: exige 150px (40% da tela seria 320).
    expect(isMeaningfullyVisible(149, 300, 800)).toBe(false);
    expect(isMeaningfullyVisible(150, 300, 800)).toBe(true);
  });

  it("seção mais alta que a tela: precisa de 40% da tela", () => {
    // 2000px numa tela de 800px: exige 320px (metade seria 1000, impossível).
    expect(isMeaningfullyVisible(319, 2000, 800)).toBe(false);
    expect(isMeaningfullyVisible(320, 2000, 800)).toBe(true);
    expect(isMeaningfullyVisible(800, 2000, 800)).toBe(true);
  });

  it("nada visível, altura zero ou valor inválido nunca conta", () => {
    expect(isMeaningfullyVisible(0, 300, 800)).toBe(false);
    expect(isMeaningfullyVisible(100, 0, 800)).toBe(false);
    expect(isMeaningfullyVisible(100, 300, 0)).toBe(false);
    expect(isMeaningfullyVisible(Number.NaN, 300, 800)).toBe(false);
  });
});

describe("sectionTimeSeconds", () => {
  it("arredonda para segundos inteiros e aplica o teto", () => {
    expect(sectionTimeSeconds(0)).toBe(0);
    expect(sectionTimeSeconds(400)).toBe(0);
    expect(sectionTimeSeconds(1499)).toBe(1);
    expect(sectionTimeSeconds(1500)).toBe(2);
    expect(sectionTimeSeconds(3_600_000)).toBe(SECTION_TIME_CAP_S);
    expect(sectionTimeSeconds(-5)).toBe(0);
  });
});

describe("section_view", () => {
  it("dispara depois de 1 s seguido de visibilidade", () => {
    const { tracker, views, send } = setup();
    tracker.setQualifies("hero", true);
    vi.advanceTimersByTime(999);
    expect(views()).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(views()).toEqual(["hero"]);
    expect(send).toHaveBeenCalledWith("section_view", { content_type: "lp", content_id: "hero" });
  });

  it("não dispara se a seção sai antes de 1 s (e o relógio recomeça)", () => {
    const { tracker, views } = setup();
    tracker.setQualifies("demo", true);
    vi.advanceTimersByTime(700);
    tracker.setQualifies("demo", false);
    vi.advanceTimersByTime(5000);
    expect(views()).toEqual([]);

    tracker.setQualifies("demo", true);
    vi.advanceTimersByTime(700);
    expect(views()).toEqual([]);
    vi.advanceTimersByTime(300);
    expect(views()).toEqual(["demo"]);
  });

  it("no máximo uma vez por seção na mesma montagem", () => {
    const { tracker, views } = setup();
    for (let i = 0; i < 3; i++) {
      tracker.setQualifies("faq", true);
      vi.advanceTimersByTime(2000);
      tracker.setQualifies("faq", false);
    }
    tracker.setPageVisible(false);
    tracker.setPageVisible(true);
    tracker.setQualifies("faq", true);
    vi.advanceTimersByTime(2000);
    expect(views()).toEqual(["faq"]);
  });

  it("aba escondida não conta como visível", () => {
    const { tracker, views } = setup(false);
    tracker.setQualifies("precos", true);
    vi.advanceTimersByTime(5000);
    expect(views()).toEqual([]);

    tracker.setPageVisible(true);
    vi.advanceTimersByTime(1000);
    expect(views()).toEqual(["precos"]);
  });

  it("esconder a aba antes de 1 s cancela o view", () => {
    const { tracker, views } = setup();
    tracker.setQualifies("precos", true);
    vi.advanceTimersByTime(600);
    tracker.setPageVisible(false);
    vi.advanceTimersByTime(5000);
    expect(views()).toEqual([]);
  });
});

describe("section_time", () => {
  it("acumula só o tempo visível, com a aba visível, e envia no flush", () => {
    const { tracker, times } = setup();
    tracker.setQualifies("demo", true);
    vi.advanceTimersByTime(3000);
    tracker.setQualifies("demo", false);
    vi.advanceTimersByTime(10_000); // fora da tela: não conta
    tracker.setQualifies("demo", true);
    vi.advanceTimersByTime(2000);
    tracker.setPageVisible(false);
    vi.advanceTimersByTime(60_000); // aba escondida: não conta
    tracker.flush();

    expect(times()).toEqual([
      { content_type: "lp", content_id: "demo", value: 5, transport_type: "beacon" },
    ]);
  });

  it("um evento por seção e nada para seção com menos de meio segundo", () => {
    const { tracker, times } = setup();
    tracker.setQualifies("hero", true);
    tracker.setQualifies("demo", true);
    vi.advanceTimersByTime(4000);
    tracker.setQualifies("hero", false);
    tracker.setQualifies("faq", true);
    vi.advanceTimersByTime(400);
    tracker.flush();

    expect(times()).toEqual([
      { content_type: "lp", content_id: "hero", value: 4, transport_type: "beacon" },
      { content_type: "lp", content_id: "demo", value: 4, transport_type: "beacon" },
    ]);
  });

  it("depois do flush zera: sair e voltar para a aba não conta duas vezes", () => {
    const { tracker, times } = setup();
    tracker.setQualifies("precos", true);
    vi.advanceTimersByTime(8000);
    tracker.setPageVisible(false);
    tracker.flush();
    tracker.flush(); // visibilitychange + pagehide: o 2º não repete

    tracker.setPageVisible(true);
    vi.advanceTimersByTime(3000);
    tracker.setPageVisible(false);
    tracker.flush();

    expect(times().map((p) => p.value)).toEqual([8, 3]);
  });

  it("flush com a seção ainda na tela envia o parcial e segue contando", () => {
    const { tracker, times } = setup();
    tracker.setQualifies("faq", true);
    vi.advanceTimersByTime(2000);
    tracker.flush();
    vi.advanceTimersByTime(5000);
    tracker.flush();

    expect(times().map((p) => p.value)).toEqual([2, 5]);
  });

  it("guarda o resto abaixo de meio segundo para o próximo envio", () => {
    const { tracker, times } = setup();
    tracker.setQualifies("situacoes", true);
    vi.advanceTimersByTime(400);
    tracker.flush();
    expect(times()).toEqual([]);

    vi.advanceTimersByTime(800);
    tracker.flush();
    expect(times().map((p) => p.value)).toEqual([1]);
  });

  it("limita a 600 s por envio", () => {
    const { tracker, times } = setup();
    tracker.setQualifies("hero", true);
    vi.advanceTimersByTime(45 * 60_000);
    tracker.flush();
    vi.advanceTimersByTime(10_000);
    tracker.flush();

    expect(times().map((p) => p.value)).toEqual([600, 10]);
  });

  it("dispose envia o que falta e desliga (troca de rota)", () => {
    const { tracker, times, views, send } = setup();
    tracker.setQualifies("cta-final", true);
    vi.advanceTimersByTime(2600);
    tracker.dispose();
    expect(views()).toEqual(["cta-final"]);
    expect(times().map((p) => p.value)).toEqual([3]);

    send.mockClear();
    tracker.setQualifies("rodape", true);
    vi.advanceTimersByTime(5000);
    tracker.flush();
    tracker.dispose();
    expect(send).not.toHaveBeenCalled();
  });

  it("dispose antes de 1 s não deixa view pendente para trás", () => {
    const { tracker, views, times } = setup();
    tracker.setQualifies("hero", true);
    vi.advanceTimersByTime(300);
    tracker.dispose();
    vi.advanceTimersByTime(5000);
    expect(views()).toEqual([]);
    expect(times()).toEqual([]);
  });
});

describe("trackGa4Event", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function load() {
    vi.resetModules();
    return (await import("@/lib/analytics/ga4-event")).trackGa4Event;
  }

  it("manda só para o gtag, nunca para o Meta Pixel", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA4_ID", "G-TESTE123");
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "123456789");
    const gtag = vi.fn();
    const fbq = vi.fn();
    vi.stubGlobal("window", { gtag, fbq });
    const trackGa4Event = await load();

    trackGa4Event("section_view", { content_type: "lp", content_id: "demo" });
    trackGa4Event("section_time", {
      content_type: "lp",
      content_id: "demo",
      value: 12,
      transport_type: "beacon",
    });

    expect(fbq).not.toHaveBeenCalled();
    expect(gtag.mock.calls).toEqual([
      ["event", "section_view", { content_type: "lp", content_id: "demo", send_to: "G-TESTE123" }],
      [
        "event",
        "section_time",
        { content_type: "lp", content_id: "demo", value: 12, transport_type: "beacon", send_to: "G-TESTE123" },
      ],
    ]);
  });

  it("sem GA4 configurado não envia nada", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA4_ID", "");
    const gtag = vi.fn();
    const fbq = vi.fn();
    vi.stubGlobal("window", { gtag, fbq });
    const trackGa4Event = await load();

    trackGa4Event("section_view", { content_type: "lp", content_id: "hero" });

    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });

  it("sem window.gtag (bloqueador) ou com gtag quebrado não lança", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA4_ID", "G-TESTE123");
    vi.stubGlobal("window", {});
    let trackGa4Event = await load();
    expect(() => trackGa4Event("section_view", { content_id: "hero" })).not.toThrow();

    vi.stubGlobal("window", {
      gtag: () => {
        throw new Error("bloqueado");
      },
    });
    trackGa4Event = await load();
    expect(() => trackGa4Event("section_view", { content_id: "hero" })).not.toThrow();
  });
});
