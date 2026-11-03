// Linha do tempo determinística dos Reels LeadBellus.
//
// O render-reels.mjs chama window.__seek(t) para cada quadro (30 fps) e tira
// um screenshot — então tudo aqui é função pura de t (sem setTimeout, sem CSS
// animation), e o vídeo sai idêntico a cada render.
//
// Atributos suportados:
//   .scene[data-from][data-to]   cena visível no intervalo (crossfade de 0,35 s)
//   [data-in="t"]                entra em t (anim em data-a: up | pop | left | right | fade)
//   [data-out="t"]               sai em t
//   [data-type="t0,t1"]          efeito de digitação do texto entre t0 e t1
//   [data-clock="m0,m1,t0,t1"]   relógio HH:MM avançando de m0 a m1 minutos (vira a meia-noite)
//   [data-count="v0,v1,t0,t1"]   contador em reais (pt-BR) de v0 a v1
//   [data-on="t"]                ganha a classe .on a partir de t (destaques, botão pressionado)
(function () {
  const IN_DUR = 0.45;
  const OUT_DUR = 0.35;
  const SCENE_FADE = 0.35;

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeOutBack = (x) => {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };
  const num = (v) => parseFloat(v);

  function transformFor(anim, p) {
    const q = 1 - p;
    switch (anim) {
      case "pop":
        return `scale(${0.82 + 0.18 * easeOutBack(p)})`;
      case "left":
        return `translateX(${-80 * q}px)`;
      case "right":
        return `translateX(${80 * q}px)`;
      case "fade":
        return "none";
      default:
        return `translateY(${46 * q}px)`;
    }
  }

  // Guarda os textos originais para os efeitos de digitação.
  // Fatiado por code point (Array.from) para nunca cortar um emoji ao meio.
  const typed = Array.from(document.querySelectorAll("[data-type]")).map((el) => ({
    el,
    chars: Array.from(el.textContent),
    range: el.dataset.type.split(",").map(num),
  }));

  const fmtClock = (m) => {
    const mm = ((Math.round(m) % 1440) + 1440) % 1440;
    return `${String(Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
  };
  const fmtBRL = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");

  window.__seek = function (t) {
    document.querySelectorAll(".scene").forEach((s) => {
      const from = num(s.dataset.from);
      const to = num(s.dataset.to);
      let o = 0;
      if (t >= from && t < to) {
        o = from === 0 ? 1 : easeOut(clamp((t - from) / SCENE_FADE));
        o = Math.min(o, clamp((to - t) / SCENE_FADE));
        if (to >= 9999) o = from === 0 ? 1 : easeOut(clamp((t - from) / SCENE_FADE));
      }
      s.style.opacity = String(o);
      s.style.visibility = o > 0.001 ? "visible" : "hidden";
    });

    document.querySelectorAll("[data-in], [data-out]").forEach((el) => {
      const tin = el.dataset.in !== undefined ? num(el.dataset.in) : -Infinity;
      const tout = el.dataset.out !== undefined ? num(el.dataset.out) : Infinity;
      const anim = el.dataset.a || "up";
      let p = tin === -Infinity ? 1 : clamp((t - tin) / IN_DUR);
      let o = anim === "pop" ? clamp(p * 2.2) : easeOut(p);
      let tf = transformFor(anim, anim === "pop" ? p : easeOut(p));
      if (t >= tout) {
        const q = easeOut(clamp((t - tout) / OUT_DUR));
        o = o * (1 - q);
        tf = `translateY(${-30 * q}px)`;
      }
      el.style.opacity = String(o);
      el.style.transform = tf;
      // Dentro de uma conversa, a mensagem só ocupa espaço depois que chega
      // (empurra as anteriores para cima, como no WhatsApp).
      if (el.parentElement && el.parentElement.classList.contains("chat-body")) {
        el.style.display = t < tin || t >= tout + OUT_DUR ? "none" : "";
      }
    });

    typed.forEach(({ el, chars, range }) => {
      const p = clamp((t - range[0]) / (range[1] - range[0]));
      const n = Math.round(chars.length * p);
      el.textContent = chars.slice(0, n).join("");
      el.classList.toggle("caret", p > 0 && p < 1);
    });

    document.querySelectorAll("[data-clock]").forEach((el) => {
      const [m0, m1, t0, t1] = el.dataset.clock.split(",").map(num);
      const p = clamp((t - t0) / (t1 - t0));
      el.textContent = fmtClock(m0 + (m1 - m0) * (p * p * (3 - 2 * p)));
    });

    document.querySelectorAll("[data-count]").forEach((el) => {
      const [v0, v1, t0, t1] = el.dataset.count.split(",").map(num);
      const p = easeOut(clamp((t - t0) / (t1 - t0)));
      el.textContent = fmtBRL(v0 + (v1 - v0) * p);
    });

    document.querySelectorAll("[data-on]").forEach((el) => {
      el.classList.toggle("on", t >= num(el.dataset.on));
    });
  };

  // Verificação de área segura: devolve o texto visível fora de y 250–1600 / x 40–1040.
  window.__safeCheck = function () {
    const bad = [];
    const visible = (el) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05 || cs.display === "none") return false;
      }
      return true;
    };
    document.querySelectorAll(".safe-check").forEach((el) => {
      if (!visible(el)) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.top < 248 || r.bottom > 1602 || r.left < 36 || r.right > 1044) {
        bad.push(`${el.className.split(" ")[0]} "${el.textContent.trim().slice(0, 40)}" [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
      }
    });
    return bad;
  };
})();
