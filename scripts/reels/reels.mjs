// Roteiros dos Reels animados (R1–R3 e R5–R7). O R4 (tour do site ao vivo) é
// gravado por render-reels.mjs a partir de https://www.leadbellus.com.br; o
// roteiro dele (rolagem + legendas) fica em TOUR, no fim deste arquivo.
//
// Regras de conteúdo (compliance): nada de promessa de resultado, nenhum preço
// real de procedimento apresentado como preço da clínica (a conta do R1 é
// marcada como EXEMPLO), nenhuma estatística inventada, nenhuma alegação
// médica, e nunca dizer que o LeadBellus envia sozinho, agenda ou se conecta
// ao WhatsApp — ele escreve, a equipe revisa e envia. Nunca chamar o produto
// de "secretária": é o LeadBellus / assistente de escrita.

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

/**
 * Cartão final igual em todos os Reels. `bio: true` (R5–R7, feitos para o
 * perfil) troca a URL solta por "Link na bio · leadbellus.com.br".
 */
export const endcard = (from, { bio = false } = {}) => `
<section class="scene solid" data-from="${from}" data-to="9999">
  <div class="endcard">
    <div data-in="${from + 0.1}" data-a="pop">${LOGO}</div>
    <p class="wordmark safe-check" data-in="${from + 0.25}">LeadBellus</p>
    <p class="tagline safe-check" data-in="${from + 0.45}">Assistente de escrita para o WhatsApp<br />da clínica de estética</p>
    <span class="cta safe-check" data-in="${from + 0.75}" data-a="pop">5 respostas grátis, sem cartão</span>
    <p class="url safe-check" data-in="${from + 1.0}">${bio ? "Link na bio · leadbellus.com.br" : "leadbellus.com.br"}</p>
    <p class="fine safe-check" data-in="${from + 1.2}">Sua equipe revisa e envia cada mensagem.</p>
  </div>
</section>`;

const LOGO_SM = LOGO.replace('class="logo"', 'width="30" height="36"');
const CHEV = `<svg class="chev" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const LABELS = ["Suave", "Consultiva", "Fechamento"];

/**
 * Gerador do app (R5–R7): cola a mensagem → escolhe a situação (nomes reais de
 * data/situacoes.ts) → "Gerar 3 respostas" → Suave / Consultiva / Fechamento.
 * `pick` é a resposta que a equipe escolhe (ganha destaque em `pickAt`).
 */
const gerador = ({ at, msg, typed, situacao, sitAt, genAt, replies, pick, pickAt }) => `
<div class="app" data-in="${at}">
  <div class="app-top">${LOGO_SM}<span class="t">LeadBellus</span><span class="s">no tom da clínica</span></div>
  <div class="field"><p class="lbl">Mensagem da cliente</p><p class="val safe-check" data-type="${typed}">${msg}</p></div>
  <div class="sit-row">
    <span class="lbl safe-check">Situação</span>
    <span class="sel-wrap">
      <span class="sel ph safe-check" data-out="${sitAt}">Escolha a situação ${CHEV}</span>
      <span class="sel safe-check" data-in="${sitAt}" data-a="pop" data-on="${(sitAt + 0.25).toFixed(2)}">${situacao} ${CHEV}</span>
    </span>
  </div>
  <div class="gen-btn safe-check" data-on="${genAt}">Gerar 3 respostas</div>
  <div class="replies">
    ${LABELS.map(
      (label, i) =>
        `<div class="reply" data-in="${(genAt + 0.5 + i * 0.35).toFixed(2)}" data-a="pop"${label === pick ? ` data-on="${pickAt}"` : ""}><p class="rl">${label}</p><p class="rt safe-check">${replies[i]}</p></div>`,
    ).join("\n    ")}
  </div>
