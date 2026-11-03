"use client";

import { trackEvent } from "@/components/Analytics";
import { DEMO_PRESET_EVENT } from "@/lib/quick-reply";

export type DemoSituationChip = { id: string; label: string };

/**
 * Atalhos da seção "Situações" da landing: o toque preenche a caixa da demo
 * (CustomEvent `lb:demo-preset`) e rola até ela — não gera sozinho; quem gera
 * é o toque em "Ver minhas 3 respostas". Sem JS, o link `/?demo=<id>#demo` faz
 * o mesmo pela URL.
 */
export function DemoSituationChips({ items }: { items: DemoSituationChip[] }) {
  return (
    <>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`/?demo=${item.id}#demo`}
              className="lb-situacao-chip"
              onClick={(event) => {
                event.preventDefault();
                trackEvent("cta_click", { source: `situacao_${item.id}` });
                window.dispatchEvent(
                  new CustomEvent(DEMO_PRESET_EVENT, { detail: item.id })
                );
                const demo = document.getElementById("demo");
                if (demo) {
                  const reduce =
                    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
                  demo.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                } else {
                  window.location.hash = "demo";
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "10px 16px",
                borderRadius: "9999px",
                border: "1.5px solid rgba(201,160,96,0.6)",
                background: "#FFFFFF",
                color: "#0B1B33",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <style>{`
        .lb-situacao-chip { transition: background-color .2s ease, border-color .2s ease; }
        .lb-situacao-chip:hover { background: rgba(228,168,77,0.12) !important; border-color: #E4A84D !important; }
        .lb-situacao-chip:focus-visible { outline: 2px solid #9A6414; outline-offset: 2px; }
      `}</style>
    </>
  );
}
