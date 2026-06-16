"use client";

import { useEffect, useRef, useState } from "react";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      "#07101e",
  sidebar: "#0b1424",
  card:    "#0f1b2f",
  cardAlt: "#131f35",
  border:  "rgba(255,255,255,0.06)",
  gold:    "#C9A060",
  champ:   "#D4C4A0",
  muted:   "#5a7a9a",
  orange:  "#F97316",
  blue:    "#60a5fa",
  green:   "#4ade80",
};

// ─── MiniSidebar ─────────────────────────────────────────────────────────────
function MiniSidebar({ activeIdx = 0 }: { activeIdx?: number }) {
  const items = [
    { label: "Início" },
    { label: "Gerador" },
    { label: "Lead Intelligence", pro: true },
    { label: "Objeções" },
    { label: "Follow-up" },
    { label: "Scripts" },
    { label: "Histórico" },
    { label: "Configurações" },
  ];
  return (
    <div style={{
      width: "68px", flexShrink: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      padding: "10px 6px", gap: "1px", height: "100%",
    }}>
      <div style={{ padding: "4px 4px 10px", borderBottom: "1px solid rgba(201,160,96,0.12)", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="12" height="15" viewBox="0 0 80 96" fill="none">
            <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <line x1="40" y1="32" x2="40" y2="86" stroke="#C9A060" strokeWidth="7" strokeLinecap="round"/>
            <circle cx="40" cy="27" r="10" fill="#C9A060"/>
          </svg>
          <div style={{ fontSize: "5.5px", fontWeight: 700, color: C.champ }}>Lead<span style={{ color: C.gold }}>Bellus</span></div>
        </div>
      </div>
      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,160,96,0.3),transparent)", marginBottom: "4px" }}/>
      {items.map((item, i) => (
        <div key={item.label} style={{
          display: "flex", alignItems: "center", gap: "4px",
          padding: "3.5px 5px", borderRadius: "5px",
          background: i === activeIdx ? "rgba(255,255,255,0.05)" : "transparent",
          borderLeft: i === activeIdx ? "1.5px solid #C9A060" : "1.5px solid transparent",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "2px", flexShrink: 0, background: i === activeIdx ? C.gold : "rgba(255,255,255,0.18)" }}/>
          <span style={{ fontSize: "4.5px", flex: 1, overflow: "hidden", whiteSpace: "nowrap", color: i === activeIdx ? C.gold : "rgba(255,255,255,0.4)", fontWeight: i === activeIdx ? 700 : 400 }}>{item.label}</span>
          {item.pro && <span style={{ fontSize: "3px", background: "rgba(201,160,96,0.15)", border: "1px solid rgba(201,160,96,0.3)", color: C.gold, borderRadius: "9999px", padding: "0 2px", lineHeight: "7px", flexShrink: 0 }}>PRO</span>}
        </div>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,160,96,0.25),transparent)", margin: "4px 2px" }}/>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 5px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "rgba(255,255,255,0.12)" }}/>
        <span style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.25)" }}>Sair</span>
      </div>
    </div>
  );
}

