// Roteiros dos Reels animados (R1–R3). O R4 (tour do site ao vivo) fica em
// render-reels.mjs porque é gravado a partir de https://www.leadbellus.com.br.
//
// Regras de conteúdo (compliance): nada de promessa de resultado, nenhum preço
// real de procedimento apresentado como preço da clínica (a conta do R1 é
// marcada como EXEMPLO), nenhuma estatística inventada, nenhuma alegação
// médica, e nunca dizer que o LeadBellus envia sozinho ou se conecta ao
// WhatsApp — a equipe revisa e envia.

const LOGO = `<svg class="logo" viewBox="0 0 80 96" fill="none" aria-hidden="true">
  <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#E4A84D" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#E4A84D" stroke-width="5" stroke-linecap="round"/>
  <line x1="40" y1="32" x2="40" y2="86" stroke="#E4A84D" stroke-width="4" stroke-linecap="round"/>
  <circle cx="40" cy="27" r="6" fill="#E4A84D"/>
</svg>`;

const CHECK = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1fa855" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const TICKS = (color = "rgba(11,27,51,0.4)") =>
  `<svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-left:6px"><path d="M1 8.5 5 12.5 13 3.5"/><path d="M9 12.5 10 13.5 18 3.5"/></svg>`;

/** Batida de legenda: 3–5 palavras, entra em `a` e sai em `b`. */
export const cap = (a, b, html, cls = "big") =>
  `<div class="cap" data-in="${a}"${b ? ` data-out="${b}"` : ""} data-a="up"><div class="${cls} safe-check">${html}</div></div>`;

/** Cartão final igual em todos os Reels. */
export const endcard = (from) => `
<section class="scene solid" data-from="${from}" data-to="9999">
  <div class="endcard">
    <div data-in="${from + 0.1}" data-a="pop">${LOGO}</div>
    <p class="wordmark safe-check" data-in="${from + 0.25}">LeadBellus</p>
    <p class="tagline safe-check" data-in="${from + 0.45}">A secretária de WhatsApp<br />da clínica de estética</p>
    <span class="cta safe-check" data-in="${from + 0.75}" data-a="pop">5 respostas grátis, sem cartão</span>
    <p class="url safe-check" data-in="${from + 1.0}">leadbellus.com.br</p>
    <p class="fine safe-check" data-in="${from + 1.2}">Sua equipe revisa e envia cada mensagem.</p>
  </div>
</section>`;

