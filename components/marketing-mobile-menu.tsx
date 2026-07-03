"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para quem é", href: "#para-quem" },
  { label: "Demo", href: "#demo" },
  { label: "Preços", href: "#precos" },
];

/**
 * Menu mobile da landing (tema claro). No desktop os links ficam na navbar;
 * no mobile abrem por aqui, junto com "Entrar" e o CTA.
 */
export function MarketingMobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
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
        aria-controls="lp-mobile-menu"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid rgba(16,35,59,0.15)",
          background: "rgba(16,35,59,0.03)",
          color: "#10233B",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={close}
            style={{ position: "fixed", inset: "64px 0 0 0", background: "rgba(16,35,59,0.35)", zIndex: 49 }}
          />
          <div
            id="lp-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              zIndex: 50,
              background: "#FFFFFF",
              borderBottom: "1px solid rgba(201,160,96,0.3)",
              padding: "12px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              boxShadow: "0 24px 40px rgba(16,35,59,0.12)",
            }}
          >
            {SECTIONS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                style={{
                  color: "#10233B",
                  fontSize: "16px",
                  textDecoration: "none",
                  padding: "12px 4px",
                  borderBottom: "1px solid rgba(16,35,59,0.06)",
                }}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={close}
              style={{ color: "#10233B", fontSize: "16px", textDecoration: "none", padding: "12px 4px" }}
            >
              Entrar
            </Link>
            <Link
              href="/signup?plan=start"
              onClick={close}
              style={{
                marginTop: "8px",
                background: "#10233B",
                color: "#FFFFFF",
                borderRadius: "9999px",
                padding: "13px 20px",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Testar grátis
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
