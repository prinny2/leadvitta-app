#!/usr/bin/env node
// Carrosséis educativos do Instagram (1080x1350, feed 4:5), um por situação
// do gerador:
//
//   A — "Perguntou o preço": como responder sem cravar valor (6 cards)
//   B — "Tem medo do procedimento": acolher sem prometer resultado (6 cards)
//   C — "Sumiu / não respondeu": follow-up leve D+1, D+3, D+7 (7 cards)
//
//   node scripts/social/render-carrosseis.mjs        # todos
//   node scripts/social/render-carrosseis.mjs a c    # só alguns (por id)
//
// Saída: public/social/carrosseis/<id>-NN.png (ex.: a-01.png = capa do A).
//
// Mesma linguagem do kit (render-kit.mjs): social.css + kit.css, fontes
// Inter + Fraunces de app/fonts, paleta azul-marinho / dourado / creme. Os
// estilos novos ficam neste arquivo (CSS abaixo), prefixados com `cr-`.
//
// Área segura: nada a menos de 110 px do topo/rodapé nem 76 px das laterais
// (a grade do perfil mostra a capa em 3:4). O script falha (exit 1) se algum
// elemento sair dessa área, se texto vazar ou se um PNG passar de 1 MB.
//
// O texto dos cards é o do dono, sem acréscimos: só entram rótulos de interface
// (situação, numeração, "Arraste", nomes dos tons do produto) e a marca.
//
// Requer Playwright + Chromium (não é dependência do app). Se não estiver
// resolvível, aponte PLAYWRIGHT_MODULE para o diretório do pacote
// (ex.: PLAYWRIGHT_MODULE=~/.npm/_npx/<hash>/node_modules/playwright).

