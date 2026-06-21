const C = {
  bg: "#07101e",
  sidebar: "#0b1424",
  card: "#0f1b2f",
  border: "rgba(255,255,255,0.07)",
  gold: "#C9A060",
  muted: "#5a7a9a",
  orange: "#F97316",
  blue: "#60a5fa",
  green: "#4ade80",
};

const kpis = [
  { label: "Respostas hoje", value: "12", color: "#fff" },
  { label: "Prioridade", value: "74%", color: C.gold },
  { label: "Leads quentes", value: "3", color: C.orange },
  { label: "Retomadas", value: "8", color: C.blue },
];

const responses = [
  {
    label: "Consultiva",
    color: C.gold,
    text: "Antes de falar em valor, me conta: você busca prevenção ou já tem uma linha que incomoda?",
  },
  {
    label: "Fechamento",
    color: C.green,
    text: "Tenho horário esta semana. Você prefere manhã ou tarde?",
  },
];

function MiniLogo() {
  return (
    <svg width="14" height="17" viewBox="0 0 80 96" fill="none" aria-hidden="true">
      <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#C9A060" strokeWidth="8" strokeLinecap="round" fill="none" />
      <line x1="40" y1="32" x2="40" y2="86" stroke="#C9A060" strokeWidth="7" strokeLinecap="round" />
      <circle cx="40" cy="27" r="10" fill="#C9A060" />
    </svg>
  );
}