// ── R1 — O preço da demora ─────────────────────────────────────────────────
const r1 = {
  slug: "r1-preco-da-demora",
  duration: 24.5,
  cover: 1.6,
  html: `
<section class="scene" data-from="0" data-to="9.2">
  <div class="capzone">
    ${cap(-1, 2.5, `<p class="eyebrow">O preço da demora</p><h1>Quanto custa a sua <em>demora?</em></h1>`, "x")}
    ${cap(2.5, 4.7, `Sem resposta. <em>A noite toda.</em>`)}
    ${cap(4.7, 6.9, `A clínica respondeu às <span class="redtxt">09:02</span>`, "mid")}
    ${cap(6.9, null, `Ela já agendou <em>em outro lugar.</em>`, "mid")}
  </div>
  <div class="stage">
    <div class="phone fixed" style="height:780px">
      <div class="chat-head">
        <div class="avatar">C</div>
        <div><p class="name">Cliente nova</p><p class="status">online</p></div>
        <span class="clock" data-clock="1274,1982,2.6,4.4">21:14</span>
      </div>
      <div class="chat-body">
        <div class="divider">Ontem</div>
        <div class="bubble in safe-check">Oi! Quanto custa o botox?<span class="time">21:14</span></div>
        <div class="sys" data-in="2.9" data-out="4.5">⏳ sem resposta…</div>
        <div class="divider" data-in="4.4">Hoje</div>
        <div class="bubble out safe-check" data-in="4.8" data-a="right">Bom dia! Desculpa a demora. O valor depende da avaliação 😊<span class="time">09:02 ${TICKS("#4fb6ec")}</span></div>
        <div class="typing" data-in="5.7" data-out="6.6">digitando…</div>
        <div class="bubble in safe-check" data-in="6.7" data-a="left">Obrigada, mas já agendei em outro lugar.<span class="time">09:05</span></div>
      </div>
      <div class="stamp-wrap"><span class="stamp" data-in="7.6" data-a="pop">Cliente perdida</span></div>
    </div>
  </div>
</section>

<section class="scene" data-from="9.2" data-to="15.6">
  <div class="capzone">
    ${cap(9.3, 12.3, `Agora <em>faça a conta.</em>`)}
    ${cap(12.3, null, `Isso é <em>toda semana.</em>`)}
  </div>
  <div class="stage center">
    <div class="calc" data-in="9.5">
      <span class="ex safe-check">Exemplo</span>
      <p class="exsub safe-check">faça a conta com o seu ticket</p>
      <div class="line" data-in="10.1"><span class="k safe-check">Ticket médio (exemplo)</span><span class="v safe-check">R$ 1.200</span></div>
      <div class="line" data-in="10.9"><span class="k safe-check">× clientes perdidas por semana</span><span class="v safe-check">3</span></div>
      <div class="total" data-in="11.8">
        <p class="k safe-check">= no exemplo</p>
        <p class="v safe-check"><span data-count="0,3600,11.9,13.2">R$ 0</span><small>/semana</small></p>
      </div>
      <p class="foot safe-check" data-in="12.6">Valores hipotéticos. Use os números da sua clínica.</p>
    </div>
  </div>
</section>

<section class="scene" data-from="15.6" data-to="21.4">
  <div class="capzone">
    ${cap(15.7, 17.4, `<em>Cole</em> a mensagem.`)}
    ${cap(17.4, 19.5, `3 respostas <em>em segundos.</em>`)}
    ${cap(19.5, null, `Sua equipe <em>revisa e envia.</em>`, "mid")}
  </div>
  <div class="stage">
    <div class="app" data-in="15.7">
      <div class="app-top">${LOGO.replace('class="logo"', 'width="30" height="36"')}<span class="t">LeadBellus</span><span class="s">no tom da clínica</span></div>
      <div class="field"><p class="lbl">Mensagem da cliente</p><p class="val safe-check" data-type="16.0,16.9">Oi! Quanto custa o botox?</p></div>
      <div class="gen-btn safe-check" data-on="17.0">Gerar respostas</div>
      <div class="replies">
        <div class="reply" data-in="17.5" data-a="pop"><p class="rl">Suave</p><p class="rt safe-check">Oi! O valor depende da avaliação 😊 Posso te explicar como funciona?</p></div>
        <div class="reply" data-in="17.9" data-a="pop" data-on="19.6"><p class="rl">Consultiva</p><p class="rt safe-check">O valor varia conforme o que for indicado na avaliação. O que você quer suavizar?</p></div>
        <div class="reply" data-in="18.3" data-a="pop"><p class="rl">Fechamento</p><p class="rt safe-check">Temos horários de avaliação esta semana. Prefere manhã ou tarde?</p></div>
      </div>
      <div class="review" data-in="19.8"><span class="b">Editar</span><span class="b primary">Copiar</span><span class="ok safe-check">✓ Revisado pela equipe</span></div>
    </div>
  </div>
</section>
${endcard(21.4)}`,
};

