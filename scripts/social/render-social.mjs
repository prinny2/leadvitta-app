#!/usr/bin/env node
// Gera uma arte única (1080x1350, feed 4:5) para cada post do calendário
// orgânico que tem o campo `arte` em data/social-posts.ts.
//
//   node scripts/social/render-social.mjs                 # todas
//   node scripts/social/render-social.mjs <id> [<id>...]  # só algumas
//
// Saída: public/social/auto/<post-id>.png (servida em
// https://www.leadbellus.com.br/social/auto/<post-id>.png).
//
// Mesma linguagem visual dos criativos de anúncio (scripts/ads): fontes Inter
// + Fraunces de app/fonts, navy + dourado. Os temas de cor giram pela ordem
// cronológica dos posts, então dois posts seguidos nunca saem com a mesma
// cor — e os layouts já se alternam no próprio calendário.
//
// Falha (exit 1) se algum texto vazar da área segura ou se um PNG passar de 1 MB.
//
// Requer Node >= 22.18 (lê o .ts direto, com type stripping) e Playwright +
// Chromium. O pacote não é dependência do app; se não estiver resolvível,
// aponte PLAYWRIGHT_MODULE para o diretório do pacote
// (ex.: PLAYWRIGHT_MODULE=~/.npm/_npx/<hash>/node_modules/playwright).

import { createRequire } from "node:module";
import { mkdtempSync, writeFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const outDir = join(root, "public/social/auto");
const MAX_BYTES = 1024 * 1024;
const W = 1080;
const H = 1350;

/** Temas dentro da paleta da marca. A ordem importa: vizinhos nunca repetem. */
const THEMES = ["navy", "creme", "petroleo", "ouro", "noite"];

const KIND = {
  chat: "Resposta pronta",
  antesdepois: "Antes × depois",
  citacao: "Para lembrar",
  checklist: "Checklist",
  mito: "Mito × verdade",
  agenda: "Bastidor",
  persona: "Na rotina",
  pergunta: "Enquete",
};

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

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Escapa e converte *ênfase* em <em>. */
const rich = (s = "") => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

const icon = (d, size = 30, stroke = "currentColor", width = 2.4) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const I = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  sparkles: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};

const chatHead = (name, status) => `
  <div class="chat-head">
    <div class="avatar">${icon(I.message, 26, "#1FA855", 2)}</div>
    <div><p class="name">${esc(name)}</p><p class="status">${esc(status)}</p></div>
  </div>`;