import { mkdtempSync, writeFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { root, MAX_BYTES, loadPlaywright, assetUrls, fontFaces, esc, rich, icon, I, LOGO, brand } from "./lib.mjs";

const outDir = join(root, "public/social/carrosseis");
const W = 1080;
const H = 1350;
/** Margem mínima até a borda do canvas (px). */
const MARGIN = { top: 110, bottom: 110, side: 76 };

// ── Conteúdo (texto do dono) ───────────────────────────────────────────────
// *trecho* = ênfase dourada em itálico. [nome] vira um marcador destacado.
const CAROUSELS = [
  {
    id: "a",
    theme: "navy",
    situacao: "Perguntou o preço",
    steps: ["Acolha", "Pergunte", "Convide"],
    slides: [
      { type: "cover", bubble: "Quanto custa?", hook: "Como responder sem jogar um *número seco* no WhatsApp" },
      { type: "statement", hook: "Mandar só o valor costuma *encerrar a conversa* antes de ela começar." },
      {
        type: "step",
        step: 0,
        lead: "Primeiro, *acolha*:",
        reply: "Que bom que você nos procurou! Para te passar um valor justo, preciso entender melhor o que você procura.",
      },
      { type: "step", step: 1, lead: "Depois, *pergunte*:", list: ["qual região", "se já fez antes", "o que espera da consulta"] },
      {
        type: "step",
        step: 2,
        lead: "Por fim, *convide*:",
        reply: "Na avaliação, a profissional explica as opções e os valores com calma. Posso ver um horário para você?",
      },
      {
        type: "final",
        hook: "Na LeadBellus, a situação *“Perguntou o preço”* gera 3 rascunhos no tom da sua clínica.",
        sub: "Sua equipe revisa e envia.",
      },
    ],
  },
  {
    id: "b",
    theme: "creme",
    situacao: "Tem medo do procedimento",
    steps: ["Valide", "Informe sem prometer", "Dê espaço"],
    slides: [
      { type: "cover", bubble: "Tenho medo…", hook: "Como responder com *acolhimento* e sem prometer nada" },
      { type: "statement", hook: "O medo é *legítimo*.", after: "A resposta não pode ser", bad: "relaxa, não é nada" },
      { type: "step", step: 0, lead: "*Valide*:", reply: "É super normal ter esse receio, e é ótimo que você fale sobre isso." },
      {
        type: "step",
        step: 1,
        lead: "Informe *sem prometer*:",
        reply: "Na avaliação, a profissional explica cada etapa e tira todas as suas dúvidas antes de qualquer decisão.",
      },
      { type: "step", step: 2, lead: "Dê *espaço*:", reply: "Sem pressa. Quer que eu te envie os horários de avaliação?" },
      {
        type: "final",
        hook: "A situação *“Tem medo do procedimento”* na LeadBellus gera 3 rascunhos acolhedores.",
        sub: "Sua equipe revisa e envia.",
      },
    ],
  },
  {
    id: "c",
    theme: "navy",
    situacao: "Sumiu / não respondeu",
    steps: ["D+1", "D+3", "D+7"],
    numbered: false,
    slides: [
      { type: "cover", hook: "Ela sumiu depois do orçamento. *E agora?*", sub: "Uma sequência leve em 3 toques", timeline: "preview" },
      { type: "statement", hook: "Sumir nem sempre é *desinteresse*.", after: "Às vezes é rotina corrida." },
      { type: "step", step: 0, lead: "*D+1*", reply: "Oi, [nome]! Ficou alguma dúvida sobre o que conversamos? Estou por aqui." },
      {
        type: "step",
        step: 1,
        lead: "*D+3*",
        reply: "Passando para avisar que temos alguns horários de avaliação nesta semana. Quer que eu reserve um para você?",
      },
      {
        type: "step",
        step: 2,
        lead: "*D+7*",
        reply: "Não quero te incomodar! Se não for o momento, tudo bem. Quando quiser, é só chamar. 🤍",
      },
      {
        type: "statement",
        hook: "Leve, curto e *sem cobrança*.",
        after: "Três toques e você respeita o tempo dela.",
        timeline: "done",
      },
      {
        type: "final",
        hook: "A situação *“Sumiu / não respondeu”* na LeadBellus gera 3 rascunhos no tom da sua clínica.",
        sub: "Sua equipe revisa e envia.",
      },
    ],
  },
];

// ── Peças ──────────────────────────────────────────────────────────────────
const TICKS = `<svg class="ticks" width="30" height="18" viewBox="0 0 30 18" fill="none" stroke="#34B7F1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l5 5L18 3"/><path d="M13 14l1 1L26 3"/></svg>`;

/** Texto de bolha: escapa e destaca o marcador [nome]. */
const bubbleText = (s) => esc(s).replace(/\[nome\]/g, '<span class="cr-token">[nome]</span>');

const pageIndicator = (n, total) => `
  <span class="page">
    <span class="dots">${Array.from({ length: total }, (_, i) => `<i class="${i + 1 === n ? "on" : ""}"></i>`).join("")}</span>
    ${n}/${total}
  </span>`;

// Em C os rótulos já são a sequência (D+1, D+3, D+7): o círculo leva um ponto, não número.
const stepper = (labels, current, numbered = true) => `
  <div class="cr-stepper">
    ${labels
      .map((label, i) => {
        const state = i < current ? "done" : i === current ? "on" : "";
        const mark = i < current ? icon(I.check, 22, "currentColor", 3) : numbered ? String(i + 1) : '<i class="pt"></i>';
        return `<span class="cr-st ${state}"><span class="n">${mark}</span>${esc(label)}</span>`;
      })
      .join('<span class="cr-st-line"></span>')}
  </div>`;

const timeline = (labels, mode) => `
  <div class="cr-tl ${mode}">
    ${labels
      .map(
        (l) =>
          `<span class="cr-tl-node"><span class="c">${mode === "done" ? icon(I.check, 34, "currentColor", 3) : icon(I.message, 34, "currentColor", 2.2)}</span><b>${esc(l)}</b></span>`,
      )
      .join('<span class="cr-tl-line"></span>')}
  </div>`;

const chat = (text) => `
  <div class="cr-chat">
    <div class="bubble out">${bubbleText(text)}<span class="meta">${TICKS}</span></div>
  </div>`;

const swipe = `<span class="swipe">Arraste ${icon(I.arrowRight, 28, "currentColor", 2.8)}</span>`;
const next = `<span class="cr-next">${icon(I.arrowRight, 30, "currentColor", 2.6)}</span>`;

function slideBody(c, s, n, total) {
  const top = `
    <div class="top">
      <span class="kind">${esc(c.situacao)}</span>
      ${pageIndicator(n, total)}
    </div>`;
  const bottom = (right) => `<div class="bottom">${brand()}${right}</div>`;

  if (s.type === "cover") {
    return `${top}
      <div class="cr-main cr-cover">
        ${s.bubble ? `<div class="cr-hero-bubble">${esc(s.bubble)}</div>` : ""}
        <h1 class="hook">${rich(s.hook)}</h1>
        ${s.sub ? `<p class="cr-cover-sub">${rich(s.sub)}</p>` : ""}
        ${s.timeline ? timeline(c.steps, s.timeline) : ""}
      </div>
      ${bottom(swipe)}`;
  }

  if (s.type === "statement") {
    return `${top}
      <div class="cr-main cr-statement">
        <span class="cr-rule"></span>
        <h1 class="hook">${rich(s.hook)}</h1>
        ${s.after ? `<p class="cr-after">${rich(s.after)}</p>` : ""}
        ${s.bad ? `<div class="cr-bad"><span class="x">${icon(I.x, 30, "currentColor", 3)}</span><span class="t">${esc(s.bad)}</span></div>` : ""}
        ${s.timeline ? timeline(c.steps, s.timeline) : ""}
      </div>
      ${bottom(next)}`;
  }

  if (s.type === "step") {
    const body = s.list
      ? `<ul class="cr-qs">${s.list.map((q) => `<li><span class="qi">?</span><span class="qt">${esc(q)}</span></li>`).join("")}</ul>`
      : chat(s.reply);
    return `${top}
      ${stepper(c.steps, s.step, c.numbered !== false)}
      <div class="cr-main cr-step">
        <h1 class="hook cr-lead">${rich(s.lead)}</h1>
        ${body}
      </div>
      ${bottom(next)}`;
  }

  // final
  const tones = ["Suave", "Consultiva", "Fechamento"];
  return `${top}
    <div class="cr-main cr-final">
      <h1 class="hook">${rich(s.hook)}</h1>
      <p class="cr-final-sub">${icon(I.pen, 34, "currentColor", 2.4)} ${esc(s.sub)}</p>
      <div class="cr-app">
        <span class="cr-sit">${icon(I.check, 24, "currentColor", 3)} ${esc(c.situacao)}</span>
        <div class="cr-drafts">
          ${tones
            .map(
              (t, i) => `
            <div class="cr-draft">
              <span class="tag ${i === 2 ? "gold" : ""}">${t}</span>
              <span class="sk-wrap"><i class="sk"></i><i class="sk s${i}"></i></span>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="cr-cta">
      <span class="cr-cta-btn">5 respostas grátis, sem cartão · link na bio</span>
      <span class="cr-cta-site"><span class="brand">${LOGO}</span>www.leadbellus.com.br</span>
    </div>`;
}

// ── Estilos novos (sobre social.css + kit.css) ─────────────────────────────
const CSS = `
.f-carrossel .safe { inset: 112px 80px 112px; }
.top { margin-bottom: 0; flex-wrap: nowrap; }
.page { font-size: 19px; opacity: 0.85; }
.dots i { width: 8px; height: 8px; }
.dots i.on { width: 24px; }

.cr-main { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; padding: 30px 0; }
.bubble { font-family: "Inter", system-ui, "Apple Color Emoji", "Noto Color Emoji", sans-serif; text-wrap: pretty; }

/* Capa */
.cr-cover .hook { font-size: 94px; line-height: 1.04; }
.k-c .cr-cover .hook { font-size: 104px; }
.cr-hero-bubble {
  align-self: flex-start; margin-bottom: 48px; font-size: 64px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.15;
  color: var(--ink); background: #fff; padding: 26px 42px 28px; border-radius: 46px 46px 46px 12px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.38);
}
.t-creme .cr-hero-bubble { box-shadow: 0 26px 60px rgba(11, 27, 51, 0.16); border: 1.5px solid rgba(11, 27, 51, 0.06); }
.cr-cover-sub { margin-top: 28px; font-size: 44px; line-height: 1.25; font-weight: 600; color: var(--muted); }

/* Linha do tempo D+1 · D+3 · D+7 */
.cr-tl { display: flex; align-items: center; gap: 0; margin-top: 64px; }
.cr-tl-node { display: flex; flex-direction: column; align-items: center; gap: 14px; flex-shrink: 0; }
.cr-tl-node .c {
  width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: 3px solid var(--gold); background: var(--surface); color: var(--gold);
}
.cr-tl.done .cr-tl-node .c { color: var(--navy); }
.cr-tl.done .cr-tl-node .c { background: linear-gradient(135deg, var(--gold-hot), var(--gold) 60%, var(--gold-deep)); border-color: transparent; }
.cr-tl-node b { font-family: "Fraunces", Georgia, serif; font-size: 40px; font-weight: 600; color: var(--fg); }
.cr-tl-line { flex: 1; height: 3px; margin: 0 18px 58px; background: repeating-linear-gradient(90deg, var(--line) 0 14px, transparent 14px 24px); }
.cr-tl.done .cr-tl-line { background: var(--gold); opacity: 0.7; }

/* Afirmação */
.cr-statement .hook { font-size: 92px; line-height: 1.06; }
.cr-rule { display: block; width: 96px; height: 6px; border-radius: 9999px; background: var(--gold); margin-bottom: 40px; }
.cr-after { margin-top: 34px; font-family: "Fraunces", Georgia, serif; font-size: 58px; line-height: 1.15; font-weight: 500; color: var(--muted); text-wrap: balance; }
.cr-bad {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 18px; margin-top: 30px;
  font-size: 46px; font-weight: 600; padding: 24px 34px; border-radius: 34px 34px 34px 10px;
  background: #fff; color: var(--ink-soft); box-shadow: 0 24px 60px rgba(11, 27, 51, 0.14);
  border: 2px solid rgba(184, 73, 60, 0.35);
}
.cr-bad .x {
  width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(212, 103, 90, 0.14); color: #b8493c;
}
.cr-bad .t { text-decoration: line-through; text-decoration-color: rgba(184, 73, 60, 0.8); text-decoration-thickness: 3px; }

/* Passos */
.cr-stepper { display: flex; align-items: center; gap: 14px; margin-top: 34px; }
.cr-st { display: inline-flex; align-items: center; gap: 12px; font-size: 23px; font-weight: 800; color: var(--muted); white-space: nowrap; }
.cr-st .n {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; border: 2px solid var(--line); color: var(--accent); background: var(--surface);
}
.cr-st.on { color: var(--fg); }
.cr-st.on .n { background: linear-gradient(135deg, var(--gold-hot), var(--gold) 60%, var(--gold-deep)); border-color: transparent; color: var(--navy); }
.cr-st .n .pt { display: block; width: 12px; height: 12px; border-radius: 50%; background: currentColor; }
.cr-st-line { flex: 1; min-width: 18px; height: 2px; background: var(--divider); }
.cr-lead { font-size: 96px; line-height: 1.04; margin-bottom: 44px; }
.k-c .cr-lead { font-size: 150px; line-height: 1; letter-spacing: -0.02em; }

.cr-chat {
  border-radius: 38px; padding: 34px 32px; background: #efe9e1; display: flex; flex-direction: column;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.5);
}
.t-creme .cr-chat { background: #fff; box-shadow: 0 30px 70px rgba(11, 27, 51, 0.14), 0 0 0 1.5px rgba(11, 27, 51, 0.06); }
.cr-chat .bubble { font-size: 41px; line-height: 1.38; padding: 26px 30px 16px; max-width: 94%; border-radius: 30px 30px 8px 30px; }
.cr-chat .meta { display: flex; justify-content: flex-end; margin-top: 4px; }
.cr-token { background: rgba(228, 168, 77, 0.3); color: #7a4d0c; font-weight: 700; border-radius: 10px; padding: 0 8px; }

.cr-qs { list-style: none; display: flex; flex-direction: column; gap: 20px; }
.cr-qs li {
  display: flex; align-items: center; gap: 26px; padding: 28px 30px; border-radius: 28px;
  background: var(--surface); border: 1.5px solid var(--line);
}
.cr-qs .qi {
  width: 66px; height: 66px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  font-family: "Fraunces", Georgia, serif; font-size: 40px; font-weight: 600; color: var(--navy);
  background: linear-gradient(135deg, var(--gold-hot), var(--gold) 60%, var(--gold-deep));
}
.cr-qs .qt { font-size: 44px; font-weight: 700; line-height: 1.2; }

/* Último card */
.cr-final { padding: 34px 0 40px; }
.cr-final .hook { font-size: 64px; line-height: 1.08; }
.cr-final-sub { display: flex; align-items: center; gap: 14px; margin-top: 22px; font-size: 36px; font-weight: 700; color: var(--fg); }
.cr-final-sub svg { color: var(--accent); flex-shrink: 0; }
.cr-app {
  margin-top: 36px; border-radius: 32px; padding: 26px 28px; background: #fff; color: var(--ink);
  box-shadow: 0 34px 80px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; gap: 18px;
}
.t-creme .cr-app { box-shadow: 0 26px 60px rgba(11, 27, 51, 0.14), 0 0 0 1.5px rgba(11, 27, 51, 0.06); }
.cr-sit {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 10px; font-size: 23px; font-weight: 800;
  padding: 10px 18px; border-radius: 9999px; background: #fbecd2; color: #8a5a10; border: 1.5px solid var(--gold);
}
.cr-drafts { display: flex; flex-direction: column; gap: 12px; }
.cr-draft { display: flex; align-items: center; gap: 18px; padding: 16px 18px; border-radius: 18px; background: #f4f6f9; }
.cr-draft .tag { min-width: 150px; justify-content: center; font-size: 19px; }
.sk-wrap { flex: 1; display: flex; flex-direction: column; gap: 9px; }
.sk { display: block; height: 11px; border-radius: 6px; background: rgba(11, 27, 51, 0.13); }
.sk.s0 { width: 62%; } .sk.s1 { width: 78%; } .sk.s2 { width: 54%; }

.cr-cta {
  display: flex; flex-direction: column; align-items: center; gap: 18px; padding-top: 30px;
  border-top: 1px solid var(--divider);
}
.cr-cta-btn {
  font-size: 31px; font-weight: 800; white-space: nowrap; padding: 22px 34px; border-radius: 9999px; color: var(--navy);
  background: linear-gradient(135deg, var(--gold-hot), var(--gold) 60%, var(--gold-deep));
  box-shadow: 0 16px 36px rgba(228, 168, 77, 0.35);
}
.cr-cta-site { display: inline-flex; align-items: center; gap: 14px; font-family: "Fraunces", Georgia, serif; font-size: 38px; font-weight: 600; color: var(--fg); }
.cr-cta-site .brand .logo { width: 30px; height: 36px; }

.cr-next {
  width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--line); color: var(--accent);
}
`;

function pageHtml(c, s, n, total, assets) {
  const variant = (n - 1) % 3;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>LeadBellus — carrossel ${esc(c.id)}-${n}</title>
<style>${fontFaces(assets)}</style>
${assets.CSS.map((href) => `<link rel="stylesheet" href="${href}" />`).join("\n")}
<style>${CSS}</style>
</head>
<body class="t-${c.theme} v-${variant} f-carrossel k-${c.id} s-${s.type}">
  <div class="canvas">
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
    <div class="safe">${slideBody(c, s, n, total)}</div>
  </div>
</body>
</html>`;
}

/** Roda na página: tudo dentro da margem de segurança, nada cortado. */
function findOverflow(m) {
  const problems = [];
  const canvas = document.querySelector(".canvas").getBoundingClientRect();
  const safe = document.querySelector(".safe");
  if (safe.scrollHeight > safe.clientHeight + 1) problems.push(`safe area overflow (${safe.scrollHeight} > ${safe.clientHeight})`);
  if (safe.scrollWidth > safe.clientWidth + 1) problems.push("safe area overflow (horizontal)");
  const main = document.querySelector(".cr-main");
  if (main) {
    const kids = [...main.children].map((el) => el.getBoundingClientRect());
    const box = main.getBoundingClientRect();
    if (kids.some((r) => r.top < box.top - 1 || r.bottom > box.bottom + 1)) problems.push("conteúdo maior que o miolo do card");
  }
  for (const el of safe.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cls = el.className?.baseVal ?? el.className;
    if (r.top < canvas.top + m.top - 0.5 || r.bottom > canvas.bottom - m.bottom + 0.5 || r.left < canvas.left + m.side - 0.5 || r.right > canvas.right - m.side + 0.5) {
      problems.push(`<${el.tagName.toLowerCase()} class="${cls}"> fora da margem de segurança`);
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
  const only = process.argv.slice(2).map((s) => s.toLowerCase());
  const list = only.length ? CAROUSELS.filter((c) => only.includes(c.id)) : CAROUSELS;
  if (!list.length) {
    console.error(`Nenhum carrossel para: ${only.join(", ")}`);
    process.exit(1);
  }

  const assets = assetUrls("social.css", "kit.css");
  mkdirSync(outDir, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "leadbellus-carrosseis-"));
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  let failed = false;

  try {
    for (const c of list) {
      const total = c.slides.length;
      for (const [i, s] of c.slides.entries()) {
        const n = i + 1;
        const name = `${c.id}-${String(n).padStart(2, "0")}`;
        const htmlPath = join(work, `${name}.html`);
        writeFileSync(htmlPath, pageHtml(c, s, n, total, assets));

        const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
        await page.goto(pathToFileURL(htmlPath).href);
        await page.evaluate(() => document.fonts.ready);

        const overflow = await page.evaluate(findOverflow, MARGIN);
        if (overflow.length) {
          failed = true;
          console.error(`  ! ${name}: ${overflow.join(", ")}`);
        }

        const file = join(outDir, `${name}.png`);
        await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width: W, height: H } });
        await page.close();

        const size = statSync(file).size;
        if (size > MAX_BYTES) {
          failed = true;
          console.error(`  ! ${file} tem ${(size / 1024).toFixed(0)} KB (> 1 MB)`);
        }
        console.log(`✓ public/social/carrosseis/${name}.png  ${W}x${H}  ${(size / 1024).toFixed(0)} KB`);
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