</div>`;

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

// ── R2 — Resposta fraca × resposta do LeadBellus ───────────────────────────
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
    ${cap(7.4, 9.9, `Agora a resposta <em>do LeadBellus:</em>`, "mid")}
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

// ── R5 — Você está na cadeira (situação: Perguntou o preço) ────────────────
const R5_MSG = "Oi! Quanto custa o botox?";
const R5_REPLIES = [
  "Oi! Que bom que você chamou 😊 O valor depende da avaliação. Posso te explicar como funciona?",
  "Cada rosto pede uma quantidade diferente, então o valor sai na avaliação. O que você quer suavizar?",
  "Tenho horários de avaliação esta semana. Prefere manhã ou tarde?",
];
const r5 = {
  slug: "r5-na-cadeira",
  duration: 21.6,
  cover: 1.4,
  html: `
<section class="scene" data-from="0" data-to="8.2">
  <div class="capzone">
    ${cap(-1, 2.6, `<p class="eyebrow">Ela perguntou o preço</p><h1>E você estava <em>aplicando.</em></h1>`, "x")}
    ${cap(2.6, 4.6, `Sem como <em>pegar o celular.</em>`, "mid")}
    ${cap(4.6, 6.4, `<em>40 minutos</em> depois…`)}
    ${cap(6.4, null, `…ela já perguntou <em>em outra clínica.</em>`, "mid")}
  </div>
  <div class="stage">
    <div class="busy">
      <div class="ico">💉</div>
      <div><p class="t safe-check"><span class="dot"></span>Em procedimento</p><p class="s safe-check">Toxina · sala 1 · luvas nas mãos</p></div>
      <span class="clock safe-check" data-clock="846,886,4.6,6.0">14:06</span>
    </div>
    <div class="phone fixed" style="height:640px">
      <div class="chat-head"><div class="avatar">C</div><div><p class="name">Cliente nova</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="divider">Hoje</div>
        <div class="bubble in safe-check" data-in="0.5" data-a="left">${R5_MSG}<span class="time">14:06</span></div>
        <div class="sys safe-check" data-in="2.8" data-out="6.2">📳 1 mensagem não lida</div>
        <div class="bubble in safe-check" data-in="6.6" data-a="left">Já vi em outra clínica, obrigada!<span class="time">14:31</span></div>
      </div>
      <div class="stamp-wrap"><span class="stamp" data-in="7.3" data-a="pop">Ela esfriou</span></div>
    </div>
  </div>
</section>

<section class="scene" data-from="8.2" data-to="14.8">
  <div class="capzone">
    ${cap(8.3, 10.0, `<em>Cole</em> a mensagem.`)}
    ${cap(10.0, 12.2, `Escolha: <em>Perguntou o preço</em>`, "mid")}
    ${cap(12.2, null, `3 respostas <em>no tom da clínica.</em>`, "mid")}
  </div>
  <div class="stage">
    ${gerador({ at: 8.3, msg: R5_MSG, typed: "8.5,9.4", situacao: "Perguntou o preço", sitAt: 10.1, genAt: 11.3, replies: R5_REPLIES, pick: "Consultiva", pickAt: 13.6 })}
  </div>
</section>

<section class="scene" data-from="14.8" data-to="18.4">
  <div class="capzone">
    ${cap(14.9, 16.6, `Revise, <em>copie e envie.</em>`)}
    ${cap(16.6, null, `Na pausa <em>entre clientes.</em>`)}
  </div>
  <div class="stage">
    <span class="label-pill good safe-check">✓ Consultiva · LeadBellus</span>
    <div class="phone fixed" style="height:840px">
      <div class="chat-head"><div class="avatar">C</div><div><p class="name">Cliente nova</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="divider">Hoje</div>
        <div class="bubble in safe-check">${R5_MSG}<span class="time">14:06</span></div>
        <div class="sys green safe-check" data-in="14.9" data-a="pop">☕ Intervalo · 14:08</div>
        <div class="toast safe-check" data-in="15.3" data-out="16.0" data-a="pop">📋 Consultiva copiada</div>
        <div class="bubble out safe-check" data-in="16.1" data-a="right">${R5_REPLIES[1]}<span class="time">14:09 ${TICKS("#4fb6ec")}</span></div>
        <div class="typing" data-in="16.9" data-out="17.5">digitando…</div>
        <div class="bubble in safe-check" data-in="17.6" data-a="left">Quero suavizar a testa 😊 Como é a avaliação?<span class="time">14:11</span></div>
      </div>
    </div>
  </div>
