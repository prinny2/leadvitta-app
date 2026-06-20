"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * true no celular (≤768px) ou com "reduzir movimento" do sistema ligado.
 * Use pra desligar animações contínuas (ex.: marquee) que começam no mount,
 * antes do MotionConfig abaixo virar reduzido.
 */
export function useShouldReduce() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(max-width: 768px), (prefers-reduced-motion: reduce)"
    );
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}

/**
 * Alivia as animações no celular (e respeita "reduzir movimento" do sistema).
 * No mobile, reducedMotion="always" desliga as animações de transform/layout
 * (slides ao rolar, scale no hover) — mantém só fades leves. Menos trabalho de
 * render = LP mais rápida e menos "pop". No desktop, continua premium.
 */
export function MotionGate({ children }: { children: React.ReactNode }) {
  const reduce = useShouldReduce();

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
