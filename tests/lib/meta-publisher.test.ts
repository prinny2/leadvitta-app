import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Publicador da Meta (Página FB + Instagram) com fetch mockado: nada de rede
// nem token real. Timers falsos só para setTimeout (o polling do container),
// para cobrir intervalo e timeout sem esperar de verdade.

vi.mock("@/lib/config", () => ({
  isMetaPublishConfigured: true,
  isInstagramPublishConfigured: true,
  metaPageId: "page-456",
  metaIgUserId: "ig-123",
  metaPageAccessToken: "tok-secreto",
}));

import { publishSocialPost } from "@/lib/social/meta-publisher";
import type { SocialPost } from "@/data/social-posts";

const TOKEN = "tok-secreto";
const VIDEO = "https://www.leadbellus.com.br/reels/r5-na-cadeira.mp4";
const IMAGEM = "https://www.leadbellus.com.br/social/auto/post-teste.png";

type Call = { method: string; path: string; version: string; params: URLSearchParams };
type FakeRes = { ok: boolean; status: number; json: () => Promise<unknown> };

const reply = (data: unknown, status = 200): FakeRes => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

let calls: Call[] = [];
let handler: (call: Call) => FakeRes = () => reply({}, 500);

const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  const [, version, ...rest] = url.pathname.split("/");
  const params =
    method === "POST" ? new URLSearchParams(String(init?.body ?? "")) : url.searchParams;
  const call: Call = { method, path: rest.join("/"), version, params };
  calls.push(call);
  return handler(call);
});

/** Sequência de status_code do container; o último se repete. */
function statusSeq(...statuses: string[]) {
  let i = 0;
  return () => reply({ status_code: statuses[Math.min(i++, statuses.length - 1)] });
}

/** Roteia as chamadas da Graph API por método + caminho. */
function route(routes: Record<string, () => FakeRes>) {
  handler = (call) => {
    const fn = routes[`${call.method} ${call.path}`];
    if (!fn) throw new Error(`chamada inesperada: ${call.method} ${call.path}`);
    return fn();
  };
}

const gets = () => calls.filter((c) => c.method === "GET");
const postsTo = (path: string) => calls.filter((c) => c.method === "POST" && c.path === path);

/** Esvazia a fila de microtasks (setImmediate não é falsificado). */
const flush = () => new Promise<void>((r) => setImmediate(r));

async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
  await flush();
}

function track<T>(promise: Promise<T>) {
  const state: { done: boolean; value?: T } = { done: false };
  promise.then((value) => {
    state.done = true;
    state.value = value;
  });
  return state;
}

function reelPost(extra: Partial<SocialPost> = {}): SocialPost {
  return {
    id: "2026-11-10-reel-na-cadeira",
    data: "2026-11-10",
    canais: ["instagram"],
    texto: "A LeadBellus escreve, a equipe revisa e envia. 5 respostas grátis, sem cartão.",
    videoUrl: VIDEO,
    ...extra,
  };
}

const consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

beforeEach(() => {
  calls = [];
  handler = () => reply({}, 500);
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  for (const m of ["log", "info", "warn", "error", "debug"] as const) {
    consoleSpies.push(vi.spyOn(console, m).mockImplementation(() => {}));
  }
});