const initials = (s) =>
  s
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Corpo de cada layout: { hook (HTML do título ou ""), visual (HTML) }. */
const LAYOUTS = {
  chat(a) {
    const clinicaPrimeiro = a.ordem === "clinica";
    const [t1, t2] = ["14:37", "14:38"];
    const inMsg = `<div class="bubble in">${esc(a.cliente)}<span class="time">${clinicaPrimeiro ? t2 : t1}</span></div>`;
    const outMsg = `<div class="bubble out">${esc(a.resposta)}<span class="time">${clinicaPrimeiro ? t1 : t2}</span></div>`;
    const body = clinicaPrimeiro ? outMsg + inMsg : inMsg + outMsg;
    return {
      visual: `
      <div class="phone">
        ${chatHead("Cliente · WhatsApp", "online agora")}
        <div class="chat-body">${body}</div>
        <div class="typing-row">
          <span class="tag">Suave</span><span class="tag">Consultiva</span><span class="tag gold">Fechamento</span>
          <span class="note">a equipe revisa e envia</span>
        </div>
      </div>`,
    };
  },
  antesdepois(a) {
    return {
      visual: `
      <div class="ad">
        <div class="bubble in solo">${esc(a.cliente)}</div>
        <div class="ad-card weak">
          <p class="lbl">${icon(I.x, 24)} Resposta fraca</p>
          <p class="txt">${esc(a.fraca)}</p>
        </div>
        <div class="ad-card strong">
          <p class="lbl">${icon(I.check, 24)} Resposta da secretária</p>
          <p class="txt">${esc(a.resposta)}</p>
        </div>
      </div>`,
    };
  },
  citacao(a) {
    return {
      hookInVisual: true,
      visual: `
      <div class="quote">
        <span class="qmark">“</span>
        <h1 class="hook quote-text">${rich(a.hook)}</h1>
        ${a.autor ? `<p class="autor"><span class="rule"></span>${esc(a.autor)}</p>` : ""}
        ${a.sub ? `<p class="chip-sub">${esc(a.sub)}</p>` : ""}
      </div>`,
    };
  },
  checklist(a) {
    const ico = a.negativo ? I.x : I.check;
    return {
      visual: `
      <ul class="list ${a.negativo ? "neg" : ""}">
        ${(a.itens || [])
          .map(
            (t, i) =>
              `<li><span class="ck">${icon(ico, 30, "currentColor", 3)}</span><span class="li-t">${esc(t)}</span><span class="li-n">${String(i + 1).padStart(2, "0")}</span></li>`,
          )
          .join("")}
      </ul>`,
    };
  },
  mito(a) {
    return {
      visual: `
      <div class="mv">
        <div class="mv-block mito">
          <span class="mv-lbl">${icon(I.x, 22, "currentColor", 3)} Mito</span>
          <p class="mv-t">${esc(a.mito)}</p>
        </div>
        <div class="mv-block verdade">
          <span class="mv-lbl">${icon(I.check, 22, "currentColor", 3)} Verdade</span>
          <p class="mv-t">${esc(a.verdade)}</p>
        </div>
      </div>`,
    };
  },
  agenda(a) {
    return {
      visual: `
      <div class="agenda">
        ${(a.itens || [])
          .map((row) => {
            const [k, ...rest] = row.split("|");
            return `<div class="ag-row"><span class="ag-k">${esc(k)}</span><span class="ag-t">${esc(rest.join("|"))}</span></div>`;
          })
          .join("")}
      </div>`,
    };
  },
  persona(a) {
    return {
      visual: `
      <div class="persona">
        <div class="pc-top">
          <div class="pc-avatar">${esc(initials(a.persona || "LB"))}</div>
          <div>
            <p class="pc-name">${esc(a.persona)}</p>
            ${a.tag ? `<span class="pc-tag">${esc(a.tag)}</span>` : ""}
          </div>
        </div>
        ${a.sub ? `<p class="pc-sub">${esc(a.sub)}</p>` : ""}
        <div class="pc-notes">
          <div class="pc-note">${icon(I.message, 24, "#1FA855", 2)}<span>Nova mensagem no WhatsApp</span><b>agora</b></div>
          <div class="pc-note dim">${icon(I.clock, 24)}<span>Conversa esperando resposta</span><b>2 h</b></div>
        </div>
      </div>`,
    };
  },
  pergunta(a) {
    return {
      visual: `
      <div class="poll">
        ${(a.itens || [])
          .map((t, i) => `<div class="opt"><span class="opt-l">${"ABCDEF"[i]}</span><span class="opt-t">${esc(t)}</span></div>`)
          .join("")}
        <p class="poll-foot">Responda nos comentários com a letra</p>
      </div>`,
    };
  },
};

