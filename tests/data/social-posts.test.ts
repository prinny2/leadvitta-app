import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
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

  it("posts de Instagram têm imagem ou vídeo (exigência da Graph API)", () => {
    for (const post of SOCIAL_POSTS) {
      if (post.canais.includes("instagram")) {
        expect(
          post.imagemUrl || post.videoUrl,
          `post ${post.id} precisa de imagemUrl ou videoUrl`
        ).toBeTruthy();
      }
    }
  });

  it("videoUrl (Reel) é URL pública https de mp4", () => {
    for (const post of SOCIAL_POSTS) {
      if (post.videoUrl === undefined) continue;
      expect(post.videoUrl, `post ${post.id}`).toMatch(/^https:\/\/[^\s]+\.mp4$/i);
    }
  });

  it("Reel servido pelo site existe em public/reels/ e tem < 15 MB", () => {
    const PREFIXO_REELS = "https://www.leadbellus.com.br/reels/";
    const LIMITE_BYTES = 15 * 1024 * 1024;
    for (const post of SOCIAL_POSTS) {
      if (!post.videoUrl?.startsWith(PREFIXO_REELS)) continue;
      const nome = post.videoUrl.slice(PREFIXO_REELS.length);
      expect(nome, `${post.id}: ${post.videoUrl}`).toMatch(/^[\w.-]+\.mp4$/i);
      const arquivo = join(process.cwd(), "public/reels", nome);
      expect(existsSync(arquivo), `${post.id}: falta ${arquivo}`).toBe(true);
      expect(statSync(arquivo).size, `${post.id}: ${arquivo} passa de 15 MB`).toBeLessThan(LIMITE_BYTES);
    }
  });
});

describe("data/social-posts — cadência", () => {
  it("no máximo um post por data e turno", () => {
    const chaves = SOCIAL_POSTS.map((p) => `${p.data}|${p.turno ?? "manha"}`);
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});

describe("data/social-posts — artes únicas (a partir de 2026-11-03)", () => {
  const INICIO = "2026-11-03";
  const novos = SOCIAL_POSTS.filter((p) => p.data >= INICIO).sort((a, b) =>
    `${a.data}|${a.turno === "noite" ? 1 : 0}`.localeCompare(`${b.data}|${b.turno === "noite" ? 1 : 0}`),
  );
  const PREFIXO = "https://www.leadbellus.com.br/social/auto/";

  it("cobre manhã e noite de todos os dias até 2026-12-14", () => {
    expect(novos.length).toBeGreaterThanOrEqual(84);
  });

  it("cada post tem imagemUrl única", () => {
    const urls = novos.map((p) => p.imagemUrl);
    for (const url of urls) expect(url, "imagemUrl obrigatória").toBeTruthy();
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("a arte de cada post existe em public/social/auto/", () => {
    for (const post of novos) {
      expect(post.imagemUrl!.startsWith(PREFIXO), `${post.id}: ${post.imagemUrl}`).toBe(true);
      const arquivo = join(process.cwd(), "public/social/auto", post.imagemUrl!.slice(PREFIXO.length));
      expect(existsSync(arquivo), `falta ${arquivo} — rode scripts/social/render-social.mjs`).toBe(true);
    }
  });

  it("toda arte tem spec com título curto (≤ 8 palavras)", () => {
    for (const post of novos) {
      expect(post.arte, `${post.id} sem arte`).toBeTruthy();
      const palavras = post.arte!.hook.replace(/\*/g, "").trim().split(/\s+/);
      expect(palavras.length, `${post.id}: "${post.arte!.hook}"`).toBeLessThanOrEqual(8);
    }
  });

  it("dois posts seguidos nunca repetem o layout, e há pelo menos 6 layouts", () => {
    for (let i = 1; i < novos.length; i++) {
      expect(novos[i].arte!.layout, `${novos[i - 1].id} → ${novos[i].id}`).not.toBe(novos[i - 1].arte!.layout);
    }
    expect(new Set(novos.map((p) => p.arte!.layout)).size).toBeGreaterThanOrEqual(6);
  });

  it("posts da manhã vendem com o CTA de teste grátis", () => {
    for (const post of novos.filter((p) => (p.turno ?? "manha") === "manha")) {
      expect(post.texto, post.id).toContain("5 respostas grátis, sem cartão.");
    }
  });

  it("copy respeita compliance: no máximo 1 emoji, sem preço de procedimento, sem envio automático", () => {
    for (const post of novos) {
      const emojis = post.texto.match(/\p{Extended_Pictographic}/gu) ?? [];
      expect(emojis.length, `${post.id}: emojis`).toBeLessThanOrEqual(1);
      // Único valor permitido é o do plano Start.
      expect(post.texto, `${post.id}: preço`).not.toMatch(/R\$\s?(?!97\/m)\d/);
      expect(post.texto, `${post.id}: promessa`).not.toMatch(/resultado garantido|garantimos|garantia de resultado/i);
      expect(post.texto, `${post.id}: envio automático`).not.toMatch(/automaticamente|envia sozinha|responde sozinha/i);
    }
  });
});
