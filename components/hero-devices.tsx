import type { ReactNode } from "react";

const C = {
  bg: "#06111f",
  panel: "#0d1b30",
  panel2: "#10233d",
  line: "rgba(255,255,255,0.09)",
  gold: "#F7C96B",
  coral: "#FF7A59",
  mint: "#5EE0A0",
  sky: "#7AC7FF",
  text: "#F7F1E4",
  muted: "rgba(247,241,228,0.62)",
};

const intentRows = [
  { label: "Preco", value: 86, color: C.coral },
  { label: "Medo", value: 74, color: C.gold },
  { label: "Chance", value: 81, color: C.mint },
];

const replyOptions = [
  {
    label: "Consultiva",
    text: "Ana, consigo te passar uma base sim. Antes, me conta se você busca suavizar linhas ou prevenir?",
    color: C.gold,
  },
  {
    label: "Fechamento leve",
    text: "Se quiser, eu vejo um horário para avaliação e te explico o valor certinho para o seu caso.",
    color: C.mint,
  },
];

function SignalBars() {
  return (
    <div style={{ display: "grid", gap: 11 }}>
      {intentRows.map((row) => (
        <div key={row.label}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 }}>
            <span style={{ color: C.muted, fontSize: 11, fontWeight: 700 }}>{row.label}</span>
            <span style={{ color: row.color, fontSize: 11, fontWeight: 900 }}>{row.value}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div
              style={{
                width: `${row.value}%`,
                height: "100%",
                borderRadius: 999,
                background: row.color,
                boxShadow: `0 0 18px ${row.color}55`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatBubble({
  children,
  mine,
}: {
  children: ReactNode;
  mine?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: mine ? "86%" : "78%",
          borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          border: mine ? "1px solid rgba(94,224,160,0.28)" : "1px solid rgba(255,255,255,0.08)",
          background: mine ? "rgba(94,224,160,0.12)" : "rgba(255,255,255,0.06)",
          color: mine ? "#EFFFF5" : C.text,
          padding: "11px 13px",
          fontSize: 12,
          lineHeight: 1.55,
          boxShadow: mine ? "0 14px 34px rgba(94,224,160,0.10)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ReplyCard({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${color}44`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 8,
        padding: "10px 11px",
        background: "rgba(255,255,255,0.045)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <span style={{ color, fontSize: 11, fontWeight: 900 }}>{label}</span>
        <span style={{ color: C.bg, background: color, borderRadius: 999, padding: "3px 8px", fontSize: 9, fontWeight: 900 }}>
          copiar
        </span>
      </div>
      <p style={{ margin: 0, color: "rgba(247,241,228,0.72)", fontSize: 11, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function ConversionStrip() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr",
        gap: 8,
        borderTop: `1px solid ${C.line}`,
        paddingTop: 14,
      }}
      className="hero-conversion-strip"
    >
      {[
        ["5", "respostas gratis"],
        ["3", "tons por mensagem"],
        ["R$97", "Start mensal"],
      ].map(([value, label], index) => (
        <div
          key={label}
          style={{
            border: `1px solid ${index === 0 ? "rgba(247,201,107,0.28)" : C.line}`,
            borderRadius: 8,
            padding: "10px 11px",
            background: index === 0 ? "rgba(247,201,107,0.10)" : "rgba(255,255,255,0.04)",
          }}
        >
          <strong style={{ display: "block", color: index === 0 ? C.gold : C.text, fontSize: 21, lineHeight: 1 }}>
            {value}
          </strong>
          <span style={{ color: C.muted, fontSize: 10, fontWeight: 700 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function HeroDevices() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 660,
        minHeight: 430,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-18px",
          background:
            "linear-gradient(115deg, transparent 0 24%, rgba(247,201,107,0.14) 24% 25%, transparent 25% 58%, rgba(94,224,160,0.12) 58% 59%, transparent 59% 100%)",
          opacity: 0.9,
        }}
      />

      <div
        style={{
          position: "relative",
          border: "1px solid rgba(247,201,107,0.24)",
          borderRadius: 18,
          background:
            "linear-gradient(145deg, rgba(16,35,61,0.98), rgba(6,17,31,0.98))",
          boxShadow: "0 30px 90px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.04) inset",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 54px), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 54px)",
            maskImage: "linear-gradient(180deg, black, transparent 86%)",
          }}
        />

        <div style={{ position: "relative", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ color: C.gold, fontSize: 12, fontWeight: 900 }}>
                Central ao vivo
              </div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                WhatsApp da clínica, leitura de intenção e resposta pronta
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${C.coral}66`,
                background: "rgba(255,122,89,0.12)",
                borderRadius: 999,
                color: "#FFD8CB",
                padding: "7px 11px",
                fontSize: 11,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              lead quente 86
            </div>
          </div>

          <div className="hero-live-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  border: `1px solid ${C.line}`,
                  background: "rgba(6,17,31,0.78)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                  <div>
                    <strong style={{ color: C.text, fontSize: 14 }}>Ana - 12:41</strong>
                    <p style={{ margin: "3px 0 0", color: C.muted, fontSize: 10 }}>Instagram para WhatsApp</p>
                  </div>
                  <span style={{ color: C.mint, fontSize: 10, fontWeight: 900 }}>responder agora</span>
                </div>

                <div style={{ display: "grid", gap: 9 }}>
                  <ChatBubble>Oi! Quanto fica o botox? Tenho medo de ficar artificial.</ChatBubble>
                  <ChatBubble mine>
                    Ana, consigo te orientar sim. Para ficar natural, o valor depende dos pontos e da avaliação.
                  </ChatBubble>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }} className="hero-tags-row">
                {[
                  ["Intencao", "Preco", C.coral],
                  ["Tom", "Acolhedor", C.gold],
                  ["Proximo passo", "Avaliacao", C.mint],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ border: `1px solid ${color}44`, borderRadius: 8, padding: "9px 10px", background: "rgba(255,255,255,0.04)" }}>
                    <span style={{ display: "block", color: C.muted, fontSize: 9, fontWeight: 800 }}>{label}</span>
                    <strong style={{ display: "block", color, fontSize: 12, marginTop: 2 }}>{value}</strong>
                  </div>
                ))}
              </div>

              <ConversionStrip />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  border: "1px solid rgba(247,201,107,0.22)",
                  borderRadius: 14,
                  background: "rgba(247,201,107,0.08)",
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
                  <strong style={{ color: C.text, fontSize: 13 }}>Prioridade</strong>
                  <span style={{ color: C.bg, background: C.gold, borderRadius: 999, padding: "4px 8px", fontSize: 10, fontWeight: 900 }}>
                    alta
                  </span>
                </div>
                <SignalBars />
              </div>

              {replyOptions.map((option) => (
                <ReplyCard key={option.label} {...option} />
              ))}

              <div
                style={{
                  border: `1px solid ${C.line}`,
                  borderRadius: 14,
                  padding: 13,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ color: C.sky, fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                  Fluxo automatico
                </div>
                {["Detecta a situacao", "Gera 3 respostas", "Copia para o WhatsApp"].map((step, index) => (
                  <div key={step} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: index ? 7 : 0 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(122,199,255,0.12)", color: C.sky, fontSize: 10, fontWeight: 900 }}>
                      {index + 1}
                    </span>
                    <span style={{ color: "rgba(247,241,228,0.72)", fontSize: 11, fontWeight: 700 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .hero-live-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .hero-tags-row,
          .hero-conversion-strip {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
