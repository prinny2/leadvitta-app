"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { label: "Sinais", href: "#sinais" },
  { label: "Demo", href: "#simulador" },
  { label: "Preços", href: "#precos" },
];

/**
 * Menu de navegação mobile da landing.
 * No desktop os links ficam visíveis na navbar; no mobile eles só existiam
 * escondidos (`hidden md:flex`), deixando o visitante sem navegação nem login.
 * Este botão hambúrguer abre um painel com as seções, "Entrar" e o CTA.
 */
export function MarketingMobileMenu() {
  const [open, setOpen] = useState(false);

  // Trava o scroll do body enquanto o menu está aberto.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Fecha com a tecla Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="marketing-mobile-menu"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid rgba(201,160,96,0.28)",
          background: "rgba(255,255,255,0.04)",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={close}
            style={{
              position: "fixed",
              inset: "64px 0 0 0",
              background: "rgba(3,8,16,0.6)",
              zIndex: 49,
            }}
          />

          {/* Painel */}
          <div
            id="marketing-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              zIndex: 50,
              background: "rgba(7,16,30,0.98)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(201,160,96,0.2)",
              padding: "12px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {SECTIONS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "16px",
                  textDecoration: "none",
                  padding: "12px 4px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {l.label}
              </a>
            ))}

            <Link
              href="/login"
              onClick={close}
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: "16px",
                textDecoration: "none",
                padding: "12px 4px",
              }}
            >
              Entrar
            </Link>

            <Link
              href="/signup?plan=start"
              onClick={close}
              style={{
                marginTop: "8px",
                background: "#C9A060",
                color: "#07101e",
                borderRadius: "9999px",
                padding: "13px 20px",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Gerar 5 respostas
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
