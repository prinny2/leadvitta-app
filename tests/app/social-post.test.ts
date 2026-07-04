import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  publishSocialPost: vi.fn(),
  metaConfigured: { value: false },
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminDb: () => null,
}));

vi.mock("@/lib/social/meta-publisher", () => ({
  publishSocialPost: mocks.publishSocialPost,
}));

vi.mock("@/lib/config", () => ({
  get isMetaPublishConfigured() {
    return mocks.metaConfigured.value;
  },
  siteUrl: "http://localhost:3000",
}));

import { GET } from "@/app/api/marketing/social-post/route";
import { SOCIAL_POSTS } from "@/data/social-posts";

const FIRST_POST = SOCIAL_POSTS[0];
const BASE = "http://localhost:3000/api/marketing/social-post";

function call(query = "", headers: Record<string, string> = {}) {
  return GET(new Request(`${BASE}${query}`, { headers }));
}

describe("GET /api/marketing/social-post", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "segredo-teste");
    mocks.metaConfigured.value = false;
    mocks.publishSocialPost.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("responde 503 sem CRON_SECRET configurado", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const res = await call();
    expect(res.status).toBe(503);
  });

  it("responde 401 com bearer errado", async () => {
    const res = await call("", { authorization: "Bearer errado" });
    expect(res.status).toBe(401);
  });

  it("dry run lista os posts do dia sem publicar", async () => {
    const res = await call(`?date=${FIRST_POST.data}&dry=1`, {
      authorization: "Bearer segredo-teste",
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.dry_run).toBe(true);
    expect(body.due.map((p: { id: string }) => p.id)).toContain(FIRST_POST.id);
    expect(mocks.publishSocialPost).not.toHaveBeenCalled();
  });

  it("sem Meta configurada, pula os posts do dia sem publicar", async () => {
    const res = await call(`?date=${FIRST_POST.data}`, {
      authorization: "Bearer segredo-teste",
    });
    const body = await res.json();

    expect(body.configured).toBe(false);
    expect(body.skipped).toContain(FIRST_POST.id);
    expect(mocks.publishSocialPost).not.toHaveBeenCalled();
  });

  it("com Meta configurada, publica os posts do dia", async () => {
    mocks.metaConfigured.value = true;
    mocks.publishSocialPost.mockResolvedValue({
      postId: FIRST_POST.id,
      facebook: { ok: true, id: "123_456" },
    });

    const res = await call(`?date=${FIRST_POST.data}`, {
      authorization: "Bearer segredo-teste",
    });
    const body = await res.json();

    expect(body.configured).toBe(true);
    expect(mocks.publishSocialPost).toHaveBeenCalledTimes(1);
    expect(body.published[0].facebook.ok).toBe(true);
  });

  it("dia sem post no calendário não publica nada", async () => {
    mocks.metaConfigured.value = true;
    const res = await call("?date=1999-01-01", {
      authorization: "Bearer segredo-teste",
    });
    const body = await res.json();

    expect(body.published).toEqual([]);
    expect(mocks.publishSocialPost).not.toHaveBeenCalled();
  });
});
