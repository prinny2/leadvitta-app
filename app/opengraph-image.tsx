import { ImageResponse } from "next/og";

// Imagem de prévia ao compartilhar o link (WhatsApp, Instagram, Facebook, X).
// Arquivo na raiz do app → vale para todas as rotas.
export const alt = "LeadBellus — a secretária de WhatsApp da clínica de estética";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#081426";
const INK = "#0B1B33";
const GOLD = "#E4A84D";
const GOLD_HOT = "#F7C96B";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${NAVY} 0%, ${INK} 100%)`,
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: NAVY,
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            L
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>LeadBellus</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
            A secretária que responde no tom da sua clínica
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, color: GOLD_HOT }}>
            enquanto a cliente ainda está quente.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.78)" }}>
          Antes e depois do procedimento · Teste grátis, sem cartão
        </div>
      </div>
    ),
    size
  );
}
