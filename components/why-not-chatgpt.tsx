import Link from "next/link";
import { Check, X } from "lucide-react";

const CHATGPT = [
  "Você descreve tudo no prompt, toda vez",
  "Começa do zero — não conhece sua clínica",
  "Pode prometer resultado e cravar preço (proibido na estética)",
  "Textão que soa de robô",
  "Cada atendente responde de um jeito",
];

const LEADBELLUS = [
  "Cola a mensagem da cliente e clica",
  "Já sabe seu tom e seus procedimentos",
  "Não promete resultado nem crava preço",
  "Resposta curta que leva pro agendamento",
  "Toda a equipe soa como a mesma clínica",
];

export function WhyNotChatGPTSection({ funilHref = "/signup" }: { funilHref?: string }) {
  return (
    <section id="vs-chatgpt" style={{ background: "#F6F0E6", padding: "72px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ maxWidth: "680px", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid rgba(201,160,96,0.5)",
              color: "#7A5108",
              background: "rgba(201,160,96,0.1)",
              borderRadius: "9999px",
              padding: "4px 14px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Por que não só o ChatGPT
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#07101e",
              margin: "0 0 12px",
              lineHeight: 1.16,
            }}
          >
            O ChatGPT te dá um texto. O LeadBellus te dá a resposta da sua clínica.
          </h2>
          <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
            Dá pra usar o ChatGPT de graça. Só que aí o trabalho chato — o prompt, as
            regras da estética e o tom — sobra todo pra você. Toda vez.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          <article
            style={{
              background: "#ffffff",
              border: "1px solid rgba(7,16,30,0.08)",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <h3 style={{ color: "#64748b", fontSize: "16px", fontWeight: 700, margin: "0 0 16px" }}>
              ChatGPT genérico
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "12px" }}>
              {CHATGPT.map((item) => (
                <li key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <X size={18} color="#94a3b8" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
                  <span style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article
            style={{
              background: "#ffffff",
              border: "2px solid #C9A060",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ color: "#07101e", fontSize: "16px", fontWeight: 700, margin: 0 }}>LeadBellus</h3>
              <span
                style={{
                  background: "rgba(201,160,96,0.14)",
                  color: "#7A5108",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  padding: "3px 10px",
                }}
              >
                a diferença
              </span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "12px" }}>
              {LEADBELLUS.map((item) => (
                <li key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Check size={18} color="#1a7a3c" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
                  <span style={{ color: "#0A1628", fontSize: "14px", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div style={{ marginTop: "28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: 0, maxWidth: "560px" }}>
            O LeadBellus não vende a mensagem — vende o trabalho chato que você não faz:
            o prompt, as regras e o tom, prontos.
          </p>
          <Link
            href={funilHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#0A1628",
              color: "#C9A060",
              border: "1.5px solid rgba(201,160,96,0.3)",
              borderRadius: "9999px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Testar 5 respostas grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
