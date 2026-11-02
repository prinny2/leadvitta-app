// Conteúdo dos 7 criativos de anúncio (Meta) — um por seção da LP.
// Compliance: sem promessa de resultado, sem preço de procedimento (só o
// R$97 do plano Start), sem alegação médica e sem dizer que o LeadBellus
// envia sozinho ou se conecta ao WhatsApp (exceto o "piloto", sempre como
// lista de espera / em preparação). Copy de mídia: docs/marketing/campanha-meta.md

const icon = (d, size = 38, stroke = "currentColor") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const I = {
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  sparkles:
    '<path d="M9.94 14.06 4 20"/><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
};

const chatHead = (name, status) => `
  <div class="chat-head">
    <div class="avatar">${icon(I.message, 26, "#1FA855")}</div>
    <div><p class="name">${name}</p><p class="status">${status}</p></div>
  </div>`;

export const CREATIVES = [
  {
    n: "01",
    slug: "hero",
    eyebrow: "Clínicas de estética · WhatsApp",
    hook: "Responda enquanto ela ainda está <em>quente.</em>",
    support: "3 respostas no tom da sua clínica, em segundos. <strong>Sua equipe revisa e envia.</strong>",
    cta: "Teste grátis",
    visual: `
      <div class="card hero-card">
        ${chatHead("Cliente · WhatsApp", "online agora")}
        <div class="chat-body">
          <div class="bubble in">Oi! Quanto fica o botox? Tenho medo de ficar artificial…<span class="time">14:37</span></div>
          <div class="bubble out">Oi! Que bom que você perguntou. O valor depende da avaliação, porque cada rosto é único. Quer que eu veja um horário pra você essa semana?<span class="time">14:38</span></div>
        </div>
        <div class="typing-row">
          <span class="tag">Suave</span><span class="tag">Consultiva</span><span class="tag gold">Fechamento</span>
          <span class="note">· a equipe escolhe e envia</span>
        </div>
      </div>`,
  },
  {
    n: "02",
    slug: "como-funciona",
    eyebrow: "Como funciona",
    hook: "Cole a mensagem. Receba <em>3 respostas.</em>",
    support: "Em segundos, no tom da sua clínica. Sua equipe revisa e envia.",
    cta: "Teste grátis",
    visual: `
      <div class="steps">
        <div class="glass step"><span class="num">01</span><span class="ico">${icon(I.copy)}</span><div><h3>Cole a mensagem</h3><p>O que a cliente mandou no WhatsApp.</p></div></div>
        <div class="glass step"><span class="num">02</span><span class="ico goldbg">${icon(I.sparkles)}</span><div><h3>Receba 3 respostas</h3><p>Suave, Consultiva e Fechamento.</p></div></div>
        <div class="glass step"><span class="num">03</span><span class="ico">${icon(I.send)}</span><div><h3>Sua equipe envia</h3><p>Revisa, ajusta e cola na conversa.</p></div></div>
      </div>`,
  },
  {
    n: "03",
    slug: "piloto",
    eyebrow: "WhatsApp conectado · lista de espera",
    hook: "Piloto em preparação. <em>Entre na lista.</em>",
    support: "Deixe seu e-mail no site. Enquanto isso, teste grátis a versão de hoje.",
    cta: "5 respostas grátis",
    visual: `
      <div class="glass inbox">
        <div class="inbox-head"><p class="title">Caixa de entrada · prévia do piloto</p><span class="tag dark">Em preparação</span></div>
        <div class="row"><span class="dot"></span><div><p class="t">Quem está esperando</p><p class="s">Mandou mensagem e ainda não teve resposta</p></div><span class="blur-line"></span></div>
        <div class="row"><span class="dot"></span><div><p class="t">Quem sumiu</p><p class="s">Pediu orçamento e parou de responder</p></div><span class="blur-line"></span></div>
        <div class="row"><span class="dot"></span><div><p class="t">Quem fez e não voltou</p><p class="s">No tempo de retorno ou manutenção</p></div><span class="blur-line"></span></div>
      </div>`,
  },
  {
    n: "04",
    slug: "para-quem",
    eyebrow: "Para quem é",
    hook: "Feito para clínicas de <em>estética.</em>",
    support: "Respostas que entendem o procedimento e o momento da cliente.",
    cta: "Teste grátis",
    visual: `
      <div class="chips">
        <span class="chip hl">${icon(I.check, 30)} Clínicas de estética</span>
        <span class="chip">Harmonização facial</span>
        <span class="chip">Biomedicina estética</span>
        <span class="chip">Injetáveis</span>
        <span class="chip">Estética corporal</span>
        <span class="chip">Skincare</span>
        <span class="chip">Capilar</span>
      </div>`,
  },
  {
    n: "05",
    slug: "demo",
    eyebrow: "Veja na prática",
    hook: "Uma pergunta. <em>Três respostas.</em>",
    support: "Escolha a melhor, ajuste se quiser e envie.",
    cta: "Teste grátis",
    visual: `
      <div class="card phone">
        ${chatHead("Cliente · WhatsApp", "online")}
        <div class="chat-body"><div class="bubble in">Quanto custa o botox?<span class="time">09:12</span></div></div>
        <div class="sugs">
          <div class="sug"><p class="lbl">Suave</p><p class="txt">Oi! Que bom que você chamou. O valor depende da avaliação. Posso ver um horário pra você?</p></div>
          <div class="sug"><p class="lbl">Consultiva</p><p class="txt">Cada rosto pede um cuidado diferente, por isso o valor é definido na avaliação, com calma.</p></div>
          <div class="sug pick"><p class="lbl">Fechamento</p><p class="txt">Tenho avaliação quinta às 15h ou sexta às 10h. Qual fica melhor pra você?</p></div>
        </div>
      </div>`,
  },
  {
    n: "06",
    slug: "precos",
    eyebrow: "Plano Start",
    hook: "Sua secretária de WhatsApp por <em>R$97/mês.</em>",
    support: "Comece com 5 respostas grátis. Sem cartão.",
    cta: "5 respostas grátis",
    visual: `
      <div class="glass price">
        <span class="ribbon">5 grátis</span>
        <p class="plan">Start</p>
        <p class="amount">R$97<small>/mês</small></p>
        <ul class="checks">
          <li>${icon(I.check, 34, "#E4A84D")} 5 respostas grátis para testar</li>
          <li>${icon(I.check, 34, "#E4A84D")} Sem cartão de crédito</li>
          <li>${icon(I.check, 34, "#E4A84D")} Cancele quando quiser</li>
        </ul>
      </div>`,
  },
  {
    n: "07",
    slug: "faq",
    eyebrow: "Dúvida frequente",
    hook: "Ela não envia <em>sozinha.</em>",
    support: "Ela escreve. <strong>Sua equipe revisa e decide o que enviar.</strong>",
    cta: "Teste grátis",
    visual: `
      <div class="faq">
        <p class="q">“O LeadBellus manda mensagem pelo meu WhatsApp?”</p>
        <div class="card review">
          <span class="tag gold">Sugestão · Consultiva</span>
          <p class="txt">Entendo sua dúvida! Aqui cada caso é avaliado com calma antes de qualquer indicação. Quer agendar uma avaliação?</p>
          <div class="actions">
            <span class="btn">${icon(I.pen, 20)} Ajustar</span>
            <span class="btn primary">${icon(I.copy, 20)} Copiar</span>
            <span class="ok">${icon(I.shield, 22, "#1FA855")} Revisado pela equipe</span>
          </div>
        </div>
      </div>`,
  },
];
