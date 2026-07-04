// Cron de publicação automática na Meta (Página FB + Instagram Business).
// Chamado diariamente pela Vercel Cron (vercel.json) com
// Authorization: Bearer ${CRON_SECRET}. Publica os posts de data/social-posts.ts
// cuja data é hoje (fuso America/Belem), com idempotência via Firestore quando
// o Admin SDK está configurado.

import { NextResponse } from "next/server";
import { jsonNoStore } from "@/lib/api-security";
import { isMetaPublishConfigured } from "@/lib/config";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { publishSocialPost, type PublishResult } from "@/lib/social/meta-publisher";
import { SOCIAL_POSTS } from "@/data/social-posts";

export const dynamic = "force-dynamic";

const LOG_COLLECTION = "social_posts_log";

function todayInBelem(): string {
  // en-CA formata como YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Belem",
  }).format(new Date());
}

function isAuthorized(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return jsonNoStore(
      { error: "CRON_SECRET não configurado." },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization") || "";
  if (header !== `Bearer ${secret}`) {
    return jsonNoStore({ error: "Não autorizado." }, { status: 401 });
  }

  return null;
}

async function alreadyPublished(postId: string): Promise<boolean> {
  const db = getFirebaseAdminDb();
  if (!db) return false;

  try {
    const doc = await db.collection(LOG_COLLECTION).doc(postId).get();
    return doc.exists;
  } catch (err) {
    console.warn("[social-post] falha ao ler log, seguindo sem dedupe:", err);
    return false;
  }
}

async function markPublished(result: PublishResult): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;

  try {
    await db.collection(LOG_COLLECTION).doc(result.postId).set({
      post_id: result.postId,
      facebook_id: result.facebook?.ok ? result.facebook.id : null,
      instagram_id: result.instagram?.ok ? result.instagram.id : null,
      published_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[social-post] falha ao gravar log:", err);
  }
}

export async function GET(request: Request) {
  const unauthorized = isAuthorized(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const date = url.searchParams.get("date") || todayInBelem();
  const dryRun = url.searchParams.get("dry") === "1";

  const due = SOCIAL_POSTS.filter((p) => p.data === date);

  if (dryRun) {
    return jsonNoStore({
      date,
      dry_run: true,
      configured: isMetaPublishConfigured,
      due: due.map((p) => ({ id: p.id, canais: p.canais })),
    });
  }

  if (!isMetaPublishConfigured) {
    return jsonNoStore({
      date,
      configured: false,
      published: [],
      skipped: due.map((p) => p.id),
    });
  }

  const published: PublishResult[] = [];
  const skipped: string[] = [];

  for (const post of due) {
    if (await alreadyPublished(post.id)) {
      skipped.push(post.id);
      continue;
    }

    const result = await publishSocialPost(post);
    published.push(result);

    if (result.facebook?.ok || result.instagram?.ok) {
      await markPublished(result);
    }
  }

  return jsonNoStore({ date, configured: true, published, skipped });
}