afterEach(() => {
  // Token da página nunca vai pros logs.
  for (const spy of consoleSpies) {
    expect(JSON.stringify(spy.mock.calls)).not.toContain(TOKEN);
    spy.mockRestore();
  }
  consoleSpies.length = 0;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("publishSocialPost — Reel no Instagram (videoUrl)", () => {
  it("cria container REELS, faz polling a cada 5 s até FINISHED e publica", async () => {
    route({
      "POST ig-123/media": () => reply({ id: "cont-1" }),
      "GET cont-1": statusSeq("IN_PROGRESS", "IN_PROGRESS", "FINISHED"),
      "POST ig-123/media_publish": () => reply({ id: "media-9" }),
    });

    const state = track(publishSocialPost(reelPost()));
    await flush();

    const [container] = postsTo("ig-123/media");
    expect(container.version).toBe("v21.0");
    expect(container.params.get("media_type")).toBe("REELS");
    expect(container.params.get("video_url")).toBe(VIDEO);
    expect(container.params.get("caption")).toBe(reelPost().texto);
    expect(container.params.get("share_to_feed")).toBe("true");
    expect(container.params.has("image_url")).toBe(false);

    // Primeiro status sai na hora; os seguintes a cada ~5 s.
    expect(gets()).toHaveLength(1);
    await advance(4_999);
    expect(gets()).toHaveLength(1);
    await advance(1);
    expect(gets()).toHaveLength(2);
    expect(postsTo("ig-123/media_publish")).toHaveLength(0);
    await advance(5_000);
    expect(gets()).toHaveLength(3);

    for (const get of gets()) {
      expect(get.version).toBe("v21.0");
      expect(get.params.get("fields")).toBe("status_code");
    }

    expect(state.done).toBe(true);
    const [publish] = postsTo("ig-123/media_publish");
    expect(publish.params.get("creation_id")).toBe("cont-1");
    expect(state.value).toEqual({
      postId: "2026-11-10-reel-na-cadeira",
      instagram: { ok: true, id: "media-9" },
    });
  });

  it.each(["ERROR", "EXPIRED"])("status %s falha com mensagem e não publica", async (status) => {
    route({
      "POST ig-123/media": () => reply({ id: "cont-2" }),
      "GET cont-2": statusSeq("IN_PROGRESS", status),
      "POST ig-123/media_publish": () => reply({ id: "nao-devia" }),
    });

    const state = track(publishSocialPost(reelPost()));
    await flush();
    await advance(5_000);

    expect(state.done).toBe(true);
    expect(state.value?.instagram).toEqual({
      ok: false,
      reason: "failed",
      error: `container do reel ${status}`,
    });
    expect(postsTo("ig-123/media_publish")).toHaveLength(0);
  });

  it("timeout: sem FINISHED em ~120 s, falha e não publica", async () => {
    route({
      "POST ig-123/media": () => reply({ id: "cont-3" }),
      "GET cont-3": statusSeq("IN_PROGRESS"),
      "POST ig-123/media_publish": () => reply({ id: "nao-devia" }),
    });

    const state = track(publishSocialPost(reelPost()));
    await flush();

    await advance(119_000);
    expect(state.done).toBe(false);
    // t = 0, 5, …, 115 s → 24 consultas.
    expect(gets()).toHaveLength(24);

    await advance(1_000);
    expect(state.done).toBe(true);
    expect(gets()).toHaveLength(24);
    expect(state.value?.instagram).toEqual({
      ok: false,
      reason: "failed",
      error: "container do reel não ficou pronto em 120 s",
    });
    expect(postsTo("ig-123/media_publish")).toHaveLength(0);
  });

  it("erro da Graph ao criar o container devolve a mensagem da API sem polling", async () => {
    route({
      "POST ig-123/media": () =>
        reply({ error: { message: "Invalid parameter: video_url" } }, 400),
    });

    const result = await publishSocialPost(reelPost());

    expect(result.instagram).toEqual({
      ok: false,
      reason: "failed",
      status: 400,
      error: "Invalid parameter: video_url",
    });
    expect(gets()).toHaveLength(0);
  });

  it("Facebook publica o vídeo via /{page-id}/videos com file_url e description", async () => {
    route({
      "POST page-456/videos": () => reply({ id: "fb-video-1" }),
      "POST ig-123/media": () => reply({ id: "cont-4" }),
      "GET cont-4": statusSeq("FINISHED"),
      "POST ig-123/media_publish": () => reply({ id: "media-4" }),
    });

    // Com vídeo e imagem, o vídeo tem prioridade nos dois canais.
    const post = reelPost({
      canais: ["facebook", "instagram"],
      imagemUrl: IMAGEM,
      link: "https://www.leadbellus.com.br/?utm_source=facebook",
    });
    const result = await publishSocialPost(post);

    const [video] = postsTo("page-456/videos");
    expect(video.version).toBe("v21.0");
    expect(video.params.get("file_url")).toBe(VIDEO);
    expect(video.params.get("description")).toBe(post.texto);
    expect(postsTo("page-456/photos")).toHaveLength(0);
    expect(postsTo("page-456/feed")).toHaveLength(0);

    const [container] = postsTo("ig-123/media");
    expect(container.params.get("media_type")).toBe("REELS");
    expect(container.params.has("image_url")).toBe(false);

    expect(result.facebook).toEqual({ ok: true, id: "fb-video-1" });
    expect(result.instagram).toEqual({ ok: true, id: "media-4" });
  });
});

describe("publishSocialPost — imagem continua igual", () => {
  it("foto: /photos no Facebook, container image_url no Instagram com polling de 2 s", async () => {
    route({
      "POST page-456/photos": () => reply({ id: "fb-photo-1" }),
      "POST ig-123/media": () => reply({ id: "cont-img" }),
      "GET cont-img": statusSeq("IN_PROGRESS", "FINISHED"),
      "POST ig-123/media_publish": () => reply({ id: "media-img" }),
    });

    const post: SocialPost = {
      id: "2026-11-11-imagem",
      data: "2026-11-11",
      canais: ["facebook", "instagram"],
      texto: "Legenda da arte",
      imagemUrl: IMAGEM,
      link: "https://www.leadbellus.com.br/?utm_source=facebook",
    };
    const state = track(publishSocialPost(post));
    await flush();

    const [photo] = postsTo("page-456/photos");
    expect(photo.params.get("url")).toBe(IMAGEM);
    expect(photo.params.get("caption")).toBe("Legenda da arte");
    expect(postsTo("page-456/videos")).toHaveLength(0);

    const [container] = postsTo("ig-123/media");
    expect(container.params.get("image_url")).toBe(IMAGEM);
    expect(container.params.get("caption")).toBe("Legenda da arte");
    expect(container.params.has("media_type")).toBe(false);
    expect(container.params.has("video_url")).toBe(false);
    expect(container.params.has("share_to_feed")).toBe(false);

    expect(gets()).toHaveLength(1);
    await advance(1_999);
    expect(gets()).toHaveLength(1);
    await advance(1);
    expect(gets()).toHaveLength(2);

    expect(state.done).toBe(true);
    expect(postsTo("ig-123/media_publish")[0].params.get("creation_id")).toBe("cont-img");
    expect(state.value).toEqual({
      postId: "2026-11-11-imagem",
      facebook: { ok: true, id: "fb-photo-1" },
      instagram: { ok: true, id: "media-img" },
    });
  });

  it("foto: timeout continua em 15 tentativas (~30 s) com a mesma mensagem", async () => {
    route({
      "POST ig-123/media": () => reply({ id: "cont-lento" }),
      "GET cont-lento": statusSeq("IN_PROGRESS"),
    });

    const state = track(
      publishSocialPost({
        id: "2026-11-12-imagem-lenta",
        data: "2026-11-12",
        canais: ["instagram"],
        texto: "Legenda",
        imagemUrl: IMAGEM,
      })
    );
    await flush();
    await advance(30_000);

    expect(state.done).toBe(true);
    expect(gets()).toHaveLength(15);
    expect(state.value?.instagram).toEqual({
      ok: false,
      reason: "failed",
      error: "container não ficou pronto a tempo",
    });
  });

  it("sem mídia: Facebook vai pro /feed com link e Instagram responde missing_image", async () => {
    route({ "POST page-456/feed": () => reply({ id: "fb-feed-1" }) });

    const result = await publishSocialPost({
      id: "2026-11-13-texto",
      data: "2026-11-13",
      canais: ["facebook", "instagram"],
      texto: "Só texto",
      link: "https://www.leadbellus.com.br/",
    });

    const [feed] = postsTo("page-456/feed");
    expect(feed.params.get("message")).toBe("Só texto");
    expect(feed.params.get("link")).toBe("https://www.leadbellus.com.br/");
    expect(result.facebook).toEqual({ ok: true, id: "fb-feed-1" });
    expect(result.instagram).toEqual({ ok: false, reason: "missing_image" });
    expect(postsTo("ig-123/media")).toHaveLength(0);
  });
});
