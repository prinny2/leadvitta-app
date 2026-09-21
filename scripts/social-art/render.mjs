// Gera as artes sociais (public/social/*.jpg) a partir de scripts/social-art/boards.html.
//
// Cada `.board[data-id]` do HTML vira um JPEG com o nome do data-id, no tamanho
// exato do elemento. As fontes são embutidas em base64 para o resultado não
// depender de rede nem das fontes do sistema.
//
// JPEG e não PNG porque a API de publicação do Instagram (POST /{ig-user-id}/media,
// usada por lib/social/meta-publisher.ts) só aceita JPEG na image_url.
//
// Uso (playwright-core não é dependência do app — instale sob demanda):
//   npm i --no-save playwright-core
//   node scripts/social-art/render.mjs [diretorio-de-saida]
//
// Requer um Chromium local. Defina CHROMIUM_PATH se não estiver no caminho
// padrão do Playwright.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, "../..");
const OUT = process.argv[2] || path.join(REPO, "public/social");

const b64 = (p) => fs.readFileSync(p).toString("base64");

function resolveChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  const dir = fs
    .readdirSync(root)
    .find((d) => d.startsWith("chromium-"));
  if (!dir) throw new Error(`Chromium não encontrado em ${root}. Defina CHROMIUM_PATH.`);
  return path.join(root, dir, "chrome-linux/chrome");
}

// Inter (OFL) para o texto e Fraunces (OFL) para o wordmark — a mesma fonte do
// pacote de marca em public/brand/fonts.
const fontCss = `
@font-face{font-family:'Inter';font-weight:100 900;font-style:normal;font-display:block;
  src:url(data:font/woff2;base64,${b64(path.join(DIR, "fonts/inter-variable.woff2"))}) format('woff2');}
@font-face{font-family:'Fraunces';font-weight:100 900;font-style:normal;font-display:block;
  src:url(data:font/ttf;base64,${b64(path.join(REPO, "public/brand/fonts/Fraunces.ttf"))}) format('truetype');}
`;

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: resolveChromium(),
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const page = await browser.newPage({
  viewport: { width: 1700, height: 1000 },
  deviceScaleFactor: 1,
});

await page.goto("file://" + path.join(DIR, "boards.html"));
await page.addStyleTag({ content: fontCss });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700); // deixa o layout assentar com as fontes já aplicadas

const ids = await page.$$eval(".board[data-id]", (els) => els.map((e) => e.dataset.id));
for (const id of ids) {
  const el = await page.$(`.board[data-id="${id}"]`);
  const { width, height } = await el.boundingBox();
  await el.screenshot({ path: path.join(OUT, `${id}.jpg`), type: "jpeg", quality: 92 });
  console.log(`${id}.jpg  ${Math.round(width)}×${Math.round(height)}`);
}

await browser.close();
console.log(`\n${ids.length} artes geradas em ${OUT}`);
