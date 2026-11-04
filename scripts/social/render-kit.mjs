#!/usr/bin/env node
// Kit de marca para as redes (peças que o calendário orgânico não cobre):
//
//   - carrossel Instagram (5 cards, 1080x1350)
//   - card do Canal do WhatsApp (1080x1080)
//   - capa da Página do Facebook (1640x624, conteúdo no centro 1200x464)
//   - 2 Stories (1080x1920, conteúdo entre y 250 e 1600)
//
//   node scripts/social/render-kit.mjs                    # todas
//   node scripts/social/render-kit.mjs story-enquete capa # só algumas (por slug)
//
// Saída: public/social/kit/<slug>.png. Uso de cada peça, legenda e passo a
// passo de publicação: docs/marketing/kit-social.md.
//
// Mesma linguagem do feed (render-social.mjs): social.css + kit.css, fontes
// Inter + Fraunces de app/fonts, paleta navy/dourado/creme.
//
// Falha (exit 1) se algum texto vazar da área segura ou se um PNG passar de 1 MB.
//
// Compliance: sem promessa de resultado, sem preço de procedimento, sem
// alegação médica, sem estatística inventada e nunca dizer que o LeadBellus
// envia sozinho ou se conecta ao WhatsApp — a equipe revisa e envia.
//
// Requer Playwright + Chromium (não é dependência do app). Se não estiver
// resolvível, aponte PLAYWRIGHT_MODULE para o diretório do pacote
// (ex.: PLAYWRIGHT_MODULE=~/.npm/_npx/<hash>/node_modules/playwright).