</section>
${endcard(18.4, { bio: true })}`,
};

// ── R6 — Tenho medo de ficar artificial (situação: Tem medo do procedimento) ─
const R6_MSG = "Oi! Tenho medo de ficar artificial 😬";
const R6_REPLIES = [
  "Faz todo sentido ter esse receio 💛 Aqui a gente vai com calma e tira todas as suas dúvidas antes.",
  "Começamos pela avaliação: olho seus traços, entendo o que te incomoda e decidimos juntas se e como fazer.",
  "Quer marcar uma avaliação para conversarmos com calma, sem compromisso? Tenho horários esta semana.",
];
const r6 = {
  slug: "r6-medo-artificial",
  duration: 22.4,
  cover: 1.4,
  html: `
<section class="scene" data-from="0" data-to="8.6">
  <div class="capzone">
    ${cap(-1, 2.8, `<p class="eyebrow">O que você responde?</p><h1>“Tenho medo de ficar <em>artificial.</em>”</h1>`, "x")}
    ${cap(2.8, 5.6, `A resposta que <span class="redtxt">assusta mais:</span>`, "mid")}
    ${cap(5.6, null, `Prometer resultado <span class="redtxt">é problema.</span>`, "mid")}
  </div>
  <div class="stage">
    <div class="phone fixed" style="height:700px">
      <div class="chat-head"><div class="avatar">J</div><div><p class="name">Cliente</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="divider">Hoje</div>
        <div class="bubble in safe-check" data-in="0.4" data-a="left">${R6_MSG}<span class="time">10:24</span></div>
        <div class="bubble out draft safe-check" data-in="3.0" data-a="right"><span class="draft-lbl">Rascunho</span><span class="strike" data-type="3.2,4.6" data-on="5.8">kkk relaxa, fica super natural, garanto!</span></div>
        <div class="sys red safe-check" data-in="6.2">✕ Promete resultado · não envie</div>
      </div>
    </div>
  </div>
</section>

<section class="scene" data-from="8.6" data-to="15.4">
  <div class="capzone">
    ${cap(8.7, 10.4, `<em>Cole</em> a mensagem.`)}
    ${cap(10.4, 12.6, `Escolha: <em>Tem medo do procedimento</em>`, "mid")}
    ${cap(12.6, null, `3 respostas que <em>acolhem o medo.</em>`, "mid")}
  </div>
  <div class="stage">
    ${gerador({ at: 8.7, msg: R6_MSG, typed: "8.9,10.0", situacao: "Tem medo do procedimento", sitAt: 10.5, genAt: 11.7, replies: R6_REPLIES, pick: "Consultiva", pickAt: 14.0 })}
  </div>
</section>

<section class="scene" data-from="15.4" data-to="19.2">
  <div class="capzone">
    ${cap(15.5, 17.4, `Ela leva para <em>a avaliação.</em>`, "mid")}
    ${cap(17.4, null, `Sem promessa. <em>Você revisa e envia.</em>`, "mid")}
  </div>
  <div class="stage">
    <span class="label-pill good safe-check">✓ Consultiva · LeadBellus</span>
    <div class="phone fixed" style="height:800px">
      <div class="chat-head"><div class="avatar">J</div><div><p class="name">Cliente</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="bubble in safe-check">${R6_MSG}<span class="time">10:24</span></div>
        <div class="toast safe-check" data-in="15.6" data-out="16.3" data-a="pop">📋 Consultiva copiada</div>
        <div class="bubble out safe-check" data-in="16.5" data-a="right">${R6_REPLIES[1]}<span class="time">10:26 ${TICKS("#4fb6ec")}</span></div>
        <div class="typing" data-in="17.4" data-out="18.0">digitando…</div>
        <div class="bubble in safe-check" data-in="18.1" data-a="left">Assim fico mais tranquila. Como marco a avaliação?<span class="time">10:28</span></div>
      </div>
    </div>
  </div>
