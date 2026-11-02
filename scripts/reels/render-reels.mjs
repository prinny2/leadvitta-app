#!/usr/bin/env node
// Gera os Reels de demonstração do LeadBellus (1080x1920, 30 fps, H.264).
//
//   node scripts/reels/render-reels.mjs              # todos
//   node scripts/reels/render-reels.mjs r1 r4        # só alguns (prefixo do slug)
//
// R1–R3: cenas HTML animadas (scripts/reels/reels.mjs + engine.js). Cada
// quadro é renderizado de forma determinística (window.__seek(t)) e enviado
// como JPEG para o ffmpeg — mais nítido que o recordVideo do Playwright.
// R4: tour do site ao vivo (https://www.leadbellus.com.br) em viewport de
// celular, rolagem suave quadro a quadro, encaixado numa moldura com a faixa
// de legendas. Só rola a página: não faz login, não clica em "Gerar" e não
// envia formulário.
//
// Saída: public/reels/<slug>.mp4 (< 15 MB, sem áudio — o áudio em alta entra
// no app) e public/reels/<slug>-capa.png (1080x1920).
//
// Requer Playwright + Chromium e ffmpeg. Playwright não é dependência do app;
// aponte PLAYWRIGHT_MODULE para o pacote se não for resolvível, e FFMPEG para
// o binário se não estiver no PATH.

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { REELS, TOUR } from "./reels.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const outDir = join(root, "public/reels");
const FPS = 30;
const W = 1080;
const H = 1920;
const MAX_BYTES = 15 * 1024 * 1024;
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const SITE = process.env.REELS_SITE || "https://www.leadbellus.com.br";

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const c of [process.env.PLAYWRIGHT_MODULE, "playwright", "playwright-core"].filter(Boolean)) {
    try {
      return require(c);
    } catch {
      /* tenta o próximo */
    }
  }
  console.error("Playwright não encontrado. Rode `npx playwright install chromium` ou defina PLAYWRIGHT_MODULE.");
  process.exit(1);
}

const fontFaces = () => `
  @font-face { font-family: "Inter"; src: url("${pathToFileURL(join(root, "app/fonts/inter-latin-wght.woff2")).href}") format("woff2"); font-weight: 100 900; }
  @font-face { font-family: "Fraunces"; src: url("${pathToFileURL(join(root, "app/fonts/fraunces-latin-wght.woff2")).href}") format("woff2"); font-weight: 100 900; }`;