import { mkdtempSync, writeFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { root, MAX_BYTES, loadPlaywright, assetUrls, fontFaces, esc, rich, icon, I, LOGO, brand } from "./lib.mjs";

const outDir = join(root, "public/social/kit");

const FORMATS = {
  carrossel: { width: 1080, height: 1350 },
  quadrado: { width: 1080, height: 1080 },
  capa: { width: 1640, height: 624 },
  story: { width: 1080, height: 1920 },
};

// ── Peças reaproveitadas ───────────────────────────────────────────────────
const chatHead = (name, status) => `
  <div class="chat-head">
    <div class="avatar">${icon(I.message, 26, "#1FA855", 2)}</div>
    <div><p class="name">${esc(name)}</p><p class="status">${esc(status)}</p></div>
  </div>`;

const TOTAL = 5;
const pageIndicator = (n) => `
  <span class="page">
    <span class="dots">${Array.from({ length: TOTAL }, (_, i) => `<i class="${i + 1 === n ? "on" : ""}"></i>`).join("")}</span>
    ${n}/${TOTAL}
  </span>`;

const weak = (n, t) =>
  `<div class="wk"><span class="n">${String(n).padStart(2, "0")}</span><span class="t">${esc(t)}</span><span class="x">${icon(I.x, 26, "currentColor", 3)}</span></div>`;

const strong = (t) => `
  <div class="ad-card strong">
    <p class="lbl">${icon(I.check, 24)} Resposta melhor</p>
    <p class="txt">${esc(t)}</p>
  </div>`;

/** Esqueleto comum: topo (selo + eyebrow + extra), título, sub, visual e rodapé. */
const frame = ({ kind, eyebrow = "", topExtra = "", hook, sub = "", visual, bottomRight = "", noBottom = false }) => `
  <div class="top">
    <span class="kind">${esc(kind)}</span>
    ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
    ${topExtra}
  </div>
  ${hook ? `<h1 class="hook">${rich(hook)}</h1>` : ""}
  ${sub ? `<p class="sub">${rich(sub)}</p>` : ""}
  <div class="visual">${visual}</div>
  ${noBottom ? "" : `<div class="bottom">${brand()}${bottomRight}</div>`}`;

// As 5 respostas fracas do carrossel (numeradas 01–05 ao longo dos cards).
const FRACAS = [
  "Segue a tabela em PDF.",
  "Só passando na avaliação.",
  "Ok, qualquer coisa me chama.",
  "Mas a promoção acaba hoje, hein!",
  "Oi?? Vai querer ou não?",
];

// ── Peças ──────────────────────────────────────────────────────────────────
const PIECES = [
  {
    slug: "carrossel-01-capa",
    format: "carrossel",
    theme: "navy",
    variant: 0,
    body: () =>
      frame({
        kind: "Carrossel",
        eyebrow: "WhatsApp da clínica",
        topExtra: pageIndicator(1),
        hook: "5 mensagens que fazem sua clínica *perder cliente* no WhatsApp",
        sub: "Já mandou alguma delas? Arraste: tem a versão melhor de cada uma.",
        visual: `<div class="wk-list">${FRACAS.map((t, i) => weak(i + 1, t)).join("")}</div>`,
        bottomRight: `<span class="swipe">Arraste ${icon(I.arrowRight, 28, "currentColor", 2.8)}</span>`,
      }),
  },
  {
    slug: "carrossel-02-preco",
    format: "carrossel",
    theme: "navy",
    variant: 1,
    body: () =>
      frame({
        kind: "Erros 01 e 02",
        eyebrow: "Preço",
        topExtra: pageIndicator(2),
        hook: "Quando ela pergunta o *preço*",
        sub: "Ela quer entender se vale a pena, não só receber um número.",
        visual: `
        <div class="cmp">
          <div class="bubble in solo">Oi! Quanto custa o preenchimento labial?</div>
          ${weak(1, FRACAS[0])}
          ${weak(2, FRACAS[1])}
          ${strong("Oi! O valor depende do que for planejado para você na avaliação, porque cada caso é único. Quer que eu veja um horário esta semana?")}
        </div>`,
        bottomRight: `<span class="pill ghost">Salve para usar amanhã</span>`,
      }),
  },
  {
    slug: "carrossel-03-vou-pensar",
    format: "carrossel",
    theme: "navy",
    variant: 2,
    body: () =>
      frame({
        kind: "Erros 03 e 04",
        eyebrow: "Vou pensar",
        topExtra: pageIndicator(3),
        hook: "Quando ela diz “vou *pensar*”",
        sub: "Quase sempre ficou uma dúvida. Pressão afasta; acolhimento aproxima.",
        visual: `
        <div class="cmp">
          <div class="bubble in solo">Vou pensar e te falo, tá?</div>
          ${weak(3, FRACAS[2])}
          ${weak(4, FRACAS[3])}
          ${strong("Claro, é uma decisão importante! Ficou alguma dúvida que eu possa esclarecer agora? Se preferir, te mando os horários livres.")}
        </div>`,
        bottomRight: `<span class="pill ghost">Salve para usar amanhã</span>`,
      }),
  },
  {
    slug: "carrossel-04-sumiu",
    format: "carrossel",
    theme: "navy",
    variant: 0,
    body: () =>
      frame({
        kind: "Erro 05",
        eyebrow: "Sumiu depois do orçamento",
        topExtra: pageIndicator(4),
        hook: "Quando ela *sumiu* depois do orçamento",
        sub: "Cobrança espanta. Um lembrete gentil reabre a conversa.",
        visual: `
        <div class="cmp">
          <span class="sit">${icon(I.clock, 28)} Orçamento enviado · 3 dias sem resposta</span>
          ${weak(5, FRACAS[4])}
          ${strong("Oi, Carla! Passando só para saber se ficou alguma dúvida sobre a avaliação. Se quiser, te mando os horários desta semana.")}
        </div>`,
        bottomRight: `<span class="pill ghost">Salve para usar amanhã</span>`,
      }),
  },
  {
    slug: "carrossel-05-cta",
    format: "carrossel",
    theme: "navy",
    variant: 1,
    body: () =>
      frame({
        kind: "Na próxima mensagem",
        topExtra: pageIndicator(5),
        hook: "Tenha a resposta melhor *antes* de responder.",
        visual: `
        <div class="cta-box">
          <div class="steps3">
            <div class="st"><span class="ic">${icon(I.copy, 32, "currentColor", 2)}</span><div><b>Cole a mensagem da cliente</b><span>Preço, “vou pensar”, retorno…</span></div></div>
            <div class="st"><span class="ic gold">${icon(I.sparkles, 32, "currentColor", 2)}</span><div><b>Receba 3 respostas</b><span>No tom da sua clínica: Suave, Consultiva e Fechamento.</span></div></div>
            <div class="st"><span class="ic">${icon(I.pen, 32, "currentColor", 2)}</span><div><b>Sua equipe revisa e envia</b><span>Você ajusta e cola na conversa.</span></div></div>
          </div>
          <div class="big-cta">
            <span class="btn">5 respostas grátis, sem cartão</span>
            <span class="site">leadbellus.com.br</span>
          </div>
        </div>`,
        bottomRight: `<span class="pill">Link na bio</span>`,
      }),
  },
  {
    slug: "canal-whatsapp",
    format: "quadrado",
    theme: "navy",
    variant: 0,
    body: () =>
      frame({
        kind: "Canal no WhatsApp",
        eyebrow: "Novo",
        hook: "Dicas de atendimento para *clínicas*, no seu WhatsApp.",
        visual: `
        <div class="channel">
          <div class="ch-head">
            <div class="ch-avatar">${LOGO}</div>
            <div><p class="ch-name">LeadBellus</p><p class="ch-meta">Canal · dicas de atendimento</p></div>
            <span class="ch-follow">Seguir</span>
          </div>
          <div class="ch-body">
            <div class="ch-post"><span class="ic">${icon(I.message, 28, "currentColor", 2.2)}</span><span class="tx">Como responder o “quanto custa?”</span></div>
            <div class="ch-post"><span class="ic">${icon(I.clock, 28, "currentColor", 2.2)}</span><span class="tx">Retomar quem sumiu depois do orçamento</span></div>
            <div class="ch-post"><span class="ic">${icon(I.bell, 28, "currentColor", 2.2)}</span><span class="tx">Novidades do LeadBellus</span></div>
          </div>
        </div>`,
        bottomRight: `<span class="pill">Siga o canal · link na bio</span>`,
      }),
  },
  {
    slug: "capa-facebook",
    format: "capa",
    theme: "navy",
    variant: 0,
    deco: `
      <div class="deco-line" style="left:0;right:0;top:40px"></div>
      <div class="deco-line" style="left:0;right:0;bottom:40px"></div>`,
    body: () => `
      <div class="cover">
        <div class="cv-left">
          ${brand()}
          <h1 class="hook">Respostas de WhatsApp para <em>clínica de estética</em>.</h1>
          <p class="sub">Cole a mensagem da cliente e receba 3 respostas no tom da sua clínica. Sua equipe revisa e envia.</p>
          <div class="cv-cta">
            <span class="pill">Teste grátis · 5 respostas, sem cartão</span>
          </div>
        </div>
        <div class="cv-right">
          <div class="mini-phone">
            ${chatHead("Cliente · WhatsApp", "online agora")}
            <div class="chat-body">
              <div class="bubble in">Oi! Quanto custa? Tenho medo de ficar artificial…<span class="time">14:37</span></div>
              <div class="bubble out">Esse cuidado é muito comum! Na avaliação a gente planeja tudo com calma. Quer ver um horário?<span class="time">14:38</span></div>
            </div>
            <div class="typing-row">
              <span class="tag">Suave</span><span class="tag">Consultiva</span><span class="tag gold">Fechamento</span>
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    slug: "story-esperou-demais",
    format: "story",
    theme: "noite",
    variant: 1,
    body: () =>
      frame({
        kind: "Pergunta rápida",
        hook: "Quanto custa uma cliente que *esperou demais*?",
        visual: `
        <div class="stack">
          <div class="phone">
            ${chatHead("Cliente · WhatsApp", "visto por último hoje")}
            <div class="chat-body">
              <div class="bubble in">Oi! Ainda tem horário essa semana?<span class="time">14:02</span></div>
              <span class="wait">${icon(I.clock, 24, "currentColor", 2.6)} Sem resposta por 3 horas</span>
              <div class="bubble in late">Obrigada, já consegui em outro lugar.<span class="time">17:09</span></div>
            </div>
          </div>
          <div class="story-cta">
            <p>Tenha <b>3 respostas no tom da sua clínica</b> em segundos. Sua equipe revisa e envia.</p>
            <span class="pill">5 respostas grátis · leadbellus.com.br</span>
            <span class="hint">Toque no link ${icon(I.arrowDown, 26, "currentColor", 2.8)}</span>
          </div>
          <div class="sticker-room link"></div>
        </div>`,
      }),
  },
  {
    slug: "story-enquete",
    format: "story",
    theme: "navy",
    variant: 2,
    body: () =>
      frame({
        kind: "Enquete",
        hook: "Qual mensagem mais *trava* seu WhatsApp?",
        visual: `
        <div class="stack">
          <div class="chips"><span class="chip">Preço</span><span class="chip">Vou pensar</span><span class="chip">Sumiu</span></div>
          <span class="hint">Vote aqui ${icon(I.arrowDown, 26, "currentColor", 2.8)}</span>
          <div class="sticker-room poll"></div>
          <p class="foot-note">A resposta melhor para cada uma está no <b>carrossel do perfil</b>.</p>
        </div>`,
      }),
  },
];

function pageHtml(piece, assets) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>LeadBellus — ${esc(piece.slug)}</title>
<style>${fontFaces(assets)}</style>
${assets.CSS.map((href) => `<link rel="stylesheet" href="${href}" />`).join("\n")}
</head>
<body class="t-${piece.theme} v-${piece.variant} f-${piece.format} k-${piece.slug}">
  <div class="canvas">
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
    ${piece.deco ?? ""}
    <div class="safe">${piece.body()}</div>
  </div>
</body>
</html>`;
}

/** Roda na página: tudo dentro da área segura, nada cortado. */
function findOverflow() {
  const safe = document.querySelector(".safe");
  const problems = [];
  if (safe.scrollHeight > safe.clientHeight + 1) problems.push(`safe area overflow (${safe.scrollHeight} > ${safe.clientHeight})`);
  if (safe.scrollWidth > safe.clientWidth + 1) problems.push("safe area overflow (horizontal)");
  const visual = document.querySelector(".visual");
  if (visual && visual.firstElementChild) {
    const cs = getComputedStyle(visual);
    const room = visual.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const h = visual.firstElementChild.getBoundingClientRect().height;
    if (h > room + 1) problems.push(`visual overflow (${Math.round(h)} > ${Math.round(room)})`);
  }
  const box = safe.getBoundingClientRect();
  for (const el of safe.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cls = el.className?.baseVal ?? el.className;
    if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) {
      problems.push(`<${el.tagName.toLowerCase()} class="${cls}"> fora da área segura`);
      break;
    }
    if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "visible") {
      problems.push(`<${el.tagName.toLowerCase()} class="${cls}"> texto cortado na horizontal`);
      break;
    }
  }
  return problems;
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? PIECES.filter((p) => only.includes(p.slug)) : PIECES;
  if (!list.length) {
    console.error(`Nenhuma peça para: ${only.join(", ")}`);
    process.exit(1);
  }

  const assets = assetUrls("social.css", "kit.css");
  mkdirSync(outDir, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "leadbellus-kit-"));
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  let failed = false;

  try {
    for (const piece of list) {
      const { width, height } = FORMATS[piece.format];
      const htmlPath = join(work, `${piece.slug}.html`);
      writeFileSync(htmlPath, pageHtml(piece, assets));

      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlPath).href);
      await page.evaluate(() => document.fonts.ready);

      const overflow = await page.evaluate(findOverflow);
      if (overflow.length) {
        failed = true;
        console.error(`  ! ${piece.slug}: ${overflow.join(", ")}`);
      }

      const file = join(outDir, `${piece.slug}.png`);
      await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width, height } });
      await page.close();

      const size = statSync(file).size;
      if (size > MAX_BYTES) {
        failed = true;
        console.error(`  ! ${file} tem ${(size / 1024).toFixed(0)} KB (> 1 MB)`);
      }
      console.log(`✓ public/social/kit/${piece.slug}.png  ${width}x${height}  ${(size / 1024).toFixed(0)} KB`);
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
