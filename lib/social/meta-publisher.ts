// Publicação de posts orgânicos na Meta (Página do Facebook + Instagram
// Business) via Graph API. Server-only — o token de página NUNCA vai pro
// cliente nem pros logs. Instagram exige mídia (fluxo container -> publish):
// com videoUrl sai como Reel, com imagemUrl sai como foto; post sem mídia sai
// só no Facebook.

import {
  isInstagramPublishConfigured,
  isMetaPublishConfigured,
  metaIgUserId,
  metaPageAccessToken,
  metaPageId,
} from "@/lib/config";
import type { SocialPost } from "@/data/social-posts";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";
// Upload de vídeo da Página (/{page-id}/videos) vai pelo host dedicado de vídeo.
const GRAPH_VIDEO_BASE = "https://graph-video.facebook.com/v21.0";
const TIMEOUT_MS = 15_000;
// Com file_url a Meta baixa o mp4 antes de responder; dá mais folga que a foto.
const VIDEO_UPLOAD_TIMEOUT_MS = 60_000;

export type PublishChannelResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not_configured" | "missing_image" | "failed"; status?: number; error?: string };

export type PublishResult = {
  postId: string;
  facebook?: PublishChannelResult;
  instagram?: PublishChannelResult;
};

async function graphPost(
  path: string,
  body: Record<string, string>,
  { timeoutMs = TIMEOUT_MS, base = GRAPH_BASE }: { timeoutMs?: number; base?: string } = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${base}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...body, access_token: metaPageAccessToken }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

async function graphGet(
  path: string,
  params: Record<string, string>
): Promise<{ ok: boolean; status: number; data: any }> {
  const qs = new URLSearchParams({ ...params, access_token: metaPageAccessToken });
  const res = await fetch(`${GRAPH_BASE}/${path}?${qs}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

/** Tira o token da página de qualquer texto que vá pra resposta ou log. */
function redactToken(text: string): string {
  return metaPageAccessToken ? text.split(metaPageAccessToken).join("[token]") : text;
}

// O Instagram processa a mídia do container de forma assíncrona; publicar
// antes de status_code=FINISHED dá "Media ID is not available". Imagem fica
// pronta em segundos; Reel (vídeo) pode levar alguns minutos.
//
// O limite é um PRAZO de relógio, não um número de tentativas: cada consulta
// pode levar até TIMEOUT_MS, então contar tentativas deixaria o tempo total
// crescer sem controle. Nova consulta só começa antes do prazo, então o pior
// caso é o prazo + uma consulta em voo (TIMEOUT_MS).
type ContainerPoll = {
  intervalMs: number;
  timeoutMs: number;
  /** Prefixo da mensagem de erro (ex.: "container ERROR"). */
  label: string;
  timeoutError: string;
};

const IG_IMAGE_POLL: ContainerPoll = {
  intervalMs: 2_000,
  timeoutMs: 30_000,
  label: "container",
  timeoutError: "container não ficou pronto a tempo",
};

const IG_REEL_POLL_MS = 5_000;
const IG_REEL_TIMEOUT_MS = 300_000;
const IG_REEL_POLL: ContainerPoll = {
  intervalMs: IG_REEL_POLL_MS,
  timeoutMs: IG_REEL_TIMEOUT_MS,
  label: "container do reel",
  timeoutError: `container do reel não ficou pronto em ${IG_REEL_TIMEOUT_MS / 1000} s`,
};

/** Detalhe legível do campo `status` do container (ex.: "Error: ..."), sem token. */
function containerStatusDetail(data: any): string {
  const status = typeof data?.status === "string" ? data.status.trim() : "";
  return redactToken(status).slice(0, 300);
}

async function waitForInstagramContainer(
  containerId: string,
  poll: ContainerPoll
): Promise<string | null> {
  const deadline = Date.now() + poll.timeoutMs;

  for (;;) {
    const res = await graphGet(containerId, { fields: "status_code,status" });
    const code = res.data?.status_code;
    if (code === "FINISHED") return null;
    if (code === "ERROR" || code === "EXPIRED") {
      const detail = containerStatusDetail(res.data);
      return detail ? `${poll.label} ${code}: ${detail}` : `${poll.label} ${code}`;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) return poll.timeoutError;
    await new Promise((r) => setTimeout(r, Math.min(poll.intervalMs, remaining)));
    if (Date.now() >= deadline) return poll.timeoutError;
  }
}

function graphError(data: any): string {
  return redactToken(data?.error?.message || "erro desconhecido da Graph API");
}

async function publishToFacebook(post: SocialPost): Promise<PublishChannelResult> {
  if (!isMetaPublishConfigured) return { ok: false, reason: "not_configured" };

  const body: Record<string, string> = { message: post.texto };
  if (post.link) body.link = post.link;

  const result = post.videoUrl
    ? await graphPost(
        `${metaPageId}/videos`,
        { file_url: post.videoUrl, description: post.texto },
        { timeoutMs: VIDEO_UPLOAD_TIMEOUT_MS, base: GRAPH_VIDEO_BASE }
      )
    : post.imagemUrl
      ? await graphPost(`${metaPageId}/photos`, {
          url: post.imagemUrl,
          caption: post.texto,
        })
      : await graphPost(`${metaPageId}/feed`, body);

  if (!result.ok || !result.data?.id) {
    return { ok: false, reason: "failed", status: result.status, error: graphError(result.data) };
  }
  return { ok: true, id: String(result.data.id) };
}

async function publishToInstagram(post: SocialPost): Promise<PublishChannelResult> {
  if (!isInstagramPublishConfigured) return { ok: false, reason: "not_configured" };
  if (!post.videoUrl && !post.imagemUrl) return { ok: false, reason: "missing_image" };

  const isReel = Boolean(post.videoUrl);
  const container = isReel
    ? await graphPost(`${metaIgUserId}/media`, {
        media_type: "REELS",
        video_url: post.videoUrl!,
        caption: post.texto,
        share_to_feed: "true",
      })
    : await graphPost(`${metaIgUserId}/media`, {
        image_url: post.imagemUrl!,
        caption: post.texto,
      });
  if (!container.ok || !container.data?.id) {
    return { ok: false, reason: "failed", status: container.status, error: graphError(container.data) };
  }

  const notReady = await waitForInstagramContainer(
    String(container.data.id),
    isReel ? IG_REEL_POLL : IG_IMAGE_POLL
  );
  if (notReady) return { ok: false, reason: "failed", error: notReady };

  const published = await graphPost(`${metaIgUserId}/media_publish`, {
    creation_id: String(container.data.id),
  });
  if (!published.ok || !published.data?.id) {
    return { ok: false, reason: "failed", status: published.status, error: graphError(published.data) };
  }
  return { ok: true, id: String(published.data.id) };
}

/** Publica um post do calendário em todos os canais dele. */
export async function publishSocialPost(post: SocialPost): Promise<PublishResult> {
  const result: PublishResult = { postId: post.id };

  if (post.canais.includes("facebook")) {
    result.facebook = await publishToFacebook(post).catch((err) => ({
      ok: false as const,
      reason: "failed" as const,
      error: redactToken(err instanceof Error ? err.message : String(err)),
    }));
  }

  if (post.canais.includes("instagram")) {
    result.instagram = await publishToInstagram(post).catch((err) => ({
      ok: false as const,
      reason: "failed" as const,
      error: redactToken(err instanceof Error ? err.message : String(err)),
    }));
  }

  return result;
}
