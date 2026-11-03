"use client";

import { useEffect } from "react";
import { publicGa4MeasurementId } from "@/lib/config";
import { trackGa4Event } from "@/lib/analytics/ga4-event";
import {
  SECTION_ATTR,
  createSectionTracker,
  isMeaningfullyVisible,
} from "@/lib/analytics/section-tracking";

// Limiares de 2 em 2%: o observer avisa a cada variação relevante da área
// visível, sem listener de scroll.
const THRESHOLDS = Array.from({ length: 51 }, (_, i) => i / 50);

/**
 * Mede alcance (`section_view`) e tempo (`section_time`) de cada elemento com
 * `data-track-section="<id>"` da página. Montar uma vez por página; não
 * renderiza nada. Regras em lib/analytics/section-tracking.ts.
 *
 * `observeMutations`: para páginas em que seções montam depois (onboarding:
 * respostas, tom, planos). Na LP todas as seções já vêm no HTML do servidor.
 */
export function SectionTracker({
  contentType,
  observeMutations = false,
}: {
  contentType: "lp" | "onboarding";
  observeMutations?: boolean;
}) {
  useEffect(() => {
    if (!publicGa4MeasurementId || typeof IntersectionObserver === "undefined") return;

    let stop: (() => void) | undefined;
    const begin = () => {
      stop = startSectionTracking(contentType, observeMutations);
    };

    // Começa quando o navegador folga, para não disputar a hidratação (LCP/INP).
    // O cleanup cancela antes de começar: no Strict Mode o 1º mount não envia nada.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(begin, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(begin, 500);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      stop?.();
    };
  }, [contentType, observeMutations]);

  return null;
}

function startSectionTracking(contentType: string, observeMutations: boolean): () => void {
  const tracker = createSectionTracker({
    contentType,
    send: trackGa4Event,
    pageVisible: document.visibilityState === "visible",
  });
  // Por elemento: um id pode trocar de nó (seção que desmonta e volta).
  const elements = new Map<Element, { id: string; ok: boolean }>();

  const refresh = (id: string) => {
    let ok = false;
    elements.forEach((state) => {
      if (state.id === id && state.ok) ok = true;
    });
    tracker.setQualifies(id, ok);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const state = elements.get(entry.target);
        if (!state) continue;
        state.ok = isMeaningfullyVisible(
          entry.isIntersecting ? entry.intersectionRect.height : 0,
          entry.boundingClientRect.height,
          entry.rootBounds?.height ?? window.innerHeight
        );
        refresh(state.id);
      }
    },
    { threshold: THRESHOLDS }
  );

  const scan = () => {
    document.querySelectorAll(`[${SECTION_ATTR}]`).forEach((el) => {
      const id = el.getAttribute(SECTION_ATTR);
      if (!id || elements.has(el)) return;
      elements.set(el, { id, ok: false });
      observer.observe(el);
    });
    elements.forEach((state, el) => {
      if (el.isConnected) return;
      observer.unobserve(el);
      elements.delete(el);
      refresh(state.id);
    });
  };
  scan();

  let mutations: MutationObserver | undefined;
  let rescanId: ReturnType<typeof setTimeout> | undefined;
  if (observeMutations && typeof MutationObserver !== "undefined") {
    mutations = new MutationObserver(() => {
      if (rescanId !== undefined) return;
      rescanId = setTimeout(() => {
        rescanId = undefined;
        scan();
      }, 150);
    });
    mutations.observe(document.body, { childList: true, subtree: true });
  }

  const onVisibility = () => {
    const visible = document.visibilityState === "visible";
    tracker.setPageVisible(visible);
    if (!visible) tracker.flush();
  };
  const onPageHide = () => {
    tracker.setPageVisible(false);
    tracker.flush();
  };
  // Em captura na window: o envio entra antes de o gtag.js despachar o lote
  // dele na saída da página. `pageshow` cobre a volta pelo bfcache.
  window.addEventListener("visibilitychange", onVisibility, true);
  window.addEventListener("pagehide", onPageHide, true);
  window.addEventListener("pageshow", onVisibility, true);

  return () => {
    window.removeEventListener("visibilitychange", onVisibility, true);
    window.removeEventListener("pagehide", onPageHide, true);
    window.removeEventListener("pageshow", onVisibility, true);
    mutations?.disconnect();
    if (rescanId !== undefined) clearTimeout(rescanId);
    observer.disconnect();
    tracker.dispose();
  };
}
