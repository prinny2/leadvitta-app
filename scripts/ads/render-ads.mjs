#!/usr/bin/env node
// Gera os criativos de anúncio (Meta Ads) do LeadBellus em PNG.
//
//   node scripts/ads/render-ads.mjs            # todos
//   node scripts/ads/render-ads.mjs hero demo  # só alguns (por slug)
//
// Saída: public/ads/NN-slug-1080.png (feed 1080x1080) e NN-slug-1920.png
// (stories/reels 1080x1920, texto dentro da área segura central ~1080x1420).
//
// Requer Playwright + Chromium. O pacote não é dependência do app; se não
// estiver resolvível, aponte PLAYWRIGHT_MODULE para o diretório do pacote
// (ex.: PLAYWRIGHT_MODULE=~/.npm/_npx/<hash>/node_modules/playwright).

import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CREATIVES } from "./creatives.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const outDir = join(root, "public/ads");
const MAX_BYTES = 1024 * 1024;

const FORMATS = [
  { id: "1080", width: 1080, height: 1080 },
  { id: "1920", width: 1080, height: 1920 },
];

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [process.env.PLAYWRIGHT_MODULE, "playwright", "playwright-core"].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c);
    } catch {
      /* tenta o próximo */
    }
  }
  console.error("Playwright não encontrado. Rode `npx playwright install chromium` ou defina PLAYWRIGHT_MODULE.");
  process.exit(1);
}

function fill(tpl, values) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in values ? values[k] : ""));
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? CREATIVES.filter((c) => only.includes(c.slug)) : CREATIVES;
  if (!list.length) {
    console.error(`Nenhum criativo para: ${only.join(", ")}`);
    process.exit(1);
  }

  const template = readFileSync(join(here, "template.html"), "utf8");
  const assets = {
    CSS: pathToFileURL(join(here, "ads.css")).href,
    FONT_INTER: pathToFileURL(join(root, "app/fonts/inter-latin-wght.woff2")).href,
    FONT_FRAUNCES: pathToFileURL(join(root, "app/fonts/fraunces-latin-wght.woff2")).href,
  };

  mkdirSync(outDir, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "leadbellus-ads-"));
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  let failed = false;

  try {
    for (const c of list) {
      for (const f of FORMATS) {
        const html = fill(template, {
          ...assets,
          SLUG: c.slug,
          FMT: f.id,
          EYEBROW: c.eyebrow,
          HOOK: c.hook,
          SUPPORT: c.support,
          CTA: c.cta,
          VISUAL: c.visual,
        });
        const htmlPath = join(work, `${c.n}-${c.slug}-${f.id}.html`);
        writeFileSync(htmlPath, html);

        const page = await browser.newPage({ viewport: { width: f.width, height: f.height }, deviceScaleFactor: 1 });
        await page.goto(pathToFileURL(htmlPath).href);
        await page.evaluate(() => document.fonts.ready);

        // Guarda contra texto cortado: o conteúdo precisa caber na área segura.
        const overflow = await page.evaluate(() => {
          const safe = document.querySelector(".safe");
          const visual = document.querySelector(".visual");
          const inner = visual.firstElementChild;
          const problems = [];
          if (safe.scrollHeight > safe.clientHeight + 1) problems.push("safe area overflow");
          const cs = getComputedStyle(visual);
          const room = visual.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
          if (inner && inner.getBoundingClientRect().height > room + 1) problems.push("visual overflow");
          return problems;
        });
        if (overflow.length) {
          failed = true;
          console.error(`  ! ${c.n}-${c.slug}-${f.id}: ${overflow.join(", ")}`);
        }

        const file = join(outDir, `${c.n}-${c.slug}-${f.id}.png`);
        await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width: f.width, height: f.height } });
        await page.close();

        const size = statSync(file).size;
        if (size > MAX_BYTES) {
          failed = true;
          console.error(`  ! ${file} tem ${(size / 1024).toFixed(0)} KB (> 1 MB)`);
        }
        console.log(`✓ public/ads/${c.n}-${c.slug}-${f.id}.png  ${(size / 1024).toFixed(0)} KB`);
      }
    }
  } finally {
    await browser.close();
    rmSync(work, { recursive: true, force: true });
  }
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
