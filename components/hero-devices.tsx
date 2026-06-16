"use client";

import { useEffect, useState } from "react";

// ─── Sidebar mini ───────────────────────────────────────────────────────────────
function MiniSidebar({ activeIdx = 0 }: { activeIdx?: number }) {
  const navItems = [
    { label: "Início",            dot: "#C9A060" },
    { label: "Gerador",           dot: null },
    { label: "Lead Intelligence", dot: null, pro: true },
    { label: "Objeções",          dot: null },
    { label: "Follow-up",         dot: null },
    { label: "Scripts",           dot: null },
    { label: "Histórico",         dot: null },
  ];
  return (
    <div style={{
      width: "58px",
      flexShrink: 0,
      background: "#0b1424",
      borderRight: "1px solid rgba(255,255,255,0.04)",
      display: "flex",
      flexDirection: "column",
      padding: "8px 5px",
      gap: "2px",
      height: "100%",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 3px 8px", borderBottom: "1px solid rgba(201,160,96,0.15)", marginBottom: "4px" }}>
        <svg width="10" height="12" viewBox="0 0 80 96" fill="none">
          <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <line x1="40" y1="32" x2="40" y2="86" stroke="#C9A060" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="40" cy="27" r="10" fill="#C9A060"/>
        </svg>
        <span style={{ fontSize: "5px", fontWeight: 700, color: "#D4C4A0", whiteSpace: "nowrap", overflow: "hidden" }}>Lead<span style={{ color: "#C9A060" }}>Bellus</span></span>
      </div>

      {navItems.map((item, i) => (
        <div key={item.label} style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 4px",
          borderRadius: "4px",
          background: i === activeIdx ? "rgba(255,255,255,0.05)" : "transparent",
          borderLeft: i === activeIdx ? "1.5px solid #C9A060" : "1.5px solid transparent",
        }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "1px", background: i === activeIdx ? "#C9A060" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
          <span style={{ fontSize: "4px", color: i === activeIdx ? "#C9A060" : "rgba(255,255,255,0.45)", fontWeight: i === activeIdx ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>
            {item.label}
          </span>
          {item.pro && (
            <span style={{ fontSize: "3px", background: "rgba(201,160,96,0.15)", border: "1px solid rgba(201,160,96,0.3)", color: "#C9A060", borderRadius: "9999px", padding: "0 2px", lineHeight: "6px", flexShrink: 0 }}>PRO</span>
          )}
        </div>
      ))}

      {/* Divider + logout */}
      <div style={{ flex: 1 }} />
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,160,96,0.3), transparent)", margin: "4px 2px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "3px 4px" }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "1px", background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "4px", color: "rgba(255,255,255,0.3)" }}>Sair</span>
      </div>
    </div>
  );
}

