"use client";

import { useEffect, useState } from "react";

// ─── Mini screen content ────────────────────────────────────────────────────────

function ScreenDashboard() {
  return (
    <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
        <div style={{ fontSize: "7px", fontWeight: 700, color: "#C9A060" }}>Dashboard</div>
        <div style={{ display: "flex", gap: "3px" }}>
          {[1,2,3].map(i => <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: i===1?"#C9A060":"rgba(255,255,255,0.2)" }} />)}
        </div>
      </div>
      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
        {[
          { label: "Respostas", value: "47", color: "#C9A060" },
          { label: "Conversões", value: "73%", color: "#4ade80" },
          { label: "Score Médio", value: "81", color: "#60a5fa" },
        ].map(k => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "5px", padding: "5px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "5px", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>{k.label}</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.06)", padding: "6px", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: "5px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Respostas geradas esta semana</div>
        <svg width="100%" height="50" viewBox="0 0 140 50" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gd1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A060" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#C9A060" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,42 C20,38 30,22 50,18 C70,14 80,28 100,22 C120,16 130,10 140,8 L140,50 L0,50 Z" fill="url(#gd1)"/>
          <path d="M0,42 C20,38 30,22 50,18 C70,14 80,28 100,22 C120,16 130,10 140,8" fill="none" stroke="#C9A060" strokeWidth="1.5"/>
        </svg>
      </div>
      {/* Recent activity */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {["Jade — Botox query", "Ana — Follow-up", "Maria — Agendou"].map((item, i) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "5px", color: "rgba(255,255,255,0.55)" }}>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: i===0?"#4ade80":"rgba(255,255,255,0.2)", flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenGerador() {
  return (
    <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ fontSize: "7px", fontWeight: 700, color: "#C9A060" }}>Gerador de Respostas</div>
      {/* Input bubble */}
      <div style={{ background: "rgba(201,160,96,0.08)", border: "1px solid rgba(201,160,96,0.2)", borderRadius: "6px", padding: "5px", fontSize: "5px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
        &ldquo;Olá! Quanto custa o botox? Vi no Instagram e fiquei curiosa&rdquo;
      </div>
      {/* Response cards */}
      {[
        { label: "Suave", color: "#60a5fa" },
        { label: "Consultiva", color: "#C9A060" },
        { label: "Fechamento", color: "#4ade80" },
      ].map((r, i) => (
        <div key={r.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${r.color}30`, borderLeft: `2px solid ${r.color}`, borderRadius: "4px", padding: "5px" }}>
          <div style={{ fontSize: "4.5px", fontWeight: 700, color: r.color, marginBottom: "2px" }}>{r.label}</div>
          <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
            {i===0 && "Oi! Que bom que nos encontrou ✨ O botox é personalizado..."}
            {i===1 && "Olá! Adorei que você entrou em contato. Antes de falar em valores..."}
            {i===2 && "Perfeita escolha! Tenho horário esta semana — o que funciona pra você?"}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenLeadIntelligence() {
  return (
    <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ fontSize: "7px", fontWeight: 700, color: "#C9A060" }}>Lead Intelligence <span style={{ fontSize: "4.5px", background: "rgba(201,160,96,0.15)", border: "1px solid rgba(201,160,96,0.3)", borderRadius: "9999px", padding: "1px 4px", color: "#C9A060" }}>PRO</span></div>
      {/* Score ring + number */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="22" cy="22" r="18" fill="none" stroke="#C9A060" strokeWidth="3"
              strokeDasharray="113" strokeDashoffset="31" strokeLinecap="round"
              transform="rotate(-90 22 22)"/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#C9A060" }}>78</span>
            <span style={{ fontSize: "3.5px", color: "rgba(255,255,255,0.4)" }}>Score</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "5px", color: "#fbbf24", fontWeight: 600, marginBottom: "2px" }}>🔥 Lead Quente</div>
          <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Alta intenção de compra. Abordagem direta recomendada.</div>
        </div>
      </div>
      {/* Radar bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {[
          { label: "Urgência", v: 82 },
          { label: "Intenção", v: 75 },
          { label: "Confiança", v: 65 },
          { label: "Receptividade", v: 88 },
        ].map(a => (
          <div key={a.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.5)", width: "38px", flexShrink: 0 }}>{a.label}</div>
            <div style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${a.v}%`, height: "100%", background: "linear-gradient(90deg,#C9A060,#d4b47a)", borderRadius: "2px" }} />
            </div>
            <div style={{ fontSize: "4px", color: "#C9A060", width: "14px", textAlign: "right" }}>{a.v}</div>
          </div>
        ))}
      </div>
      {/* Insight card */}
      <div style={{ background: "rgba(201,160,96,0.07)", border: "1px solid rgba(201,160,96,0.2)", borderRadius: "4px", padding: "5px" }}>
        <div style={{ fontSize: "4px", fontWeight: 700, color: "#C9A060", marginBottom: "2px" }}>💡 Gatilho recomendado</div>
        <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Ofereça 2 horários disponíveis e confirme em seguida.</div>
      </div>
    </div>
  );
}

function ScreenObjecoes() {
  const books = [
    { title: "Preço", top: -4 },
    { title: "Medo", top: -2 },
    { title: "Prazo", top: -6 },
    { title: "Confia", top: -3 },
    { title: "Já tem", top: -5 },
    { title: "Esposa", top: -2 },
  ];
  return (
    <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ fontSize: "7px", fontWeight: 700, color: "#C9A060" }}>Biblioteca de Objeções</div>
      <div style={{ fontSize: "5px", color: "rgba(255,255,255,0.45)" }}>Clique em uma objeção para ver a resposta estratégica</div>
      {/* Bookshelf */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "3px", background: "radial-gradient(ellipse at 50% 0%, #3d2a12, #0e0903)", borderRadius: "6px", padding: "12px 8px 4px", position: "relative" }}>
        {/* Shelf plank */}
        <div style={{ position: "absolute", bottom: "12px", left: "4px", right: "4px", height: "5px", background: "linear-gradient(180deg,#7a4a1a,#3d1f05)", borderRadius: "1px" }} />
        {books.map((b, i) => (
          <div
            key={b.title}
            style={{
              flex: 1,
              height: "46px",
              marginBottom: "17px",
              position: "relative",
              top: `${b.top}px`,
              borderRadius: "2px 2px 1px 1px",
              background: `linear-gradient(90deg, #04060a 0%, #080d18 12%, #121d35 28%, #1e2d52 50%, #121d35 72%, #080d18 88%, #04060a 100%)`,
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "2px 0 6px rgba(0,0,0,0.5)",
            }}
          >
            <span style={{ fontSize: "3.5px", color: "rgba(201,160,96,0.7)", writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: 600, letterSpacing: "0.05em" }}>{b.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

const SCREENS = [
  { id: "dashboard", label: "Dashboard", component: ScreenDashboard },
  { id: "gerador", label: "Gerador", component: ScreenGerador },
  { id: "intelligence", label: "Lead Intelligence", component: ScreenLeadIntelligence },
  { id: "objecoes", label: "Objeções", component: ScreenObjecoes },
];

export function HeroDevices() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [screenVisible, setScreenVisible] = useState(true);

  useEffect(() => {
    // Entrance animation
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Cycle screens
    const interval = setInterval(() => {
      setScreenVisible(false);
      setTimeout(() => {
        setActive(prev => (prev + 1) % SCREENS.length);
        setScreenVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const Screen = SCREENS[active].component;

  const transitionStyle: React.CSSProperties = {
    transition: "opacity 0.35s ease, transform 0.35s ease",
    opacity: screenVisible ? 1 : 0,
    transform: screenVisible ? "translateY(0)" : "translateY(6px)",
  };

  const laptopStyle: React.CSSProperties = {
    transition: "opacity 0.9s ease 0.2s, transform 0.9s cubic-bezier(0.34,1.3,0.64,1) 0.2s",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) rotate(-2deg)" : "translateY(60px) rotate(-2deg)",
  };

  const phoneStyle: React.CSSProperties = {
    transition: "opacity 0.9s ease 0.55s, transform 0.9s cubic-bezier(0.34,1.3,0.64,1) 0.55s",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) rotate(3deg)" : "translateY(80px) rotate(3deg)",
  };

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "0px", paddingTop: "20px" }}>

      {/* Screen tab indicators */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
          zIndex: 20,
        }}
      >
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setScreenVisible(false);
              setTimeout(() => { setActive(i); setScreenVisible(true); }, 300);
            }}
            style={{
              background: i === active ? "#C9A060" : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "9999px",
              padding: "3px 8px",
              fontSize: "9px",
              fontWeight: 600,
              color: i === active ? "#07101e" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Laptop ── */}
      <div style={{ ...laptopStyle, position: "relative", zIndex: 10, marginRight: "-32px" }}>
        {/* Screen lid */}
        <div style={{
          width: "280px",
          height: "180px",
          background: "#0a1220",
          borderRadius: "8px 8px 0 0",
          border: "2px solid #1a2840",
          borderBottom: "none",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,160,96,0.08)",
        }}>
          {/* Camera dot */}
          <div style={{ position: "absolute", top: "5px", left: "50%", transform: "translateX(-50%)", width: "3px", height: "3px", borderRadius: "50%", background: "#1a2840" }} />
          {/* Bezel */}
          <div style={{ position: "absolute", inset: "10px", background: "#07101e", borderRadius: "4px", overflow: "hidden" }}>
            {/* Top bar sim */}
            <div style={{ height: "14px", background: "#0b1424", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 6px", gap: "4px" }}>
              <div style={{ width: "28px", height: "6px", background: "rgba(201,160,96,0.25)", borderRadius: "2px" }} />
              <div style={{ flex: 1 }} />
              {[1,2,3].map(i => <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: i===1?"#ef4444":i===2?"#f59e0b":"#22c55e" }} />)}
            </div>
            {/* Sidebar sim */}
            <div style={{ display: "flex", height: "calc(100% - 14px)" }}>
              <div style={{ width: "32px", background: "#0b1424", borderRight: "1px solid rgba(255,255,255,0.04)", padding: "4px 4px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(201,160,96,0.3)", marginBottom: "4px" }} />
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: "14px", height: "4px", borderRadius: "2px", background: i===1?"rgba(201,160,96,0.5)":"rgba(255,255,255,0.07)" }} />
                ))}
              </div>
              {/* Content area */}
              <div style={{ flex: 1, overflow: "hidden", ...transitionStyle }}>
                <Screen />
              </div>
            </div>
          </div>
        </div>
        {/* Base / keyboard */}
        <div style={{
          width: "280px",
          height: "10px",
          background: "linear-gradient(180deg, #1a2840 0%, #0f1b2f 100%)",
          borderRadius: "0 0 4px 4px",
          border: "2px solid #1a2840",
          borderTop: "1px solid #253550",
          position: "relative",
        }}>
          <div style={{ position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)", width: "60px", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
        </div>
        {/* Stand */}
        <div style={{
          width: "280px",
          height: "4px",
          background: "linear-gradient(180deg, #0f1b2f 0%, #07101e 100%)",
          borderRadius: "0 0 20px 20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }} />
      </div>

      {/* ── Phone ── */}
      <div style={{ ...phoneStyle, position: "relative", zIndex: 20, marginBottom: "14px" }}>
        <div style={{
          width: "90px",
          height: "170px",
          background: "#0a1220",
          borderRadius: "14px",
          border: "2px solid #1a2840",
          position: "relative",
          overflow: "hidden",
          boxShadow: "4px 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,160,96,0.1)",
        }}>
          {/* Notch */}
          <div style={{ position: "absolute", top: "5px", left: "50%", transform: "translateX(-50%)", width: "22px", height: "5px", background: "#0a1220", borderRadius: "9999px", zIndex: 2, border: "1px solid #1a2840" }} />
          {/* Screen */}
          <div style={{ position: "absolute", inset: "2px", background: "#07101e", borderRadius: "12px", overflow: "hidden" }}>
            {/* Status bar */}
            <div style={{ height: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
              <span style={{ fontSize: "5px", color: "rgba(255,255,255,0.5)" }}>9:41</span>
              <span style={{ fontSize: "5px", color: "rgba(255,255,255,0.5)" }}>●●●</span>
            </div>
            {/* Mobile content — phone shows a simpler view */}
            <div style={{ padding: "4px 6px", ...transitionStyle }}>
              <div style={{ fontSize: "6px", fontWeight: 700, color: "#C9A060", marginBottom: "4px" }}>{SCREENS[active].label}</div>
              {/* Mini cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px", padding: "4px 5px", border: "1px solid rgba(201,160,96,0.15)" }}>
                  <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.4)", marginBottom: "1px" }}>Resposta gerada</div>
                  <div style={{ fontSize: "5px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>Olá! Que ótimo que entrou em contato ✨</div>
                </div>
                <div style={{ background: "rgba(201,160,96,0.07)", borderRadius: "4px", padding: "4px 5px", border: "1px solid rgba(201,160,96,0.2)" }}>
                  <div style={{ fontSize: "4.5px", color: "#C9A060", fontWeight: 600 }}>Score do lead: 78/100</div>
                  <div style={{ width: "100%", height: "2px", background: "rgba(255,255,255,0.08)", borderRadius: "1px", marginTop: "2px" }}>
                    <div style={{ width: "78%", height: "100%", background: "#C9A060", borderRadius: "1px" }} />
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "4px", padding: "4px 5px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>Histórico</div>
                  {["Ana · Botox", "Maria · Follow-up", "Jade · Script"].map(item => (
                    <div key={item} style={{ fontSize: "4px", color: "rgba(255,255,255,0.5)", padding: "1px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Home indicator */}
        <div style={{ width: "28px", height: "3px", background: "rgba(255,255,255,0.15)", borderRadius: "2px", margin: "4px auto 0" }} />
      </div>

      {/* Ground shadow */}
      <div style={{
        position: "absolute",
        bottom: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "320px",
        height: "20px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.5) 0%, transparent 80%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}