function pageHtml(post, theme, variant, assets) {
  const a = post.arte;
  const build = LAYOUTS[a.layout];
  if (!build) throw new Error(`layout desconhecido "${a.layout}" em ${post.id}`);
  const body = build(a);
  const turno = post.turno ?? "manha";
  const eyebrow = a.layout === "persona" ? "" : a.tag || "";
  const pill =
    turno === "manha"
      ? `<span class="pill">5 respostas grátis · sem cartão</span>`
      : `<span class="pill ghost">Salve para usar amanhã</span>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>LeadBellus — ${esc(post.id)}</title>
<style>
  @font-face { font-family: "Inter"; src: url("${assets.FONT_INTER}") format("woff2"); font-weight: 100 900; font-style: normal; }
  @font-face { font-family: "Fraunces"; src: url("${assets.FONT_FRAUNCES}") format("woff2"); font-weight: 100 900; font-style: normal; }
</style>
<link rel="stylesheet" href="${assets.CSS}" />
</head>
<body class="t-${theme} l-${a.layout} v-${variant} turno-${turno}">
  <div class="canvas">
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
    <div class="safe">
      <div class="top">
        <span class="kind">${esc(KIND[a.layout])}</span>
        ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
      </div>
      ${body.hookInVisual ? "" : `<h1 class="hook">${rich(a.hook)}</h1>`}
      ${!body.hookInVisual && a.sub && a.layout !== "persona" ? `<p class="sub">${esc(a.sub)}</p>` : ""}
      <div class="visual">${body.visual}</div>
      <div class="bottom">
        <div class="brand">
          <svg class="logo" viewBox="0 0 80 96" fill="none" aria-hidden="true">
            <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <line x1="40" y1="32" x2="40" y2="86" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <circle cx="40" cy="27" r="6" fill="currentColor"/>
          </svg>
          <div>
            <p class="wordmark">LeadBellus</p>
            <p class="url">www.leadbellus.com.br</p>
          </div>
        </div>
        ${pill}
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  if (!process.features?.typescript) {
    console.error("Este script lê data/social-posts.ts direto: use Node >= 22.18 (type stripping).");
    process.exit(1);
  }
  const { SOCIAL_POSTS } = await import(pathToFileURL(join(root, "data/social-posts.ts")).href);
  const ordered = SOCIAL_POSTS.filter((p) => p.arte).sort((a, b) =>
    `${a.data}|${a.turno === "noite" ? 1 : 0}`.localeCompare(`${b.data}|${b.turno === "noite" ? 1 : 0}`),
  );
  const only = process.argv.slice(2);
  const list = only.length ? ordered.filter((p) => only.includes(p.id)) : ordered;
  if (!list.length) {
    console.error(`Nenhum post com arte para: ${only.join(", ") || "(todos)"}`);
    process.exit(1);
  }

  const assets = {
    CSS: pathToFileURL(join(here, "social.css")).href,
    FONT_INTER: pathToFileURL(join(root, "app/fonts/inter-latin-wght.woff2")).href,
    FONT_FRAUNCES: pathToFileURL(join(root, "app/fonts/fraunces-latin-wght.woff2")).href,
  };

  mkdirSync(outDir, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "leadbellus-social-"));
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  let failed = false;

  try {
    for (const post of list) {
      const i = ordered.indexOf(post);
      const html = pageHtml(post, THEMES[i % THEMES.length], i % 3, assets);
      const htmlPath = join(work, `${post.id}.html`);
      writeFileSync(htmlPath, html);

      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlPath).href);
      await page.evaluate(() => document.fonts.ready);

      // Título longo: reduz a fonte até caber (mínimo 56px). Depois, a guarda.
      await page.evaluate(() => {
        const safe = document.querySelector(".safe");
        const hook = document.querySelector(".hook");
        let size = parseFloat(getComputedStyle(hook).fontSize);
        const min = 56;
        const tooTall = () => safe.scrollHeight > safe.clientHeight + 1 || hook.getBoundingClientRect().height > size * 1.1 * 3.05;
        while (tooTall() && size > min) {
          size -= 2;
          hook.style.fontSize = `${size}px`;
        }
      });

      // Guarda contra texto cortado (mesma ideia do render-ads): tudo dentro da área segura.
      const overflow = await page.evaluate(() => {
        const safe = document.querySelector(".safe");
        const visual = document.querySelector(".visual");
        const inner = visual.firstElementChild;
        const problems = [];
        if (safe.scrollHeight > safe.clientHeight + 1) problems.push("safe area overflow");
        const cs = getComputedStyle(visual);
        const room = visual.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        if (inner && inner.getBoundingClientRect().height > room + 1) problems.push("visual overflow");
        const box = safe.getBoundingClientRect();
        for (const el of safe.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          if (r.left < box.left - 1 || r.right > box.right + 1 || r.bottom > box.bottom + 1) {
            problems.push(`<${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> fora da área segura`);
            break;
          }
          if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "visible") {
            problems.push(`<${el.tagName.toLowerCase()}> texto cortado na horizontal`);
            break;
          }
        }
        return problems;
      });
      if (overflow.length) {
        failed = true;
        console.error(`  ! ${post.id}: ${overflow.join(", ")}`);
      }

      const file = join(outDir, `${post.id}.png`);
      await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width: W, height: H } });
      await page.close();

      const size = statSync(file).size;
      if (size > MAX_BYTES) {
        failed = true;
        console.error(`  ! ${file} tem ${(size / 1024).toFixed(0)} KB (> 1 MB)`);
      }
      console.log(`✓ public/social/auto/${post.id}.png  ${(size / 1024).toFixed(0)} KB  [${post.arte.layout}]`);
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