function Sidebar() {
  const items = ["Início", "Gerador", "Prioridade", "Objeções", "Retomadas"];

  return (
    <div
      style={{
        width: 72,
        flexShrink: 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, paddingBottom: 9, borderBottom: "1px solid rgba(201,160,96,0.14)" }}>
        <MiniLogo />
        <span style={{ fontSize: 6, fontWeight: 800, color: "#D4C4A0" }}>LeadBellus</span>
      </div>
      {items.map((item, index) => (
        <div
          key={item}
          style={{
            borderLeft: index === 1 ? `2px solid ${C.gold}` : "2px solid transparent",
            background: index === 1 ? "rgba(201,160,96,0.08)" : "transparent",
            borderRadius: 6,
            padding: "5px 6px",
            fontSize: 5,
            color: index === 1 ? C.gold : "rgba(255,255,255,0.38)",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function LaptopApp() {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar />
      <div style={{ flex: 1, background: C.bg, padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 6, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              IA para atendimento
            </div>
            <div style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 16, fontWeight: 700, color: "#D4C4A0" }}>
              Gerador de respostas
            </div>
          </div>
          <div style={{ background: C.gold, borderRadius: 8, padding: "6px 12px", fontSize: 7, fontWeight: 800, color: C.bg }}>
            Gerar resposta
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
          {kpis.map((kpi) => (
            <div key={kpi.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 7px" }}>
              <div style={{ fontSize: 5, color: C.muted, marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 16, fontWeight: 800, color: kpi.color }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, minHeight: 0 }}>
          <div style={{ background: C.card, border: "1px solid rgba(201,160,96,0.18)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 6, color: C.muted, marginBottom: 6 }}>Mensagem da cliente</div>
            <div style={{ background: "#081120", border: "1px solid rgba(201,160,96,0.26)", borderRadius: 8, padding: 10, fontSize: 8, color: "rgba(255,255,255,0.74)", lineHeight: 1.55 }}>
              Quanto custa o botox? Vi no Instagram e fiquei curiosa.
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: "rgba(201,160,96,0.12)", color: C.gold, border: "1px solid rgba(201,160,96,0.28)", borderRadius: 999, padding: "4px 8px", fontSize: 6, fontWeight: 700 }}>
                Tom consultivo
              </span>
              <span style={{ background: "rgba(96,165,250,0.1)", color: C.blue, borderRadius: 999, padding: "4px 8px", fontSize: 6, fontWeight: 700 }}>
                Preço
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {responses.map((response) => (
              <div
                key={response.label}
                style={{
                  background: C.card,
                  border: `1px solid ${response.color}33`,
                  borderLeft: `3px solid ${response.color}`,
                  borderRadius: 9,
                  padding: "9px 10px",
                  flex: 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: response.color }}>{response.label}</span>
                  <span style={{ fontSize: 5, color: response.color, border: `1px solid ${response.color}44`, borderRadius: 999, padding: "2px 6px" }}>
                    Copiar
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 7, lineHeight: 1.6, color: "rgba(255,255,255,0.66)" }}>
                  {response.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg,#0f1b2f,#111f36)", border: "1px solid rgba(201,160,96,0.22)", borderRadius: 10, padding: "9px 11px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.gold}`, display: "grid", placeItems: "center", color: C.gold, fontSize: 14 }}>
            74
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 8, fontWeight: 800 }}>Alta chance de avançar</div>
            <div style={{ color: C.muted, fontSize: 6, marginTop: 2 }}>Responder agora · conduzir para avaliação</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneApp() {
  return (
    <div style={{ padding: "26px 10px 10px", height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 9, fontWeight: 700, color: "#D4C4A0" }}>
          Prioridade
        </span>
        <span style={{ background: "rgba(201,160,96,0.15)", color: C.gold, borderRadius: 999, padding: "2px 6px", fontSize: 5, fontWeight: 800 }}>
          PRO
        </span>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8 }}>
        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 6, lineHeight: 1.5 }}>
          "Quero marcar uma avaliação. Quando tem horário?"
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 8, padding: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `5px solid ${C.orange}`, display: "grid", placeItems: "center", color: "#fff", fontSize: 17, fontWeight: 900 }}>
          78
        </div>
        <div>
          <div style={{ color: C.orange, fontSize: 7, fontWeight: 800 }}>Alta prioridade</div>
          <div style={{ color: C.muted, fontSize: 5.5, marginTop: 3, lineHeight: 1.4 }}>
            Intenção clara. Responda rápido.
          </div>
        </div>
      </div>
      {["Urgência", "Intenção", "Confiança"].map((label, index) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 46, fontSize: 5, color: C.muted }}>{label}</span>
          <span style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                width: `${[86, 78, 66][index]}%`,
                height: "100%",
                background: "linear-gradient(90deg,#C9A060,#e8c98a)",
              }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function HeroDevices() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {["Dashboard", "Gerador", "Prioridade"].map((label, index) => (
          <span
            key={label}
            style={{
              background: index === 1 ? C.gold : "rgba(255,255,255,0.06)",
              border: index === 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: index === 1 ? C.bg : "rgba(255,255,255,0.48)",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 650, minHeight: 430 }}>
        <div style={{ position: "relative", zIndex: 10 }}>
          <div
            style={{
              width: 580,
              maxWidth: "100%",
              height: 362,
              background: "#060d1a",
              borderRadius: "12px 12px 0 0",
              border: "2.5px solid #162030",
              borderBottom: "none",
              overflow: "hidden",
              boxShadow: "0 -4px 50px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,160,96,0.05)",
            }}
          >
            <div style={{ height: 18, background: "#030810", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 10px", gap: 5 }}>
              {["#ef4444", "#f59e0b", "#22c55e"].map((color) => (
                <span key={color} style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              ))}
            </div>
            <div style={{ height: "calc(100% - 18px)" }}>
              <LaptopApp />
            </div>
          </div>
          <div style={{ width: 580, maxWidth: "100%", height: 20, background: "linear-gradient(180deg,#111e2d,#0a1520)", border: "2px solid #162030", borderTop: "none", borderRadius: "0 0 8px 8px" }} />
          <div style={{ width: 500, maxWidth: "86%", height: 6, margin: "0 auto", background: "linear-gradient(180deg,#0a1520,transparent)", borderRadius: "0 0 40px 40px" }} />
        </div>

        <div style={{ position: "absolute", right: 0, bottom: 28, zIndex: 20, transform: "rotate(4deg)" }}>
          <div
            style={{
              width: 162,
              height: 310,
              background: "#060d1a",
              borderRadius: 26,
              border: "2.5px solid #162030",
              position: "relative",
              overflow: "hidden",
              boxShadow: "8px 14px 50px rgba(0,0,0,0.72), 0 0 0 1px rgba(201,160,96,0.07)",
            }}
          >
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 40, height: 9, background: "#060d1a", borderRadius: 999, zIndex: 3, border: "1px solid #162030" }} />
            <div style={{ position: "absolute", inset: 2, background: C.bg, borderRadius: 24, overflow: "hidden" }}>
              <PhoneApp />
            </div>
          </div>
          <div style={{ width: 50, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "6px auto 0" }} />
        </div>
      </div>

      <div style={{ width: 520, maxWidth: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,160,96,0.18),transparent)", marginTop: -8 }} />
    </div>
  );
}