// ─── SCREEN: Dashboard ────────────────────────────────────────────────────────
function ScreenDashboard() {
  const weekVals = [4, 7, 5, 9, 12, 8, 3];
  const maxV = 12;
  const W = 148, H = 60;
  const xs = weekVals.map((_, i) => 6 + i * (W / 6));
  const ys = weekVals.map(v => H - 4 - (v / maxV) * (H - 10));
  const linePts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const areaPath = `M ${xs[0]},${H} ${xs.map((x, i) => `L ${x},${ys[i]}`).join(" ")} L ${xs[6]},${H} Z`;
  const leads = [
    { name: "Quentes", v: 3,  color: C.orange, pct: 14 },
    { name: "Mornos",  v: 7,  color: C.gold,   pct: 32 },
    { name: "Frias",   v: 12, color: C.muted,  pct: 54 },
  ];
  const DIAS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={0}/>
      <div style={{ flex: 1, background: C.bg, padding: "10px 10px 8px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "4.5px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Seg, 16 de junho</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: C.champ, fontFamily: "Georgia,serif", marginTop: "1px" }}>Boa tarde, Clínica ✦</div>
            <div style={{ fontSize: "4px", color: C.muted, marginTop: "1px" }}>Pronta para converter mais hoje?</div>
          </div>
          <div style={{ background: C.gold, borderRadius: "6px", padding: "4px 8px", fontSize: "5px", fontWeight: 700, color: C.bg }}>✦ Gerar resposta</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "5px" }}>
          {[
            { label: "Respostas hoje", value: "12", sub: "+3 vs ontem",    icon: "⚡", gold: false },
            { label: "Score médio",    value: "74%", sub: "esta semana",   icon: "📈", gold: true  },
            { label: "Leads quentes",  value: "3",   sub: "responda agora",icon: "🔥", gold: false },
            { label: "Follow-ups",     value: "8",   sub: "esta semana",   icon: "↗",  gold: false },
          ].map((k) => (
            <div key={k.label} style={{ background: C.card, borderRadius: "6px", padding: "6px 5px", border: k.gold ? "1px solid rgba(201,160,96,0.4)" : `1px solid ${C.border}`, boxShadow: k.gold ? "0 0 10px rgba(201,160,96,0.1)" : undefined }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "4px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</span>
                <span style={{ fontSize: "7px" }}>{k.icon}</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: k.gold ? C.gold : "#FFF", fontFamily: "Georgia,serif" }}>{k.value}</div>
              <div style={{ fontSize: "3.5px", color: C.muted, marginTop: "1px" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: `linear-gradient(135deg, ${C.card} 0%, ${C.cardAlt} 60%, #0d1a2e 100%)`, border: "1px solid rgba(201,160,96,0.3)", borderRadius: "6px", padding: "6px 8px", display: "flex", alignItems: "center", gap: "7px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "26px", height: "26px", borderRadius: "50%", border: "1px solid rgba(201,160,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "11px" }}>🧠</span>
          </div>
          <div style={{ width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0, background: "linear-gradient(135deg,rgba(201,160,96,0.2),rgba(201,160,96,0.08))", border: "1px solid rgba(201,160,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "9px" }}>🧠</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "1px" }}>
              <span style={{ fontSize: "6px", fontWeight: 700, color: "#FFF", fontFamily: "Georgia,serif" }}>Lead Intelligence</span>
              <span style={{ fontSize: "3.5px", background: "rgba(201,160,96,0.2)", border: "1px solid rgba(201,160,96,0.35)", color: C.gold, borderRadius: "9999px", padding: "0 3px", lineHeight: "7px" }}>PRO</span>
            </div>
            <div style={{ fontSize: "4px", color: "#8aacc8" }}>Score de conversão, perfil psicológico e estratégia para fechar o lead</div>
            <div style={{ fontSize: "4px", color: C.gold, marginTop: "2px" }}>🎯 Analisar um lead agora →</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "5px", flex: 1, minHeight: 0 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "7px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
              <div>
                <div style={{ fontSize: "4px", color: C.muted, textTransform: "uppercase" }}>Esta semana</div>
                <div style={{ fontSize: "6px", fontWeight: 600, color: C.champ, fontFamily: "Georgia,serif" }}>Respostas geradas</div>
              </div>
              <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "9999px", padding: "1.5px 5px", fontSize: "4px", color: C.green, fontWeight: 600 }}>↑ +24%</div>
            </div>
            <svg width="100%" height="100%" viewBox={`0 0 ${W+12} ${H}`} preserveAspectRatio="none" style={{ flex: 1, minHeight: "50px" }}>
              <defs>
                <linearGradient id="hd3-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A060" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#C9A060" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[H*0.25, H*0.5, H*0.75].map(y => <line key={y} x1="0" y1={y} x2={W+12} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>)}
              <path d={areaPath} fill="url(#hd3-area)"/>
              <polyline points={linePts} fill="none" stroke="#C9A060" strokeWidth="1.5" strokeLinejoin="round"/>
              {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="2" fill="#C9A060"/>)}
              {DIAS.map((d, i) => <text key={d} x={xs[i]} y={H} textAnchor="middle" fill={C.muted} fontSize="4">{d}</text>)}
            </svg>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "7px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "4px", color: C.muted, textTransform: "uppercase", marginBottom: "1px" }}>Temperatura</div>
            <div style={{ fontSize: "6px", fontWeight: 600, color: C.champ, fontFamily: "Georgia,serif", marginBottom: "5px" }}>Seus leads</div>
            <svg width="100%" height="50" viewBox="0 0 60 60" style={{ display: "block" }}>
              <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle cx="30" cy="30" r="22" fill="none" stroke="#F97316" strokeWidth="8" strokeDasharray={`${0.14*138.2} ${138.2}`} strokeDashoffset="0" transform="rotate(-90 30 30)"/>
              <circle cx="30" cy="30" r="22" fill="none" stroke="#C9A060" strokeWidth="8" strokeDasharray={`${0.32*138.2} ${138.2}`} strokeDashoffset={`${-0.14*138.2}`} transform="rotate(-90 30 30)"/>
              <circle cx="30" cy="30" r="22" fill="none" stroke="#6B8CAE" strokeWidth="8" strokeDasharray={`${0.54*138.2} ${138.2}`} strokeDashoffset={`${-0.46*138.2}`} transform="rotate(-90 30 30)"/>
              <text x="30" y="33" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="700" fontFamily="serif">22</text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5px", marginTop: "4px" }}>
              {leads.map(l => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: l.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: "4px", color: C.muted }}>{l.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <span style={{ fontSize: "4px", fontWeight: 600, color: C.champ }}>{l.v}</span>
                    <span style={{ fontSize: "3.5px", color: C.muted }}>{l.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Gerador ──────────────────────────────────────────────────────────
function ScreenGerador() {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={1}/>
      <div style={{ flex: 1, background: C.bg, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
        <div>
          <div style={{ fontSize: "4.5px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>IA para vendas de estética</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: C.champ, fontFamily: "Georgia,serif", marginTop: "1px" }}>Gerador de Respostas</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "7px" }}>
          <div style={{ fontSize: "4.5px", color: C.muted, marginBottom: "3px" }}>Mensagem da cliente</div>
          <div style={{ background: C.bg, border: "1px solid rgba(201,160,96,0.35)", borderRadius: "5px", padding: "5px 6px", fontSize: "5px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
            Olá! Quanto custa o botox? Vi no Instagram e fiquei curiosa ✨
          </div>
          <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
            <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "3px 6px", fontSize: "4px", color: C.muted }}>Tom: Consultivo · Situação: Interesse</div>
            <div style={{ background: C.gold, borderRadius: "4px", padding: "3px 10px", fontSize: "5px", fontWeight: 700, color: C.bg }}>✦ Gerar</div>
          </div>
        </div>
        {[
          { label: "Suave",      emoji: "🌸", color: C.blue,  text: "Oi! Que bom que você nos encontrou ✨ O botox é muito seguro e os resultados são incríveis. Posso te explicar melhor?" },
          { label: "Consultiva", emoji: "💎", color: C.gold,  text: "Olá! Adorei o contato. Antes de falar em investimento, me conta: você busca mais prevenção ou já tem alguma linha que te incomoda?" },
          { label: "Fechamento", emoji: "🎯", color: C.green, text: "Perfeita escolha! Tenho horário esta semana. O que funciona melhor pra você — manhã ou tarde?" },
        ].map((r) => (
          <div key={r.label} style={{ background: C.card, border: `1px solid ${r.color}22`, borderLeft: `2.5px solid ${r.color}`, borderRadius: "5px", padding: "6px 7px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "8px" }}>{r.emoji}</span>
                <span style={{ fontSize: "5.5px", fontWeight: 700, color: r.color }}>{r.label}</span>
              </div>
              <div style={{ background: `${r.color}18`, border: `1px solid ${r.color}35`, borderRadius: "9999px", padding: "1px 6px", fontSize: "4px", color: r.color }}>Copiar</div>
            </div>
            <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN: Lead Intelligence ────────────────────────────────────────────────
function ScreenLeadIntelligence() {
  const R = 44, circ = 2 * Math.PI * R;
  const score = 78;
  const offset = circ * (1 - score / 100);
  const tc = C.orange;
  const axes = [
    { label: "Urgência",      v: 85 },
    { label: "Intenção",      v: 76 },
    { label: "Confiança",     v: 65 },
    { label: "Receptividade", v: 90 },
    { label: "Maturidade",    v: 72 },
  ];
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={2}/>
      <div style={{ flex: 1, background: C.bg, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "4.5px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Análise de lead</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: C.champ, fontFamily: "Georgia,serif" }}>Lead Intelligence</div>
          </div>
          <span style={{ fontSize: "3.5px", background: "rgba(201,160,96,0.15)", border: "1px solid rgba(201,160,96,0.3)", color: C.gold, borderRadius: "9999px", padding: "2px 5px" }}>PRO</span>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "6px" }}>
          <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "4px" }}>&ldquo;Oi! Quero marcar uma avaliação, quando vocês têm horário disponível?&rdquo;</div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: C.gold, borderRadius: "4px", padding: "3px 9px", fontSize: "4.5px", fontWeight: 700, color: C.bg }}>🧠 Analisar lead</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <svg width="88" height="88" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
              <circle cx="50" cy="50" r={R} fill="none" stroke={tc} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
                style={{ filter: `drop-shadow(0 0 5px ${tc}90)` }}/>
              <text x="50" y="45" textAnchor="middle" fill="#FFF" fontSize="24" fontWeight="800" fontFamily="serif">{score}</text>
              <text x="50" y="59" textAnchor="middle" fill={tc} fontSize="9" fontWeight="600">SCORE</text>
            </svg>
            <div style={{ background: `${tc}18`, border: `1px solid ${tc}45`, borderRadius: "9999px", padding: "2px 8px", fontSize: "5px", fontWeight: 700, color: tc }}>🔥 Lead Quente</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "4px" }}>
            {axes.map(a => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "4px", color: C.muted, width: "44px", flexShrink: 0 }}>{a.label}</span>
                <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${a.v}%`, height: "100%", background: "linear-gradient(90deg,#C9A060,#d4b47a)", borderRadius: "3px" }}/>
                </div>
                <span style={{ fontSize: "4px", color: C.gold, width: "16px", textAlign: "right", flexShrink: 0 }}>{a.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
          {[
            { icon: "👤", title: "Perfil",    text: "Lead quente — já decidiu, está escolhendo quando e onde fazer." },
            { icon: "💡", title: "Abordagem", text: "Responda rápido. Ofereça 2 horários e confirme em seguida." },
            { icon: "🎯", title: "Gatilho",   text: "'Tenho horário amanhã às 14h ou quinta às 10h.' Crie urgência." },
          ].map(c => (
            <div key={c.title} style={{ background: C.card, border: "1px solid rgba(201,160,96,0.12)", borderRadius: "5px", padding: "5px" }}>
              <div style={{ fontSize: "5px", marginBottom: "3px" }}>{c.icon} <span style={{ fontWeight: 700, color: C.gold }}>{c.title}</span></div>
              <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Objeções (faithful bookshelf) ────────────────────────────────────
function ScreenObjecoes() {
  const [hov, setHov] = useState<number | null>(null);
  const books = [
    { title: "Preço",       num: "01", icon: "🏷️" },
    { title: "Medo",        num: "02", icon: "🛡️" },
    { title: "Confiança",   num: "03", icon: "🤝" },
    { title: "Agendamento", num: "04", icon: "📅" },
    { title: "Pós-venda",   num: "05", icon: "💬" },
  ];
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={3}/>
      <div style={{ flex: 1, background: C.bg, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "4.5px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Respostas prontas</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: C.champ, fontFamily: "Georgia,serif", marginTop: "1px" }}>Biblioteca de Objeções</div>
            <div style={{ fontSize: "4px", color: C.muted, marginTop: "1px" }}>Conhecimento que transforma respostas em confiança.</div>
          </div>
          <div style={{ background: "rgba(201,160,96,0.1)", border: "1px solid rgba(201,160,96,0.2)", borderRadius: "6px", padding: "3px 6px", fontSize: "4px", color: C.gold }}>🖱️ Passe o mouse</div>
        </div>
        <div style={{ flex: 1, borderRadius: "10px", overflow: "hidden", background: "radial-gradient(ellipse at 50% 0%, #3d2a12 0%, #221608 35%, #150e05 70%, #0e0903 100%)", boxShadow: "inset 0 0 80px rgba(0,0,0,0.7)", border: "1.5px solid #2a1c0a", padding: "32px 16px 0", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "80px", background: "radial-gradient(ellipse at 50% 0%, rgba(201,160,96,0.18) 0%, transparent 100%)", pointerEvents: "none" }}/>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35, backgroundImage: "repeating-linear-gradient(90deg,rgba(0,0,0,0.1) 0px,transparent 1px,transparent 55px,rgba(0,0,0,0.07) 55px)" }}/>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "100%", paddingBottom: "18px" }}>
            {books.map((b, i) => {
              const isH = hov === i;
              const offsets = [0, -3, 2, -4, 1];
              return (
                <div key={b.title} style={{ flex: 1, height: `${200 + offsets[i]}px`, position: "relative", transform: isH ? "translateY(-24px) scale(1.04)" : "translateY(0)", transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)", filter: isH ? "drop-shadow(0 24px 36px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(201,160,96,0.3))" : "drop-shadow(0 10px 20px rgba(0,0,0,0.8))", cursor: "pointer" }}
                  onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
                  <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg,#04060a 0%,#080d18 6%,#0d1525 14%,#121d35 24%,#1a2645 34%,#1e2d52 44%,#1a2645 54%,#121d35 64%,#0d1525 76%,#080d18 88%,#04060a 100%)`, borderRadius: "4px 2px 2px 4px", border: isH ? "1px solid rgba(180,130,60,0.6)" : "1px solid rgba(201,160,96,0.14)", borderLeft: isH ? "1.5px solid rgba(201,150,50,0.7)" : "1.5px solid rgba(201,160,96,0.09)", position: "relative", overflow: "hidden", transition: "border 0.3s" }}>
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "28%", width: "44%", background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.03) 30%,rgba(255,255,255,0.055) 50%,rgba(255,255,255,0.03) 70%,transparent 100%)" }}/>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "18%", background: "linear-gradient(90deg,rgba(0,0,0,0.55),rgba(0,0,0,0.2),transparent)" }}/>
                    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "10%", background: "linear-gradient(270deg,rgba(0,0,0,0.4),transparent)" }}/>
                    <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "repeating-linear-gradient(180deg,transparent,transparent 5px,rgba(0,0,0,0.1) 5px,rgba(0,0,0,0.1) 6px)" }}/>
                    <div style={{ position: "absolute", inset: "6px 5px", border: "1px solid rgba(201,160,96,0.28)", borderRadius: "3px" }}/>
                    <div style={{ position: "absolute", inset: "9px 7px", border: "0.5px solid rgba(201,160,96,0.14)", borderRadius: "2px" }}/>
                    {[[true,false],[true,true],[false,false],[false,true]].map(([top, left], ci) => (
                      <div key={ci} style={{ position: "absolute", top: top ? "11px" : undefined, bottom: top ? undefined : "11px", left: !left ? "8px" : undefined, right: left ? "8px" : undefined, width: "7px", height: "7px", borderTop: top ? "1px solid rgba(201,160,96,0.45)" : undefined, borderBottom: !top ? "1px solid rgba(201,160,96,0.45)" : undefined, borderLeft: !left ? "1px solid rgba(201,160,96,0.45)" : undefined, borderRight: left ? "1px solid rgba(201,160,96,0.45)" : undefined }}/>
                    ))}
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "14px 4px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "4px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(201,160,96,0.7)", fontWeight: 700 }}>Capítulo</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif", textShadow: "0 0 12px rgba(201,160,96,0.5)", lineHeight: 1.1 }}>{b.num}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", width: "80%" }}>
                        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,160,96,0.6))" }}/>
                        <svg width="5" height="5" viewBox="0 0 6 6"><path d="M3 0 L6 3 L3 6 L0 3 Z" fill="rgba(201,160,96,0.8)"/></svg>
                        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(201,160,96,0.6),transparent)" }}/>
                      </div>
                      <div style={{ fontSize: "16px", filter: isH ? "drop-shadow(0 0 6px rgba(201,160,96,0.7))" : "none", transition: "filter 0.3s" }}>{b.icon}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", width: "80%" }}>
                        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,160,96,0.6))" }}/>
                        <svg width="5" height="5" viewBox="0 0 6 6"><path d="M3 0 L6 3 L3 6 L0 3 Z" fill="rgba(201,160,96,0.8)"/></svg>
                        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(201,160,96,0.6),transparent)" }}/>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "6px", fontWeight: 700, color: isH ? "#D4B070" : C.gold, fontFamily: "Georgia,serif", transition: "color 0.3s" }}>{b.title}</div>
                        <div style={{ fontSize: "3.5px", color: "rgba(201,160,96,0.5)", marginTop: "2px" }}>respostas prontas</div>
                      </div>
                      <div style={{ opacity: isH ? 0.3 : 0.15, transition: "opacity 0.3s" }}>
                        <svg width="10" height="13" viewBox="0 0 80 96" fill="none">
                          <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none"/>
                          <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none"/>
                          <line x1="40" y1="32" x2="40" y2="86" stroke="#C9A060" strokeWidth="7" strokeLinecap="round"/>
                          <circle cx="40" cy="27" r="10" fill="#C9A060"/>
                        </svg>
                      </div>
                    </div>
                    <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", width: "10px", height: isH ? "16px" : "0px", background: "linear-gradient(180deg,#C9A060,#8B6020)", clipPath: "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)", transition: "height 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", bottom: 0, left: "5px", right: "5px", height: "12px", background: "linear-gradient(180deg,#8B5E2A,#4A2E08)", boxShadow: "0 4px 16px rgba(0,0,0,0.7)", borderRadius: "1px" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Phone content ────────────────────────────────────────────────────────────
function PhoneContent({ screenIdx }: { screenIdx: number }) {
  const screens = [
    <div key="d" style={{ padding: "7px", display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ fontSize: "7px", fontWeight: 700, color: C.champ, fontFamily: "Georgia,serif" }}>Boa tarde ✦</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        {[{l:"Respostas",v:"12",c:"#FFF"},{l:"Score",v:"74%",c:C.gold},{l:"Quentes",v:"3",c:C.orange},{l:"Follow-up",v:"8",c:C.blue}].map(k=>(
          <div key={k.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"5px",padding:"5px"}}>
            <div style={{fontSize:"4px",color:C.muted}}>{k.l}</div>
            <div style={{fontSize:"11px",fontWeight:800,color:k.c,fontFamily:"Georgia,serif"}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"5px",padding:"5px"}}>
        <div style={{fontSize:"4px",color:C.muted,marginBottom:"3px"}}>Respostas / semana</div>
        <svg width="100%" height="36" viewBox="0 0 120 36" preserveAspectRatio="none">
          <defs><linearGradient id="pm2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9A060" stopOpacity="0.35"/><stop offset="100%" stopColor="#C9A060" stopOpacity="0"/></linearGradient></defs>
          <path d="M0,30 L17,22 L34,26 L51,10 L68,16 L85,12 L102,18 L120,14 L120,36 L0,36Z" fill="url(#pm2)"/>
          <path d="M0,30 L17,22 L34,26 L51,10 L68,16 L85,12 L102,18 L120,14" fill="none" stroke="#C9A060" strokeWidth="1.2"/>
        </svg>
      </div>
      <div style={{background:`linear-gradient(135deg,${C.card},${C.cardAlt})`,border:"1px solid rgba(201,160,96,0.3)",borderRadius:"5px",padding:"5px 6px",display:"flex",alignItems:"center",gap:"5px"}}>
        <span style={{fontSize:"11px"}}>🧠</span>
        <div><div style={{fontSize:"5.5px",fontWeight:700,color:"#FFF"}}>Lead Intelligence</div><div style={{fontSize:"4px",color:"#8aacc8"}}>Score e perfil →</div></div>
      </div>
    </div>,
    <div key="g" style={{ padding: "7px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{fontSize:"7px",fontWeight:700,color:C.champ,fontFamily:"Georgia,serif"}}>Gerador</div>
      <div style={{background:C.card,border:"1px solid rgba(201,160,96,0.25)",borderRadius:"5px",padding:"5px",fontSize:"5px",color:"rgba(255,255,255,0.65)",lineHeight:1.6}}>&ldquo;Quanto custa o botox? Vi no Instagram ✨&rdquo;</div>
      {[{l:"Suave 🌸",c:C.blue,t:"Oi! Que bom que nos encontrou..."},{l:"Consultiva 💎",c:C.gold,t:"Antes de falar em valor, me conta..."},{l:"Fechamento 🎯",c:C.green,t:"Tenho horário essa semana — quando?"}].map(r=>(
        <div key={r.l} style={{background:C.card,borderLeft:`2px solid ${r.c}`,borderRadius:"4px",padding:"4px 5px"}}>
          <div style={{fontSize:"5px",fontWeight:700,color:r.c,marginBottom:"2px"}}>{r.l}</div>
          <div style={{fontSize:"4px",color:"rgba(255,255,255,0.55)"}}>{r.t}</div>
        </div>
      ))}
    </div>,
    <div key="li" style={{ padding: "7px", display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
        <span style={{fontSize:"6px",fontWeight:700,color:C.champ,fontFamily:"Georgia,serif",flex:1}}>Lead Intel.</span>
        <span style={{fontSize:"4px",background:"rgba(201,160,96,0.15)",color:C.gold,borderRadius:"9999px",padding:"1px 4px",border:"1px solid rgba(201,160,96,0.3)"}}>PRO</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
        <svg width="56" height="56" viewBox="0 0 100 100" style={{flexShrink:0}}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke={C.orange} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${0.78*2*Math.PI*44} ${2*Math.PI*44}`} strokeDashoffset="0" transform="rotate(-90 50 50)" style={{filter:`drop-shadow(0 0 4px ${C.orange}80)`}}/>
          <text x="50" y="44" textAnchor="middle" fill="#FFF" fontSize="22" fontWeight="800" fontFamily="serif">78</text>
          <text x="50" y="60" textAnchor="middle" fill={C.orange} fontSize="9" fontWeight="600">SCORE</text>
        </svg>
        <div>
          <div style={{fontSize:"5.5px",fontWeight:700,color:C.orange,marginBottom:"3px"}}>🔥 Lead Quente</div>
          <div style={{fontSize:"4px",color:"#8aacc8",lineHeight:1.6}}>Alta intenção de compra.</div>
        </div>
      </div>
      {[{l:"Urgência",v:85},{l:"Intenção",v:76},{l:"Confiança",v:65},{l:"Receptividade",v:90}].map(a=>(
        <div key={a.l} style={{display:"flex",alignItems:"center",gap:"4px"}}>
          <span style={{fontSize:"4px",color:C.muted,width:"44px",flexShrink:0}}>{a.l}</span>
          <div style={{flex:1,height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
            <div style={{width:`${a.v}%`,height:"100%",background:"linear-gradient(90deg,#C9A060,#d4b47a)"}}/>
          </div>
          <span style={{fontSize:"4px",color:C.gold,width:"14px",textAlign:"right"}}>{a.v}</span>
        </div>
      ))}
    </div>,
    <div key="ob" style={{ padding: "7px", display: "flex", flexDirection: "column", gap: "5px", height: "100%" }}>
      <div style={{fontSize:"7px",fontWeight:700,color:C.champ,fontFamily:"Georgia,serif"}}>Objeções</div>
      <div style={{flex:1,background:"radial-gradient(ellipse at 50% 0%,#3d2a12,#0e0903)",borderRadius:"7px",padding:"12px 7px 0",position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end",overflow:"hidden",minHeight:"90px"}}>
        <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:"50px",background:"radial-gradient(ellipse at 50% 0%,rgba(201,160,96,0.15),transparent)",pointerEvents:"none"}}/>
        <div style={{display:"flex",gap:"3px",alignItems:"flex-end",paddingBottom:"15px"}}>
          {[{t:"Preço",h:72},{t:"Medo",h:76},{t:"Confiança",h:70},{t:"Agenda.",h:74},{t:"Pós",h:71}].map((b,i)=>(
            <div key={b.t} style={{flex:1,height:`${b.h}px`,background:`linear-gradient(90deg,#04060a 0%,#0d1525 20%,#1e2d52 50%,#0d1525 80%,#04060a 100%)`,border:"1px solid rgba(201,160,96,0.12)",borderLeft:"1.5px solid rgba(201,160,96,0.08)",borderRadius:"3px 2px 2px 3px",boxShadow:"2px 0 6px rgba(0,0,0,0.6)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"8px 2px 5px"}}>
              <div style={{position:"absolute",top:0,bottom:0,left:"25%",width:"50%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)"}}/>
              <div style={{position:"absolute",inset:"4px 3px",border:"1px solid rgba(201,160,96,0.22)",borderRadius:"2px"}}/>
              <div style={{fontSize:"6px",fontWeight:700,color:C.gold,fontFamily:"Georgia,serif"}}>{String(i+1).padStart(2,"0")}</div>
              <span style={{fontSize:"3.5px",color:"rgba(201,160,96,0.65)",writingMode:"vertical-rl",transform:"rotate(180deg)",fontWeight:600}}>{b.t}</span>
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:0,left:"4px",right:"4px",height:"9px",background:"linear-gradient(180deg,#8B5E2A,#4A2E08)",boxShadow:"0 3px 10px rgba(0,0,0,0.7)"}}/>
      </div>
    </div>,
  ];
  return <>{screens[screenIdx]}</>;
}

// ─── SCREENS config ───────────────────────────────────────────────────────────
const SCREENS = [
  { id: "dashboard",    label: "Dashboard" },
  { id: "gerador",      label: "Gerador" },
  { id: "intelligence", label: "Lead Intel" },
  { id: "objecoes",     label: "Objeções" },
];

// Natural dimensions of the device assembly (base scale = 1)
const NAT_W = 650;  // laptop 580 + phone overlap ~70px
const NAT_H = 460;  // tabs 50 + gap 10 + laptop 390 + bottom gap 10

// ─── Main: fills its parent absolutely, scales via ResizeObserver ──────────────
export function HeroDevices() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [screenVisible, setScreenVisible] = useState(true);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Cycle screens
  useEffect(() => {
    const interval = setInterval(() => {
      setScreenVisible(false);
      setTimeout(() => { setActive(prev => (prev + 1) % SCREENS.length); setScreenVisible(true); }, 380);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Scale to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const sx = (width - 16) / NAT_W;
      const sy = (height - 16) / NAT_H;
      // cap at 0.78 so devices stay smaller than natural size
      setScale(Math.min(sx, sy, 0.78));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const switchTo = (i: number) => {
    if (i === active) return;
    setScreenVisible(false);
    setTimeout(() => { setActive(i); setScreenVisible(true); }, 320);
  };

  const laptopEnter: React.CSSProperties = {
    transition: "opacity 1s ease 0.1s, transform 1s cubic-bezier(0.34,1.2,0.64,1) 0.1s",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(50px)",
  };
  const phoneEnter: React.CSSProperties = {
    transition: "opacity 1s ease 0.45s, transform 1s cubic-bezier(0.34,1.3,0.64,1) 0.45s",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) rotate(4deg)" : "translateY(80px) rotate(4deg)",
  };
  const screenFade: React.CSSProperties = {
    transition: "opacity 0.38s ease, transform 0.38s ease",
    opacity: screenVisible ? 1 : 0,
    transform: screenVisible ? "translateY(0)" : "translateY(6px)",
    height: "100%",
  };

  const LaptopScreen =
    active === 0 ? ScreenDashboard
    : active === 1 ? ScreenGerador
    : active === 2 ? ScreenLeadIntelligence
    : ScreenObjecoes;

  return (
    // Outer: fills parent absolutely, anchored to top
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "28px",
        overflow: "hidden",
      }}
    >
      {/* Everything inside is scaled, anchored at top-center */}
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        width: `${NAT_W}px`,
        height: `${NAT_H}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "10px",
      }}>

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: "7px", paddingLeft: "8px" }}>
          {SCREENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchTo(i)}
              style={{
                background: i === active ? C.gold : "rgba(255,255,255,0.07)",
                border: i === active ? "none" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: "9999px",
                padding: "5px 16px",
                fontSize: "12px",
                fontWeight: 600,
                color: i === active ? C.bg : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Device assembly */}
        <div style={{ position: "relative", width: "100%", flex: 1 }}>

          {/* ── LAPTOP ── */}
          <div style={{ ...laptopEnter, position: "absolute", top: 0, left: 0 }}>
            {/* Screen lid */}
            <div style={{
              width: "580px", height: "362px",
              background: "#060d1a",
              borderRadius: "12px 12px 0 0",
              border: "2.5px solid #162030", borderBottom: "none",
              position: "relative", overflow: "hidden",
              boxShadow: "0 -4px 50px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,160,96,0.05), inset 0 0 40px rgba(0,0,0,0.4)",
            }}>
              <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "5px", height: "5px", borderRadius: "50%", background: "#0b1422", zIndex: 2 }}/>
              <div style={{ position: "absolute", inset: "16px 14px 10px", background: C.bg, borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ height: "18px", background: "#030810", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", paddingLeft: "10px", paddingRight: "10px", gap: "5px" }}>
                  {["#ef4444","#f59e0b","#22c55e"].map((c, i) => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c }}/>)}
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px", width: "120px", height: "6px" }}/>
                  </div>
                </div>
                <div style={{ height: "calc(100% - 18px)", ...screenFade }}>
                  <LaptopScreen/>
                </div>
              </div>
            </div>
            {/* Hinge */}
            <div style={{ width: "580px", height: "4px", background: "linear-gradient(180deg,#1e2f45,#111e2d)", position: "relative" }}>
              <div style={{ position: "absolute", top: "1px", left: "50%", transform: "translateX(-50%)", width: "90px", height: "1px", background: "rgba(201,160,96,0.12)" }}/>
            </div>
            {/* Base */}
            <div style={{ width: "580px", height: "18px", background: "linear-gradient(180deg,#111e2d,#0a1520)", borderRadius: "0 0 8px 8px", border: "2px solid #162030", borderTop: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "90px", height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px" }}/>
            </div>
            {/* Stand shadow */}
            <div style={{ width: "500px", margin: "0 auto", height: "6px", background: "linear-gradient(180deg,#0a1520,transparent)", borderRadius: "0 0 40px 40px" }}/>
          </div>

          {/* ── PHONE ── */}
          <div style={{ ...phoneEnter, position: "absolute", right: "0px", bottom: "25px", zIndex: 20 }}>
            <div style={{ width: "162px", height: "310px", background: "#060d1a", borderRadius: "26px", border: "2.5px solid #162030", position: "relative", overflow: "hidden", boxShadow: "8px 14px 50px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,160,96,0.07)" }}>
              <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", width: "40px", height: "9px", background: "#060d1a", borderRadius: "9999px", zIndex: 3, border: "1px solid #162030" }}/>
              <div style={{ position: "absolute", inset: "2px", background: C.bg, borderRadius: "24px", overflow: "hidden" }}>
                <div style={{ height: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 12px 4px" }}>
                  <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>9:41</span>
                  <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.45)" }}>●●● 🔋</span>
                </div>
                <div style={{ height: "calc(100% - 24px)", ...screenFade }}>
                  <PhoneContent screenIdx={active}/>
                </div>
              </div>
            </div>
            <div style={{ width: "50px", height: "4px", background: "rgba(255,255,255,0.12)", borderRadius: "2px", margin: "6px auto 0" }}/>
          </div>

        </div>
      </div>
    </div>
  );
}