// ── R2 — Resposta fraca × resposta da secretária ───────────────────────────
const r2 = {
  slug: "r2-resposta-fraca",
  duration: 19.5,
  cover: 1.4,
  html: `
<section class="scene" data-from="0" data-to="7.4">
  <div class="capzone">
    ${cap(-1, 2.5, `<p class="eyebrow">Ela disse “tá caro”</p><h1>E a clínica <em>respondeu isso:</em></h1>`, "x")}
    ${cap(2.5, 4.9, `Resposta <span class="redtxt">fraca…</span>`)}
    ${cap(4.9, null, `…conversa <span class="redtxt">encerrada.</span>`)}
  </div>
  <div class="stage">
    <span class="label-pill bad safe-check">✕ Resposta fraca</span>
    <div class="phone fixed" style="height:800px">
      <div class="chat-head"><div class="avatar">C</div><div><p class="name">Cliente</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="bubble in safe-check">Tá caro…<span class="time">14:20</span></div>
        <div class="bubble out weak safe-check" data-in="0.9" data-a="right">É o valor, amiga.<span class="time">14:21 ${TICKS("#4fb6ec")}</span></div>
        <div class="bubble in safe-check" data-in="3.0" data-a="left">Ok, vou pensar.<span class="time">14:23</span></div>
        <div class="sys red safe-check" data-in="5.0">Visualizou e não respondeu mais</div>
      </div>
    </div>
  </div>
</section>

<section class="scene" data-from="7.4" data-to="15">
  <div class="capzone">
    ${cap(7.4, 9.9, `Agora a <em>resposta da secretária:</em>`, "mid")}
    ${cap(9.9, 12.4, `Ela <em>continua conversando.</em>`)}
    ${cap(12.4, null, `Mesma pergunta. <em>Outra conversa.</em>`, "mid")}
  </div>
  <div class="stage">
    <span class="label-pill good safe-check">✓ Consultiva · LeadBellus</span>
    <div class="phone fixed" style="height:800px">
      <div class="chat-head"><div class="avatar">C</div><div><p class="name">Cliente</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="bubble in safe-check">Tá caro…<span class="time">14:20</span></div>
        <div class="bubble out safe-check" data-in="8.4" data-a="right">Entendo, valor pesa mesmo! Posso te explicar o que está incluso e as formas de pagamento?<span class="time">14:21 ${TICKS("#4fb6ec")}</span></div>
        <div class="typing" data-in="9.7" data-out="10.5">digitando…</div>
        <div class="bubble in safe-check" data-in="10.6" data-a="left">Pode sim! E como funciona a avaliação?<span class="time">14:22</span></div>
        <div class="sys green safe-check" data-in="11.6">A conversa continua</div>
      </div>
    </div>
  </div>
</section>
${endcard(15)}`,
};

// ── R3 — Ela sumiu depois do orçamento ─────────────────────────────────────
const r3 = {
  slug: "r3-sumiu-orcamento",
  duration: 22,
  cover: 1.4,
  html: `
<section class="scene" data-from="0" data-to="5.2">
  <div class="capzone">
    ${cap(-1, 2.7, `<p class="eyebrow">Acontece todo dia</p><h1>Ela sumiu depois do <em>orçamento?</em></h1>`, "x")}
    ${cap(2.7, null, `Silêncio. <em>E agora?</em>`)}
  </div>
  <div class="stage">
    <div class="phone fixed" style="height:860px">
      <div class="chat-head"><div class="avatar">A</div><div><p class="name">Ana</p><p class="status" style="color:#7a8797">visto por último ontem</p></div></div>
      <div class="chat-body">
        <div class="bubble in safe-check">Oi! Me passa o orçamento da avaliação?<span class="time">10:12</span></div>
        <div class="bubble out safe-check">Claro! Segue o orçamento com os detalhes da avaliação 😊<span class="time">10:15 ${TICKS("#4fb6ec")}</span></div>
        <div class="sys safe-check" data-in="0.8">Visualizado · sem resposta</div>
        <div class="divider" data-in="2.2">1 dia depois</div>
        <div class="divider" data-in="3.0">3 dias depois</div>
        <div class="sys red safe-check" data-in="3.8">Conversa parada</div>
      </div>
    </div>
  </div>
</section>

<section class="scene" data-from="5.2" data-to="15.2">
  <div class="capzone">
    ${cap(5.3, 7.6, `<em>D+1:</em> retome com leveza.`, "mid")}
    ${cap(7.6, 10.0, `<em>D+3:</em> tire uma dúvida.`, "mid")}
    ${cap(10.0, 12.6, `<em>D+7:</em> deixe a porta aberta.`, "mid")}
    ${cap(12.6, null, `Sua equipe <em>revisa e envia.</em>`, "mid")}
  </div>
  <div class="stage">
    <div class="fu">
      <p class="fu-head safe-check" data-in="5.3">Follow-up gerado pelo LeadBellus</p>
      <div class="fu-card" data-in="5.6" data-a="left"><div class="day">D+1<small>dia 1</small></div><div><span class="tag">Leve</span><p class="msg safe-check">Oi, Ana! Ficou alguma dúvida sobre o orçamento? Estou por aqui 😊</p></div></div>
      <div class="fu-card" data-in="7.8" data-a="left"><div class="day">D+3<small>dia 3</small></div><div><span class="tag">Tira-dúvidas</span><p class="msg safe-check">Ana, quer que eu te explique como funciona a avaliação e as formas de pagamento?</p></div></div>
      <div class="fu-card" data-in="10.2" data-a="left"><div class="day">D+7<small>dia 7</small></div><div><span class="tag">Porta aberta</span><p class="msg safe-check">Sem pressa! Quando quiser retomar, é só me chamar. Posso reservar um horário de avaliação?</p></div></div>
      <div style="display:flex;justify-content:center;margin-top:8px" data-in="12.8" data-a="pop"><span class="badge safe-check">${CHECK} Você revisa e envia</span></div>
    </div>
  </div>
</section>

<section class="scene" data-from="15.2" data-to="18.4">
  <div class="stage center" style="top:420px;height:1000px">
    <p class="question safe-check" data-in="15.3">Quantas conversas <em>paradas</em> você tem hoje?</p>
  </div>
</section>
${endcard(18.4)}`,
};

