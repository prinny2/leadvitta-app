"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mostra `children` só depois que o elemento `targetId` sai da tela. Usado na
 * barra fixa de CTA do mobile: enquanto os botões do hero estão visíveis ela
 * duplicava o CTA e tapava o "Ver demo".
 *
 * Só opacity/visibility — transform no wrapper viraria containing block e
 * quebraria o `position: fixed` da barra.
 */
export function RevealAfter({
  targetId,
  children,
}: {
  targetId: string;
  children: ReactNode;
}) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === "undefined") {
      setHidden(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      // Esconde enquanto o alvo está na tela ou ainda abaixo dela.
      setHidden(entry.isIntersecting || entry.boundingClientRect.top > 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <div
      aria-hidden={hidden || undefined}
      style={{
        opacity: hidden ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
        transition: "opacity 0.2s ease, visibility 0.2s ease",
      }}
    >
      {children}
    </div>
  );
}