// ─── SCREEN 1: Dashboard ────────────────────────────────────────────────────────
function ScreenDashboard() {
  const weekData = [4, 7, 5, 9, 12, 8, 3];
  const maxV = 12;
  const pts = weekData.map((v, i) => {
    const x = 8 + i * (100 / 6);
    const y = 56 - (v / maxV) * 46;
    return `${x},${y}`;
  }).join(" ");
  const areaPath = `M 8,56 L ${weekData.map((v, i) => `${8 + i * (100/6)},${56 - (v/maxV)*46}`).join(" L ")} L ${8+6*(100/6)},56 Z`;

  const leads = [
    { name: "Quentes", v: 3, color: "#F97316", pct: 14 },
    { name: "Mornos",  v: 7, color: "#C9A060", pct: 32 },
    { name: "Frias",  v: 12, color: "#6B8CAE", pct: 54 },
  ];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={0} />
      <div style={{ flex: 1, background: "#07101e", padding: "8px", display: "flex", flexDirection: "column", gap: "5px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "4px", color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.08em" }}>Seg, 16 de junho</div>
            <div style={{ fontSize: "7px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Boa tarde, Clínica ✦</div>
            <div style={{ fontSize: "4px", color: "#5a7a9a" }}>Pronta para converter mais hoje?</div>
          </div>
          <div style={{ background: "#C9A060", borderRadius: "6px", padding: "3px 6px", fontSize: "4.5px", fontWeight: 700, color: "#07101e" }}>✦ Gerar resposta</div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px" }}>
          {[
            { label: "Respostas hoje", value: "12", sub: "+3 vs ontem",   icon: "⚡", color: "#C9A060" },
            { label: "Score médio",   value: "74%", sub: "esta semana",   icon: "📈", color: "#C9A060", pro: true },
            { label: "Leads quentes", value: "3",   sub: "responda agora",icon: "🔥", color: "#F97316" },
            { label: "Follow-ups",    value: "8",   sub: "esta semana",   icon: "↗", color: "#60a5fa" },
          ].map((k) => (
            <div key={k.label} style={{
              background: "#0f1b2f",
              border: k.pro ? "1px solid rgba(201,160,96,0.4)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: "5px",
              padding: "5px",
              boxShadow: k.pro ? "0 0 8px rgba(201,160,96,0.1)" : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ fontSize: "3.5px", color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</span>
                <span style={{ fontSize: "6px" }}>{k.icon}</span>
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: k.pro ? "#C9A060" : "#FFFFFF", fontFamily: "Georgia, serif" }}>{k.value}</div>
              <div style={{ fontSize: "3px", color: "#5a7a9a", marginTop: "1px" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Lead Intelligence featured card */}
        <div style={{
          background: "linear-gradient(135deg, #0f1b2f 0%, #131f35 60%, #0d1a2e 100%)",
          border: "1px solid rgba(201,160,96,0.3)",
          borderRadius: "5px",
          padding: "5px 6px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", borderRadius: "50%", border: "1px solid rgba(201,160,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8px" }}>🧠</span>
          </div>
          <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: "rgba(201,160,96,0.15)", border: "1px solid rgba(201,160,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "7px" }}>🧠</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "1px" }}>
              <span style={{ fontSize: "5.5px", fontWeight: 700, color: "#FFFFFF", fontFamily: "Georgia, serif" }}>Lead Intelligence</span>
              <span style={{ fontSize: "3px", background: "rgba(201,160,96,0.2)", border: "1px solid rgba(201,160,96,0.35)", color: "#C9A060", borderRadius: "9999px", padding: "0 2px", lineHeight: "6px" }}>PRO</span>
            </div>
            <span style={{ fontSize: "3.5px", color: "#8aacc8" }}>Score de conversão, perfil psicológico e estratégia para fechar o lead</span>
          </div>
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "4px", flex: 1, minHeight: 0 }}>
          {/* Area chart */}
          <div style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "5px", padding: "5px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
              <div>
                <div style={{ fontSize: "3.5px", color: "#5a7a9a", textTransform: "uppercase" }}>Esta semana</div>
                <div style={{ fontSize: "5px", fontWeight: 600, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Respostas geradas</div>
              </div>
              <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "9999px", padding: "1px 4px", fontSize: "3.5px", color: "#4ade80", fontWeight: 600 }}>↑ +24%</div>
            </div>
            <svg width="100%" height="52" viewBox="0 0 120 56" preserveAspectRatio="none" style={{ flex: 1 }}>
              <defs>
                <linearGradient id="hd-gold-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A060" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#C9A060" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[14, 28, 42, 56].map(y => <line key={y} x1="0" y1={y} x2="120" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>)}
              {/* Area fill */}
              <path d={areaPath} fill="url(#hd-gold-area)"/>
              {/* Line */}
              <polyline points={pts} fill="none" stroke="#C9A060" strokeWidth="1.5" strokeLinejoin="round"/>
              {/* Dots */}
              {weekData.map((v, i) => (
                <circle key={i} cx={8 + i*(100/6)} cy={56-(v/maxV)*46} r="2" fill="#C9A060"/>
              ))}
              {/* X axis labels */}
              {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d, i) => (
                <text key={d} x={8+i*(100/6)} y="56" textAnchor="middle" fill="#5a7a9a" fontSize="3.5">{d}</text>
              ))}
            </svg>
          </div>

          {/* Donut chart */}
          <div style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "5px", padding: "5px" }}>
            <div style={{ fontSize: "3.5px", color: "#5a7a9a", textTransform: "uppercase", marginBottom: "1px" }}>Temperatura</div>
            <div style={{ fontSize: "5px", fontWeight: 600, color: "#D4C4A0", fontFamily: "Georgia, serif", marginBottom: "4px" }}>Seus leads</div>
            {/* SVG donut */}
            <svg width="100%" height="44" viewBox="0 0 60 60" style={{ display: "block", margin: "0 auto" }}>
              {/* Background track */}
              <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
              {/* Quentes: 14% = 51.3deg */}
              <circle cx="30" cy="30" r="22" fill="none" stroke="#F97316" strokeWidth="7"
                strokeDasharray={`${0.14 * 138.2} ${138.2}`} strokeDashoffset="0" transform="rotate(-90 30 30)" strokeLinecap="butt"/>
              {/* Mornos: 32% = 115.2deg, offset -14% */}
              <circle cx="30" cy="30" r="22" fill="none" stroke="#C9A060" strokeWidth="7"
                strokeDasharray={`${0.32 * 138.2} ${138.2}`} strokeDashoffset={`${-0.14 * 138.2}`} transform="rotate(-90 30 30)" strokeLinecap="butt"/>
              {/* Frias: 54% */}
              <circle cx="30" cy="30" r="22" fill="none" stroke="#6B8CAE" strokeWidth="7"
                strokeDasharray={`${0.54 * 138.2} ${138.2}`} strokeDashoffset={`${-(0.14+0.32) * 138.2}`} transform="rotate(-90 30 30)" strokeLinecap="butt"/>
              <text x="30" y="33" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="serif">22</text>
            </svg>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "3px" }}>
              {leads.map(l => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "3.5px", color: "#5a7a9a" }}>{l.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <span style={{ fontSize: "3.5px", fontWeight: 600, color: "#D4C4A0" }}>{l.v}</span>
                    <span style={{ fontSize: "3px", color: "#5a7a9a" }}>{l.pct}%</span>
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

// ─── SCREEN 2: Gerador ─────────────────────────────────────────────────────────
function ScreenGerador() {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={1} />
      <div style={{ flex: 1, background: "#07101e", padding: "8px", display: "flex", flexDirection: "column", gap: "5px", overflow: "hidden" }}>
        <div>
          <div style={{ fontSize: "4px", color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>IA para vendas de estética</div>
          <div style={{ fontSize: "8px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Gerador de Respostas</div>
        </div>

        {/* Input area */}
        <div style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "5px", padding: "6px" }}>
          <div style={{ fontSize: "4px", color: "#5a7a9a", marginBottom: "3px" }}>Mensagem da cliente</div>
          <div style={{ background: "#07101e", border: "1px solid rgba(201,160,96,0.3)", borderRadius: "4px", padding: "4px 5px", fontSize: "4.5px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, minHeight: "18px" }}>
            Olá! Quanto custa o botox? Vi no Instagram e fiquei curiosa ✨
          </div>
          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
            <div style={{ flex: 1, background: "#0b1424", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", padding: "3px 5px", fontSize: "3.5px", color: "#5a7a9a" }}>Tom: Consultivo</div>
            <div style={{ background: "#C9A060", borderRadius: "4px", padding: "3px 8px", fontSize: "4px", fontWeight: 700, color: "#07101e" }}>✦ Gerar</div>
          </div>
        </div>

        {/* Response cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {[
            { label: "Suave",       color: "#60a5fa", emoji: "🌸", text: "Oi! Que bom que você nos encontrou ✨ O botox é um procedimento muito seguro e os resultados são incríveis..." },
            { label: "Consultiva", color: "#C9A060", emoji: "💎", text: "Olá! Adorei que você entrou em contato. Antes de falar em investimento, deixa eu entender melhor o que você busca..." },
            { label: "Fechamento", color: "#4ade80", emoji: "🎯", text: "Perfeita escolha! Tenho horário disponível ainda essa semana. O que funciona melhor pra você — manhã ou tarde?" },
          ].map((r) => (
            <div key={r.label} style={{
              background: "#0f1b2f",
              border: `1px solid ${r.color}25`,
              borderLeft: `2px solid ${r.color}`,
              borderRadius: "4px",
              padding: "5px 6px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <span style={{ fontSize: "6px" }}>{r.emoji}</span>
                  <span style={{ fontSize: "4.5px", fontWeight: 700, color: r.color }}>{r.label}</span>
                </div>
                <div style={{ background: `${r.color}18`, border: `1px solid ${r.color}35`, borderRadius: "9999px", padding: "1px 5px", fontSize: "3.5px", color: r.color }}>Copiar</div>
              </div>
              <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 3: Lead Intelligence ───────────────────────────────────────────────
function ScreenLeadIntelligence() {
  const circ = 2 * Math.PI * 42;
  const score = 78;
  const offset = circ - (score / 100) * circ;
  const color = "#F97316"; // quente

  const axes = [
    { label: "Urgência",     v: 82 },
    { label: "Intenção",     v: 75 },
    { label: "Confiança",    v: 65 },
    { label: "Receptividade",v: 88 },
    { label: "Maturidade",   v: 71 },
  ];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={2} />
      <div style={{ flex: 1, background: "#07101e", padding: "8px", display: "flex", flexDirection: "column", gap: "5px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ fontSize: "8px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif", flex: 1 }}>Lead Intelligence</div>
          <span style={{ fontSize: "3px", background: "rgba(201,160,96,0.15)", border: "1px solid rgba(201,160,96,0.3)", color: "#C9A060", borderRadius: "9999px", padding: "1px 4px" }}>PRO</span>
        </div>

        {/* Input */}
        <div style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "5px", padding: "5px" }}>
          <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "3px" }}>
            &ldquo;Oi! Quero marcar uma avaliação, quando vocês têm horário disponível?&rdquo;
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "#C9A060", borderRadius: "4px", padding: "2px 7px", fontSize: "4px", fontWeight: 700, color: "#07101e" }}>🧠 Analisar</div>
          </div>
        </div>

        {/* Score + axes in a row */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px", flex: 1, alignItems: "start" }}>
          {/* Score ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <svg width="72" height="72" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
                style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}/>
              <text x="50" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800" fontFamily="serif">{score}</text>
              <text x="50" y="58" textAnchor="middle" fill={color} fontSize="8" fontWeight="600">SCORE</text>
            </svg>
            <div style={{ background: `${color}18`, border: `1px solid ${color}45`, borderRadius: "9999px", padding: "2px 6px", fontSize: "4px", fontWeight: 700, color }}>🔥 Lead Quente</div>
          </div>

          {/* Axes bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {axes.map(a => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ fontSize: "3.5px", color: "#5a7a9a", width: "38px", flexShrink: 0 }}>{a.label}</span>
                <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${a.v}%`, height: "100%", background: "linear-gradient(90deg,#C9A060,#d4b47a)", borderRadius: "2px" }}/>
                </div>
                <span style={{ fontSize: "3.5px", color: "#C9A060", width: "14px", textAlign: "right", flexShrink: 0 }}>{a.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
          {[
            { icon: "👤", title: "Perfil",    text: "Lead quente — já decidiu pelo procedimento, está escolhendo quando e onde." },
            { icon: "💡", title: "Abordagem", text: "Responda rápido. Ofereça 2 horários e confirme. Não deixe esfriar." },
            { icon: "🎯", title: "Gatilho",   text: "Crie urgência: 'Tenho horário amanhã às 14h ou quinta às 10h.'" },
          ].map(c => (
            <div key={c.title} style={{ background: "#0f1b2f", border: "1px solid rgba(201,160,96,0.12)", borderRadius: "4px", padding: "4px" }}>
              <div style={{ fontSize: "5px", marginBottom: "2px" }}>{c.icon} <span style={{ fontWeight: 700, color: "#C9A060" }}>{c.title}</span></div>
              <div style={{ fontSize: "3.5px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 4: Objeções ────────────────────────────────────────────────────────
function ScreenObjecoes() {
  const books = [
    "Preço", "Medo", "Prazo", "Confiança", "Já tem", "Resultado",
  ];
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MiniSidebar activeIdx={3} />
      <div style={{ flex: 1, background: "#07101e", padding: "8px", display: "flex", flexDirection: "column", gap: "5px", overflow: "hidden" }}>
        <div>
          <div style={{ fontSize: "4px", color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>Respostas prontas</div>
          <div style={{ fontSize: "8px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Biblioteca de Objeções</div>
        </div>

        <div style={{ fontSize: "4.5px", color: "#5a7a9a" }}>Selecione uma objeção para ver a estratégia completa de resposta</div>

        {/* Bookshelf */}
        <div style={{
          flex: 1,
          background: "radial-gradient(ellipse at 50% 0%, #3d2a12, #0e0903)",
          borderRadius: "6px",
          padding: "12px 10px 0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}>
          {/* Shelf plank */}
          <div style={{ position: "absolute", bottom: "14px", left: "6px", right: "6px", height: "8px", background: "linear-gradient(180deg,#8B5E2A,#4A2E08)", borderRadius: "1px", boxShadow: "0 3px 8px rgba(0,0,0,0.6)" }} />

          {/* Books */}
          <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", paddingBottom: "22px", paddingLeft: "4px" }}>
            {books.map((title, i) => {
              const offsets = [-4, -2, -6, -3, -5, -2];
              return (
                <div key={title} style={{
                  flex: 1,
                  height: "52px",
                  position: "relative",
                  top: `${offsets[i]}px`,
                  borderRadius: "2px 2px 1px 1px",
                  background: `linear-gradient(90deg,
                    #04060a 0%, #080d18 8%, #0d1525 18%, #121d35 30%,
                    #1a2645 42%, #1e2d52 50%, #1a2645 58%, #121d35 70%,
                    #0d1525 82%, #080d18 92%, #04060a 100%)`,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "2px 0 6px rgba(0,0,0,0.6), inset 0 0 8px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {/* Gold band at top */}
                  <div style={{ position: "absolute", top: "4px", left: "0", right: "0", height: "1px", background: "rgba(201,160,96,0.25)" }} />
                  <span style={{ fontSize: "3.5px", color: "rgba(201,160,96,0.65)", writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: 600, letterSpacing: "0.06em" }}>{title}</span>
                  {/* Gold band at bottom */}
                  <div style={{ position: "absolute", bottom: "4px", left: "0", right: "0", height: "1px", background: "rgba(201,160,96,0.25)" }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PHONE SCREEN (mini version of active screen) ──────────────────────────────
function PhoneContent({ screenIdx }: { screenIdx: number }) {
  const screens = [
    {
      title: "Dashboard",
      content: (
        <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "6px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Boa tarde ✦</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
            {[
              { l: "Respostas", v: "12", c: "#C9A060" },
              { l: "Score",     v: "74%", c: "#C9A060" },
              { l: "Quentes",   v: "3",  c: "#F97316" },
              { l: "Follow-up", v: "8",  c: "#60a5fa" },
            ].map(k => (
              <div key={k.l} style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", padding: "4px" }}>
                <div style={{ fontSize: "3.5px", color: "#5a7a9a" }}>{k.l}</div>
                <div style={{ fontSize: "9px", fontWeight: 800, color: k.c, fontFamily: "Georgia,serif" }}>{k.v}</div>
              </div>
            ))}
          </div>
          {/* Mini chart */}
          <div style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", padding: "4px" }}>
            <div style={{ fontSize: "3.5px", color: "#5a7a9a", marginBottom: "2px" }}>Respostas / semana</div>
            <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none">
              <defs><linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9A060" stopOpacity="0.4"/><stop offset="100%" stopColor="#C9A060" stopOpacity="0"/></linearGradient></defs>
              <path d="M0,28 L16,20 L33,24 L50,8 L66,14 L83,10 L100,16 L100,32 L0,32Z" fill="url(#mg1)"/>
              <path d="M0,28 L16,20 L33,24 L50,8 L66,14 L83,10 L100,16" fill="none" stroke="#C9A060" strokeWidth="1.2"/>
            </svg>
          </div>
          <div style={{ background: "linear-gradient(135deg,#0f1b2f,#131f35)", border: "1px solid rgba(201,160,96,0.3)", borderRadius: "4px", padding: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "8px" }}>🧠</span>
            <div>
              <div style={{ fontSize: "4.5px", fontWeight: 700, color: "#FFFFFF" }}>Lead Intelligence</div>
              <div style={{ fontSize: "3.5px", color: "#8aacc8" }}>Score e perfil do lead →</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Gerador",
      content: (
        <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "6px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Gerador</div>
          <div style={{ background: "#0f1b2f", border: "1px solid rgba(201,160,96,0.25)", borderRadius: "4px", padding: "4px", fontSize: "4px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            &ldquo;Quanto custa o botox? Vi no Instagram ✨&rdquo;
          </div>
          {[
            { l: "Suave",      c: "#60a5fa", t: "Oi! Que bom que nos encontrou..." },
            { l: "Consultiva", c: "#C9A060", t: "Antes de falar em valor, me conta..." },
            { l: "Fechamento", c: "#4ade80", t: "Tenho horário essa semana — quando?" },
          ].map(r => (
            <div key={r.l} style={{ background: "#0f1b2f", borderLeft: `2px solid ${r.c}`, borderRadius: "3px", padding: "3px 4px" }}>
              <div style={{ fontSize: "4px", fontWeight: 700, color: r.c, marginBottom: "1px" }}>{r.l}</div>
              <div style={{ fontSize: "3.5px", color: "rgba(255,255,255,0.55)" }}>{r.t}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Lead Intelligence",
      content: (
        <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ fontSize: "6px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif", flex: 1 }}>Lead Intelligence</span>
            <span style={{ fontSize: "3px", background: "rgba(201,160,96,0.15)", color: "#C9A060", borderRadius: "9999px", padding: "1px 3px", border: "1px solid rgba(201,160,96,0.3)" }}>PRO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
              <svg width="48" height="48" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F97316" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${0.78 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                  strokeDashoffset="0" transform="rotate(-90 50 50)"
                  style={{ filter: "drop-shadow(0 0 4px rgba(249,115,22,0.6))" }}/>
                <text x="50" y="44" textAnchor="middle" fill="#FFF" fontSize="22" fontWeight="800" fontFamily="serif">78</text>
                <text x="50" y="58" textAnchor="middle" fill="#F97316" fontSize="8" fontWeight="600">SCORE</text>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "4.5px", fontWeight: 700, color: "#F97316", marginBottom: "2px" }}>🔥 Lead Quente</div>
              <div style={{ fontSize: "3.5px", color: "#8aacc8", lineHeight: 1.5 }}>Alta intenção de compra. Responda rápido.</div>
            </div>
          </div>
          {[
            { l: "Urgência",      v: 82 },
            { l: "Intenção",      v: 75 },
            { l: "Confiança",     v: 65 },
            { l: "Receptividade", v: 88 },
          ].map(a => (
            <div key={a.l} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <span style={{ fontSize: "3.5px", color: "#5a7a9a", width: "38px", flexShrink: 0 }}>{a.l}</span>
              <div style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${a.v}%`, height: "100%", background: "linear-gradient(90deg,#C9A060,#d4b47a)" }}/>
              </div>
              <span style={{ fontSize: "3.5px", color: "#C9A060", width: "12px", textAlign: "right" }}>{a.v}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Objeções",
      content: (
        <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px", height: "100%" }}>
          <div style={{ fontSize: "6px", fontWeight: 700, color: "#D4C4A0", fontFamily: "Georgia, serif" }}>Objeções</div>
          <div style={{ flex: 1, background: "radial-gradient(ellipse at 50% 0%,#3d2a12,#0e0903)", borderRadius: "6px", padding: "10px 8px 0", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden", minHeight: "80px" }}>
            <div style={{ position: "absolute", bottom: "12px", left: "4px", right: "4px", height: "6px", background: "linear-gradient(180deg,#8B5E2A,#4A2E08)", borderRadius: "1px" }} />
            <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", paddingBottom: "18px" }}>
              {["Preço","Medo","Prazo","Confiança","Já tem","Resultado"].map((b, i) => (
                <div key={b} style={{
                  flex: 1,
                  height: `${38 + [0,2,-4,1,-3,2][i]}px`,
                  background: "linear-gradient(90deg,#04060a 0%,#0d1525 20%,#1e2d52 50%,#0d1525 80%,#04060a 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "2px 2px 1px 1px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "2px 0 4px rgba(0,0,0,0.5)",
                }}>
                  <span style={{ fontSize: "3px", color: "rgba(201,160,96,0.65)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
  ];
  return <>{screens[screenIdx].content}</>;
}

// ─── Main HeroDevices component ─────────────────────────────────────────────────
const SCREENS = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "gerador",       label: "Gerador" },
  { id: "intelligence",  label: "Lead Intel" },
  { id: "objecoes",      label: "Objeções" },
];

export function HeroDevices() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [screenVisible, setScreenVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreenVisible(false);
      setTimeout(() => {
        setActive(prev => (prev + 1) % SCREENS.length);
        setScreenVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const switchTo = (i: number) => {
    if (i === active) return;
    setScreenVisible(false);
    setTimeout(() => { setActive(i); setScreenVisible(true); }, 300);
  };

  const laptopEnter: React.CSSProperties = {
    transition: "opacity 1s ease 0.15s, transform 1s cubic-bezier(0.34,1.2,0.64,1) 0.15s",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) perspective(1000px) rotateX(0deg)" : "translateY(50px) perspective(1000px) rotateX(4deg)",
  };

  const phoneEnter: React.CSSProperties = {
    transition: "opacity 1s ease 0.5s, transform 1s cubic-bezier(0.34,1.3,0.64,1) 0.5s",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) rotate(4deg)" : "translateY(80px) rotate(4deg)",
  };

  const screenFade: React.CSSProperties = {
    transition: "opacity 0.35s ease, transform 0.35s ease",
    opacity: screenVisible ? 1 : 0,
    transform: screenVisible ? "translateY(0)" : "translateY(5px)",
    height: "100%",
  };

  const LaptopScreen = active === 0 ? ScreenDashboard
    : active === 1 ? ScreenGerador
    : active === 2 ? ScreenLeadIntelligence
    : ScreenObjecoes;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>

      {/* Screen tabs */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => switchTo(i)}
            style={{
              background: i === active ? "#C9A060" : "rgba(255,255,255,0.07)",
              border: i === active ? "none" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 600,
              color: i === active ? "#07101e" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Devices container */}
      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>

        {/* ── Laptop ── */}
        <div style={{ ...laptopEnter, position: "relative", zIndex: 10 }}>
          {/* Screen lid */}
          <div style={{
            width: "480px",
            height: "300px",
            background: "#08111e",
            borderRadius: "10px 10px 0 0",
            border: "2.5px solid #1a2840",
            borderBottom: "none",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 -4px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,160,96,0.06), inset 0 0 30px rgba(0,0,0,0.3)",
          }}>
            {/* Camera */}
            <div style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: "#0d1828", zIndex: 2 }} />
            {/* Inner bezel */}
            <div style={{ position: "absolute", inset: "14px 12px 8px", background: "#07101e", borderRadius: "5px", overflow: "hidden" }}>
              {/* OS-style top bar */}
              <div style={{ height: "16px", background: "#04090f", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", paddingLeft: "8px", paddingRight: "8px", gap: "5px" }}>
                {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
                  <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: c }} />
                ))}
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "3px", width: "100px", height: "5px" }} />
                </div>
              </div>
              {/* App content */}
              <div style={{ height: "calc(100% - 16px)", ...screenFade }}>
                <LaptopScreen />
              </div>
            </div>
          </div>

          {/* Base hinge line */}
          <div style={{ width: "480px", height: "3px", background: "linear-gradient(180deg,#253550,#1a2840)", position: "relative" }}>
            <div style={{ position: "absolute", top: "1px", left: "50%", transform: "translateX(-50%)", width: "80px", height: "1px", background: "rgba(201,160,96,0.15)" }} />
          </div>

          {/* Keyboard base */}
          <div style={{
            width: "480px",
            height: "16px",
            background: "linear-gradient(180deg,#131f35,#0d1728)",
            borderRadius: "0 0 6px 6px",
            border: "2px solid #1a2840",
            borderTop: "none",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px" }} />
          </div>

          {/* Stand shadow */}
          <div style={{ width: "420px", margin: "0 auto", height: "6px", background: "linear-gradient(180deg,#0d1728,transparent)", borderRadius: "0 0 30px 30px" }} />
        </div>

        {/* ── Phone ── */}
        <div style={{
          ...phoneEnter,
          position: "absolute",
          right: "0px",
          bottom: "22px",
          zIndex: 20,
        }}>
          <div style={{
            width: "140px",
            height: "270px",
            background: "#08111e",
            borderRadius: "22px",
            border: "2.5px solid #1a2840",
            position: "relative",
            overflow: "hidden",
            boxShadow: "6px 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,160,96,0.08)",
          }}>
            {/* Dynamic island */}
            <div style={{ position: "absolute", top: "8px", left: "50%", transform: "translateX(-50%)", width: "36px", height: "8px", background: "#07101e", borderRadius: "9999px", zIndex: 3, border: "1px solid #1a2840" }} />
            {/* Screen */}
            <div style={{ position: "absolute", inset: "2px", background: "#07101e", borderRadius: "20px", overflow: "hidden" }}>
              {/* Status bar */}
              <div style={{ height: "20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 10px 3px" }}>
                <span style={{ fontSize: "5.5px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>9:41</span>
                <span style={{ fontSize: "5.5px", color: "rgba(255,255,255,0.5)" }}>●●● WiFi 🔋</span>
              </div>
              {/* Phone content */}
              <div style={{ height: "calc(100% - 20px)", ...screenFade }}>
                <PhoneContent screenIdx={active} />
              </div>
            </div>
          </div>
          {/* Home indicator */}
          <div style={{ width: "44px", height: "4px", background: "rgba(255,255,255,0.12)", borderRadius: "2px", margin: "5px auto 0" }} />
        </div>

      </div>

      {/* Ground glow */}
      <div style={{
        width: "440px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,160,96,0.2), transparent)",
        marginTop: "4px",
      }} />
    </div>
  );
}