export const REELS = [r1, r2, r3];

// ── R4 — Tour do produto (site ao vivo) ────────────────────────────────────
// O site é capturado num viewport de celular (420x595 CSS, deviceScaleFactor
// 2,2 → 924x1309 px) e encaixado na "tela" abaixo da faixa de legendas.
// Alvos de rolagem: "top", seletor CSS ou "text:..." (menor elemento que
// contém o texto), opcionalmente dentro de `scope`.
export const TOUR = {
  slug: "r4-tour",
  duration: 23,
  cover: 1.0,
  viewport: { width: 420, height: 595, scale: 2.2 },
  scroll: [
    { t: 0, to: "top" },
    { t: 3.0, to: "top" },
    { t: 4.6, to: "text:conversa em andamento", dy: -60 },
    { t: 8.0, to: "text:conversa em andamento", dy: -60 },
    { t: 9.6, to: "text:Simulador rápido", dy: -28 },
    { t: 11.2, to: "text:Simulador rápido", dy: -28 },
    { t: 12.6, to: "#demo_msg", dy: -64 },
    { t: 14.4, to: "#demo_msg", dy: -64 },
    { t: 15.9, to: "text:Preço de lançamento", scope: "#precos", dy: -40 },
    { t: 19.6, to: "text:Preço de lançamento", scope: "#precos", dy: -40 },
  ],
  html: `
<section class="scene" data-from="0" data-to="19.6">
  <div class="capzone">
    ${cap(-1, 3.0, `<p class="eyebrow">Tour de 20 segundos</p><h1>Responda antes dela <em>desistir.</em></h1>`, "x")}
    ${cap(3.0, 5.6, `3 respostas no <em>tom da clínica</em>`, "mid")}
    ${cap(5.6, 8.2, `Sua equipe <em>revisa e envia.</em>`, "mid")}
    ${cap(8.2, 11.2, `Teste com a <em>sua situação</em>`, "mid")}
    ${cap(11.2, 14.4, `Cole a mensagem <em>e gere.</em>`, "mid")}
    ${cap(14.4, 17.0, `Plano Start: <em>R$ 97/mês</em>`, "mid")}
    ${cap(17.0, null, `<em>5 respostas grátis,</em> sem cartão`, "mid")}
  </div>
  <div class="device"><img id="site" alt="" /></div>
</section>
${endcard(19.6)}`,
};