function pageHtml(body) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<style>${fontFaces()}</style>
<link rel="stylesheet" href="${pathToFileURL(join(here, "reels.css")).href}" /></head>
<body><div class="canvas"><div class="glow glow-a"></div><div class="glow glow-b"></div>${body}</div>
<script src="${pathToFileURL(join(here, "engine.js")).href}"></script></body></html>`;
}

/** Abre o ffmpeg lendo JPEGs pelo stdin (H.264, yuv420p limitado, 30 fps, faststart, sem áudio). */
function openEncoder(file) {
  const args = [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-vf", `scale=${W}:${H}:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "4M", "-bufsize", "8M",
    "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-movflags", "+faststart", "-an", file,
  ];
  const proc = spawn(FFMPEG, args, { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => proc.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg saiu com ${code}`)))));
  return {
    write: (buf) => new Promise((res) => (proc.stdin.write(buf) ? res() : proc.stdin.once("drain", res))),
    close: async () => {
      proc.stdin.end();
      await done;
    },
  };
}

function report(file, seconds) {
  const size = statSync(file).size;
  const rel = file.replace(root + "/", "");
  console.log(`✓ ${rel}  ${seconds.toFixed(1)} s  ${(size / 1024 / 1024).toFixed(2)} MB`);
  if (size > MAX_BYTES) throw new Error(`${rel} passou de 15 MB`);
}

function warnSafe(slug, problems) {
  if (!problems.size) return true;
  console.error(`  ! ${slug}: texto fora da área segura (y 250–1600)`);
  [...problems].slice(0, 12).forEach((p) => console.error(`    ${p}`));
  return false;
}

// ── R1–R3: cenas animadas ──────────────────────────────────────────────────
async function renderAnimated(browser, reel, work) {
  const htmlPath = join(work, `${reel.slug}.html`);
  writeFileSync(htmlPath, pageHtml(reel.html));
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => document.fonts.ready);

  const problems = new Set();
  const frames = Math.round(reel.duration * FPS);
  const file = join(outDir, `${reel.slug}.mp4`);
  const enc = openEncoder(file);
  for (let f = 0; f < frames; f++) {
    const t = f / FPS;
    await page.evaluate((tt) => window.__seek(tt), t);
    if (f % 10 === 0) for (const p of await page.evaluate(() => window.__safeCheck())) problems.add(`t=${t.toFixed(1)} ${p}`);
    await enc.write(await page.screenshot({ type: "jpeg", quality: 92 }));
  }
  await enc.close();

  await page.evaluate((tt) => window.__seek(tt), reel.cover);
  await page.screenshot({ path: join(outDir, `${reel.slug}-capa.png`), type: "png" });
  await page.close();

  report(file, frames / FPS);
  return warnSafe(reel.slug, problems);
}

// ── R4: tour do site ao vivo ───────────────────────────────────────────────
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

async function renderTour(browser, work) {
  const R4 = TOUR;
  const vp = R4.viewport;
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.scale,
    isMobile: true,
    hasTouch: true,
    locale: "pt-BR",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  });
  const site = await ctx.newPage();
  await site.goto(SITE, { waitUntil: "networkidle", timeout: 60000 });
  await site.evaluate(() => document.fonts.ready);

  // Aquece: rola a página toda para disparar as animações de entrada (FadeUp)
  // e volta ao topo. Nada é clicado nem enviado.
  const total = await site.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) {
    await site.evaluate((yy) => window.scrollTo(0, yy), y);
    await site.waitForTimeout(60);
  }
  await site.evaluate(() => window.scrollTo(0, 0));
  await site.waitForTimeout(1000);

  const targets = await site.evaluate((pts) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const byText = (txt, scope) => {
      const rootEl = scope ? document.querySelector(scope) : document.body;
      if (!rootEl) return null;
      let best = null;
      rootEl.querySelectorAll("*").forEach((el) => {
        const tc = el.textContent || "";
        if (tc.includes(txt) && (!best || tc.length < best.textContent.length)) best = el;
      });
      return best;
    };
    return pts.map((p) => {
      if (p.to === "top") return 0;
      const el = p.to.startsWith("text:") ? byText(p.to.slice(5), p.scope) : document.querySelector(p.to);
      if (!el) return null;
      const y = el.getBoundingClientRect().top + window.scrollY + (p.dy || 0);
      return Math.max(0, Math.min(max, Math.round(y)));
    });
  }, R4.scroll);
  if (targets.some((v) => v === null)) throw new Error(`Alvo de rolagem não encontrado no site: ${JSON.stringify(targets)}`);

  // Página de composição: faixa de legendas + "tela" com o quadro do site.
  const htmlPath = join(work, `${R4.slug}.html`);
  writeFileSync(htmlPath, pageHtml(R4.html));
  const frame = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await frame.goto(pathToFileURL(htmlPath).href);
  await frame.evaluate(() => document.fonts.ready);

  const scrollAt = (t) => {
    const pts = R4.scroll;
    if (t <= pts[0].t) return targets[0];
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i].t) return targets[i - 1] + (targets[i] - targets[i - 1]) * ease((t - pts[i - 1].t) / (pts[i].t - pts[i - 1].t));
    }
    return targets[targets.length - 1];
  };

  const problems = new Set();
  const frames = Math.round(R4.duration * FPS);
  const file = join(outDir, `${R4.slug}.mp4`);
  const enc = openEncoder(file);
  const endAt = R4.scroll[R4.scroll.length - 1].t + 0.4; // cartão final já cobre a tela
  let captured = false;
  for (let f = 0; f < frames; f++) {
    const t = f / FPS;
    if (t <= endAt || !captured) {
      await site.evaluate((y) => window.scrollTo(0, y), scrollAt(t));
      await site.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const shot = (await site.screenshot({ type: "jpeg", quality: 90 })).toString("base64");
      await frame.evaluate(async (b64) => {
        const img = document.getElementById("site");
        img.src = `data:image/jpeg;base64,${b64}`;
        await img.decode();
      }, shot);
      captured = true;
    }
    await frame.evaluate((tt) => window.__seek(tt), t);
    if (f % 10 === 0) for (const p of await frame.evaluate(() => window.__safeCheck())) problems.add(`t=${t.toFixed(1)} ${p}`);
    await enc.write(await frame.screenshot({ type: "jpeg", quality: 92 }));
    if (Math.abs(t - R4.cover) < 1e-6) await frame.screenshot({ path: join(outDir, `${R4.slug}-capa.png`), type: "png" });
  }
  await enc.close();
  await frame.close();
  await ctx.close();

  report(file, frames / FPS);
  return warnSafe(R4.slug, problems);
}

async function main() {
  const only = process.argv.slice(2);
  const want = (slug) => !only.length || only.some((o) => slug.startsWith(o));
  mkdirSync(outDir, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "leadbellus-reels-"));
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ chromiumSandbox: false });
  let ok = true;
  try {
    for (const reel of REELS) if (want(reel.slug)) ok = (await renderAnimated(browser, reel, work)) && ok;
    if (want(TOUR.slug)) ok = (await renderTour(browser, work)) && ok;
  } finally {
    await browser.close();
    rmSync(work, { recursive: true, force: true });
  }
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
