import { describe, it, expect } from "vitest";
import { SOCIAL_POSTS } from "@/data/social-posts";

describe("data/social-posts", () => {
  it("tem posts no calendário", () => {
    expect(SOCIAL_POSTS.length).toBeGreaterThan(0);
  });

  it("ids são únicos", () => {
    const ids = SOCIAL_POSTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("datas são YYYY-MM-DD válidas", () => {
    for (const post of SOCIAL_POSTS) {
      expect(post.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(post.data))).toBe(false);
    }
  });

  it("todo post tem texto e pelo menos um canal", () => {
    for (const post of SOCIAL_POSTS) {
      expect(post.texto.trim().length).toBeGreaterThan(0);
      // Limite de caption do Instagram (2200) cobre também o Facebook.
      expect(post.texto.length).toBeLessThanOrEqual(2200);
      expect(post.canais.length).toBeGreaterThan(0);
      for (const canal of post.canais) {
        expect(["facebook", "instagram"]).toContain(canal);
      }
    }
  });

  it("posts de Instagram têm imagem (exigência da Graph API)", () => {
    for (const post of SOCIAL_POSTS) {
      if (post.canais.includes("instagram")) {
        expect(post.imagemUrl, `post ${post.id} precisa de imagemUrl`).toBeTruthy();
      }
    }
  });
});
