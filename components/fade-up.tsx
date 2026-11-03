"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Entrada suave (sobe e aparece) só com CSS + IntersectionObserver.
 *
 * O HTML do servidor já sai VISÍVEL: o que está na primeira tela nunca fica
 * escondido esperando o JavaScript (antes, com framer-motion, o hero vinha com
 * opacity:0 até hidratar e o LCP no celular passava de 5 s). Depois de montar,
 * só o que ainda está abaixo da dobra é recolhido e volta ao entrar na tela.
 * Com prefers-reduced-motion nada anima. CSS em app/globals.css (.lb-fade).
 */
export function FadeUp({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Já visível (ou acima, por âncora/rolagem restaurada): fica como veio.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.fade = "out";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.dataset.fade = "in";
        observer.disconnect();
      },
      // Margem em vez de threshold: blocos mais altos que a tela também entram.
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.fade;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `lb-fade ${className}` : "lb-fade"}
      style={delay ? ({ ...style, "--lb-fade-delay": `${delay}s` } as CSSProperties) : style}
    >
      {children}
    </div>
  );
}
