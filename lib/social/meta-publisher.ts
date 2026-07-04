// Publicação de posts orgânicos na Meta (Página do Facebook + Instagram
// Business) via Graph API. Server-only — o token de página NUNCA vai pro
// cliente. Instagram exige imagem (fluxo container -> publish); post sem
// imagem sai só no Facebook.

import {
  isInstagramPublishConfigured,
  isMetaPublishConfigured,
  metaIgUserId,
  metaPageAccessToken,
  metaPageId,
} from "@/lib/config";
import type { SocialPost } from "@/data/social-posts";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";
const TIMEOUT_MS = 15_000;

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
  body: Record<string, string>
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...body, access_token: metaPageAccessToken }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function graphError(data: any): string {
  return data?.error?.message || "erro desconhecido da Graph API";
}

async function publishToFacebook(post: SocialPost): Promise<PublishChannelResult> {
  if (!isMetaPublishConfigured) return { ok: false, reason: "not_configured" };

  const body: Record<string, string> = { message: post.texto };
  if (post.link) body.link = post.link;

  const result = post.imagemUrl
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
  if (!post.imagemUrl) return { ok: false, reason: "missing_image" };

  const container = await graphPost(`${metaIgUserId}/media`, {
    image_url: post.imagemUrl,
    caption: post.texto,
  });
  if (!container.ok || !container.data?.id) {
    return { ok: false, reason: "failed", status: container.status, error: graphError(container.data) };
  }

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
      error: err instanceof Error ? err.message : String(err),
    }));
  }

  if (post.canais.includes("instagram")) {
    result.instagram = await publishToInstagram(post).catch((err) => ({
      ok: false as const,
      reason: "failed" as const,
      error: err instanceof Error ? err.message : String(err),
    }));
  }

  return result;
}
