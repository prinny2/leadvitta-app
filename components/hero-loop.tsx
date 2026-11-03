"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

// Recorte de 8 s do Reel R5 (544x680, H.264, sem áudio, ~114 KB).
// Ao trocar o vídeo, troque também o nome do arquivo (ex.: hero-loop-v2.mp4)
// para furar o cache do navegador e da CDN.
const VIDEO_SRC = "/lp/hero-loop.mp4";
const POSTER_SRC = "/lp/hero-loop-poster.jpg";

const LABEL =
  "Demonstração: a mensagem “Oi! Quanto custa o botox?” é colada e aparecem 3 respostas: Suave, Consultiva e Fechamento.";

/**
 * Vídeo curto em loop (colar → 3 respostas → copiar e enviar).
 *
 * Fora do caminho crítico: o HTML só traz o pôster; o MP4 entra depois do
 * `load` da página. Com prefers-reduced-motion ou Economia de dados fica só o
 * pôster (o Modo Pouca Energia do iOS também bloqueia o autoplay e mostra o
 * pôster).
 */
export function HeroLoop({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true;
    if (reduceMotion || saveData) {
      video?.pause();
      return;
    }

    const start = () => setSrc(VIDEO_SRC);
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!src || !video) return;
    video.muted = true;
    video.load();
    video.play().catch(() => {
      // Autoplay bloqueado (Pouca Energia, política do navegador): fica o pôster.
    });
  }, [src]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={POSTER_SRC}
        width={544}
        height={680}
        disablePictureInPicture
        disableRemotePlayback
        aria-label={LABEL}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: "4 / 5",
          borderRadius: "20px",
          border: "1px solid rgba(228,168,77,0.35)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
          background: "#0B1B33",
          ...style,
        }}
      >
        {src ? <source src={src} type="video/mp4" /> : null}
      </video>
      {src && (
        <button
          type="button"
          aria-label={isPlaying ? "Pausar vídeo de demonstração" : "Reproduzir vídeo de demonstração"}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }}
          className="absolute bottom-3 right-3 z-10 rounded-full border border-white/30 bg-navy-950/90 px-3 py-2 text-xs font-semibold text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
        >
          {isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
        </button>
      )}
    </div>
  );
}