</section>
${endcard(19.2, { bio: true })}`,
};

// ── R7 — Perguntou o preço e sumiu (situação: Sumiu / não respondeu) ───────
const R7_MSG = "Oi! Quanto fica o preenchimento labial?";
// O que a clínica já tinha respondido (e ficou sem resposta) antes da retomada.
const R7_CLINICA = "O valor depende da avaliação 😊 Posso te explicar como funciona?";
const R7_REPLIES = [
  "Oi, Ana! Passando só pra saber se ficou alguma dúvida sobre o preenchimento 😊 Estou por aqui.",
  "Ana, quer que eu te explique como funciona a avaliação? Assim você decide com calma, no seu tempo.",
  "Tenho horários de avaliação esta semana. Quer que eu veja um que encaixe na sua rotina?",
];
const row = (at, letter, name, last, when) => `
      <div class="row" data-in="${at}" data-a="left"${letter === "A" ? ' data-on="5.2"' : ""}>
        <div class="avatar">${letter}</div>
        <div class="who"><p class="nm">${name}</p><p class="last safe-check">${TICKS("#4fb6ec")} ${last}</p></div>
        <span class="meta safe-check">${when}</span>
      </div>`;
const r7 = {
  slug: "r7-sumiu-retomada",
  duration: 21,
  cover: 1.4,
  html: `
<section class="scene" data-from="0" data-to="7.4">
  <div class="capzone">
    ${cap(-1, 2.8, `<p class="eyebrow">Perguntou o preço e sumiu</p><h1>Quantas estão <em>paradas aí?</em></h1>`, "x")}
    ${cap(2.8, 5.0, `Pediu o valor. <em>Visualizou. Sumiu.</em>`, "mid")}
    ${cap(5.0, null, `E você não sabe <em>o que mandar.</em>`, "mid")}
  </div>
  <div class="stage">
    <div class="list">
      <div class="list-head"><p class="t safe-check">Conversas</p><span class="s safe-check">WhatsApp da clínica</span></div>
      ${row(0.15, "A", "Ana Paula", "Você: O valor depende da avaliação 😊", "há 3 dias")}
      ${row(0.35, "B", "Bruna", "Você: Posso te explicar como funciona?", "há 5 dias")}
      ${row(0.55, "C", "Carla", "Você: Segue como funciona a avaliação", "há 1 sem")}
      ${row(0.75, "D", "Daniela", "Você: Qualquer dúvida, estou aqui!", "há 2 sem")}
      ${row(0.95, "F", "Fernanda", "Você: Te mandei os detalhes 😉", "há 2 sem")}
    </div>
    <div class="sys red safe-check" data-in="3.0" style="margin-top:28px">Visualizadas · sem resposta</div>
  </div>
</section>

<section class="scene" data-from="7.4" data-to="14.0">
  <div class="capzone">
    ${cap(7.5, 9.2, `<em>Cole</em> a mensagem dela.`, "mid")}
    ${cap(9.2, 11.4, `Escolha: <em>Sumiu / não respondeu</em>`, "mid")}
    ${cap(11.4, null, `3 jeitos leves <em>de retomar.</em>`, "mid")}
  </div>
  <div class="stage">
    ${gerador({ at: 7.5, msg: R7_MSG, typed: "7.7,8.7", situacao: "Sumiu / não respondeu", sitAt: 9.3, genAt: 10.5, replies: R7_REPLIES, pick: "Suave", pickAt: 12.9 })}
  </div>
</section>

<section class="scene" data-from="14.0" data-to="17.8">
  <div class="capzone">
    ${cap(14.1, 15.9, `Sem cobrança. <em>Sem culpa.</em>`)}
    ${cap(15.9, null, `Com um <em>próximo passo.</em>`)}
  </div>
  <div class="stage">
    <span class="label-pill good safe-check">✓ Suave · LeadBellus</span>
    <div class="phone fixed scrolls" style="height:840px">
      <div class="chat-head"><div class="avatar">A</div><div><p class="name">Ana Paula</p><p class="status">online</p></div></div>
      <div class="chat-body">
        <div class="bubble in safe-check">${R7_MSG}<span class="time">seg · 10:12</span></div>
        <div class="bubble out safe-check">${R7_CLINICA}<span class="time">seg · 10:15 ${TICKS("#4fb6ec")}</span></div>
        <div class="divider">3 dias depois</div>
        <div class="toast safe-check" data-in="14.2" data-out="14.9" data-a="pop">📋 Suave copiada</div>
        <div class="bubble out safe-check" data-in="15.1" data-a="right">${R7_REPLIES[0]}<span class="time">09:30 ${TICKS("#4fb6ec")}</span></div>
        <div class="typing" data-in="16.0" data-out="16.6">digitando…</div>
        <div class="bubble in safe-check" data-in="16.7" data-a="left">Oi! Fiquei sem tempo essa semana 🙈 Como funciona a avaliação?<span class="time">09:41</span></div>
      </div>
    </div>
  </div>
