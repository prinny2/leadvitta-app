// Peças compartilhadas pelos geradores de arte social (render-social.mjs e
// render-kit.mjs): Playwright, escape de HTML, ícones e a marca LeadBellus.

import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const root = resolve(here, "../..");
export const MAX_BYTES = 1024 * 1024;

export function loadPlaywright() {
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

/** URLs file:// das fontes da LP (app/fonts) e de folhas de estilo desta pasta. */
export function assetUrls(...css) {
  return {
    CSS: css.map((f) => pathToFileURL(join(here, f)).href),
    FONT_INTER: pathToFileURL(join(root, "app/fonts/inter-latin-wght.woff2")).href,
    FONT_FRAUNCES: pathToFileURL(join(root, "app/fonts/fraunces-latin-wght.woff2")).href,
  };
}

export const fontFaces = (assets) => `
  @font-face { font-family: "Inter"; src: url("${assets.FONT_INTER}") format("woff2"); font-weight: 100 900; font-style: normal; }
  @font-face { font-family: "Fraunces"; src: url("${assets.FONT_FRAUNCES}") format("woff2"); font-weight: 100 900; font-style: normal; }`;

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Escapa e converte *ênfase* em <em>. */
export const rich = (s = "") => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

export const icon = (d, size = 30, stroke = "currentColor", width = 2.4) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const I = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  sparkles: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};

/** Símbolo da marca (folha), na cor do texto ao redor. */
export const LOGO = `<svg class="logo" viewBox="0 0 80 96" fill="none" aria-hidden="true">
  <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  <line x1="40" y1="32" x2="40" y2="86" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <circle cx="40" cy="27" r="6" fill="currentColor"/>
</svg>`;

/** Bloco de marca do rodapé: símbolo + LeadBellus + URL. */
export const brand = (url = "www.leadbellus.com.br") => `
  <div class="brand">
    ${LOGO}
    <div>
      <p class="wordmark">LeadBellus</p>
      <p class="url">${esc(url)}</p>
    </div>
  </div>`;
