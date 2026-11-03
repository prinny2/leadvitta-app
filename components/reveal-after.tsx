"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mostra `children` só depois que o elemento `targetId` sai da tela. Usado na
 * barra fixa de CTA do mobile: enquanto os botões do hero estão visíveis ela
 * duplicava o CTA.
 *
 * `hideWhileVisibleId` esconde de novo enquanto aquele elemento estiver na
 * tela (ex.: a demo — senão a barra cobre o botão "Ver minhas 3 respostas").
 *
 * Só opacity/visibility — transform no wrapper viraria containing block e
 * quebraria o `position: fixed` da barra.
 */
export function RevealAfter({
  targetId,
  hideWhileVisibleId,
  children,
}: {
  targetId: string;
  hideWhileVisibleId?: string;
  children: ReactNode;
}) {
  const [beforeTarget, setBeforeTarget] = useState(true);
  const [overlapping, setOverlapping] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === "undefined") {
      setBeforeTarget(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      // Esconde enquanto o alvo está na tela ou ainda abaixo dela.
      setBeforeTarget(entry.isIntersecting || entry.boundingClientRect.top > 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  useEffect(() => {
    if (!hideWhileVisibleId) return;
    const el = document.getElementById(hideWhileVisibleId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setOverlapping(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hideWhileVisibleId]);

  const hidden = beforeTarget || overlapping;

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