</section>
${endcard(17.8, { bio: true })}`,
};

export const REELS = [r1, r2, r3, r5, r6, r7];

// ── R4 — Tour do produto (site ao vivo) ────────────────────────────────────
// O site é capturado num viewport de celular (420x595 CSS, deviceScaleFactor
// 2,2 → 924x1309 px) e encaixado na "tela" abaixo da faixa de legendas.
// Alvos de rolagem: "top", seletor CSS ou "text:..." (menor elemento que
// contém o texto), opcionalmente dentro de `scope`. Dois pontos a 0,02 s um do
// outro viram um corte seco (como o salto de uma âncora). `highlight` contorna
// um elemento do site em dourado só na gravação (nada é clicado).
//
// Segue o caminho do CTA principal do hero, "Colar mensagem e ver 3 respostas
// grátis" (leva a #demo): botão → simulador → situação → mensagem → 3
// respostas → plano.
// A legenda das abas usa os rótulos da demo da landing (Suave / Explica /
// Fechamento, em components/landing-whatsapp-demo.tsx), não os do app.
export const TOUR = {
  slug: "r4-tour",
  duration: 23.6,
  cover: 1.0,
  viewport: { width: 420, height: 595, scale: 2.2 },
  highlight: [{ from: 3.9, to: 5.8, selector: "#hero-ctas a" }],
  scroll: [
    { t: 0, to: "top" },
    { t: 3.0, to: "top" },
    { t: 4.0, to: "#hero-ctas", dy: -300 },
    { t: 5.8, to: "#hero-ctas", dy: -300 },
    { t: 5.82, to: "text:Simulador rápido", scope: "#demo", dy: -28 },
    { t: 8.0, to: "text:Simulador rápido", scope: "#demo", dy: -28 },
    { t: 9.0, to: "text:Situação", scope: "#demo", dy: -150 },
    { t: 11.0, to: "text:Situação", scope: "#demo", dy: -150 },
    { t: 11.8, to: "#demo_msg", dy: -64 },
    { t: 13.8, to: "#demo_msg", dy: -64 },
    { t: 14.8, to: "text:Você pode copiar e colar", scope: "#demo", dy: -470 },
    { t: 16.4, to: "text:Você pode copiar e colar", scope: "#demo", dy: -470 },
    { t: 17.4, to: "text:Preço de lançamento", scope: "#precos", dy: -40 },
    { t: 20.4, to: "text:Preço de lançamento", scope: "#precos", dy: -40 },
  ],
  html: `
<section class="scene" data-from="0" data-to="20.4">
  <div class="capzone">
    ${cap(-1, 3.0, `<p class="eyebrow">Tour rápido</p><h1>Responda antes dela <em>desistir.</em></h1>`, "x")}
    ${cap(3.0, 5.8, `Toque em <em>“Colar mensagem”</em>`, "mid")}
    ${cap(5.8, 8.4, `Cai direto <em>no simulador.</em>`, "mid")}
    ${cap(8.4, 11.2, `Escolha a <em>situação</em>`, "mid")}
    ${cap(11.2, 14.0, `Cole a mensagem <em>e gere.</em>`, "mid")}
    ${cap(14.0, 16.6, `<p class="mid">3 abas: <em>Suave, Explica e Fechamento</em></p><p class="sub">você revisa e envia</p>`, "x")}
    ${cap(16.6, 18.6, `Plano Start: <em>R$ 97/mês</em>`, "mid")}
    ${cap(18.6, null, `<em>5 respostas grátis,</em> sem cartão`, "mid")}
  </div>
  <div class="device"><img id="site" alt="" /></div>
</section>
${endcard(20.4)}`,
};
