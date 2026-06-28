"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Tag,
  Shield,
  Handshake,
  Calendar,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { objecoes } from "@/data/objecoes";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

const sitMap: Record<string, string> = {
  preco: "preco",
  medo: "medo",
  confianca: "antes_depois",
  agendamento: "agendar",
  pos_venda: "pos_atendimento",
};

// Cores exatas dos livros na imagem de referência: azul-marinho escuro quase preto
const catMeta: Record<string, { icon: React.ElementType; accent: string }> = {
  preco: { icon: Tag, accent: "#C9A060" },
  medo: { icon: Shield, accent: "#C9A060" },
  confianca: { icon: Handshake, accent: "#C9A060" },
  agendamento: { icon: Calendar, accent: "#C9A060" },
  pos_venda: { icon: MessageCircle, accent: "#C9A060" },
};

const ITEMS_PER_PAGE = 4;

export default function ObjecoesPage() {
  const router = useRouter();
  const [aberto, setAberto] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState(false);

  const catAtual = objecoes.find((c) => c.id === aberto);
  const totalPaginas = catAtual
    ? Math.ceil(catAtual.itens.length / ITEMS_PER_PAGE)
    : 0;
  const itensPagina = catAtual
    ? catAtual.itens.slice(
        pagina * ITEMS_PER_PAGE,
        (pagina + 1) * ITEMS_PER_PAGE,
      )
    : [];

  function abrirLivro(id: string) {
    setAbrindo(true);
    setTimeout(() => {
      setAberto(id);
      setPagina(0);
      setAbrindo(false);
    }, 350);
  }

  function fecharLivro() {
    setAberto(null);
    setPagina(0);
  }

  function personalizar(catId: string, gatilho: string) {
    try {
      sessionStorage.setItem(
        "re_prefill",
        JSON.stringify({
          mensagem: gatilho,
          situacao: sitMap[catId] || "preco",
        }),
      );
    } catch {
      /* ignora */
    }
    router.push("/gerador");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-champagne-300">
            Biblioteca de Objeções
          </h1>
          <p className="text-sm text-navy-100 mt-1">
            Conhecimento que transforma respostas em confiança.
          </p>
        </div>
        {aberto ? (
          <button
            type="button"
            onClick={fecharLivro}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: "rgba(201,160,96,0.12)",
              border: "1px solid rgba(201,160,96,0.3)",
              color: "#C9A060",
            }}
          >
            <ChevronLeft size={16} /> Voltar para estante
          </button>
        ) : (
          <span
            className="hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
            style={{
              background: "rgba(201,160,96,0.1)",
              border: "1px solid rgba(201,160,96,0.2)",
              color: "#C9A060",
            }}
          >
            🖱️ Passe o mouse para puxar o livro
          </span>
        )}
      </div>

      {/* ── ESTANTE ── */}
      {!aberto && (
        <div
          className={cn(
            "transition-all duration-300",
            abrindo && "opacity-0 scale-95 pointer-events-none",
          )}
        >
          {/* Alcova de madeira */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              // Fundo da alcova: madeira escura quente como na referência
              background:
                "radial-gradient(ellipse at 50% 0%, #3d2a12 0%, #221608 35%, #150e05 70%, #0e0903 100%)",
              boxShadow:
                "inset 0 0 120px rgba(0,0,0,0.7), inset 0 60px 80px rgba(0,0,0,0.4), 0 24px 80px rgba(0,0,0,0.6)",
              border: "2px solid #2a1c0a",
              padding: "48px 28px 0 28px",
            }}
          >
            {/* Luz de teto quente (candle glow) */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: "70%",
                height: "180px",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(201,160,96,0.18) 0%, rgba(180,120,40,0.06) 50%, transparent 100%)",
              }}
            />

            {/* Textura de painel de madeira no fundo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, transparent 1px, transparent 60px, rgba(0,0,0,0.05) 60px)",
                opacity: 0.4,
              }}
            />

            {/* ── LIVROS ── */}
            <div
              className="relative flex items-end justify-center gap-2 sm:gap-3"
              style={{ minHeight: "320px" }}
            >
              {objecoes.map((cat, idx) => {
                const meta = catMeta[cat.id] ?? catMeta.preco;
                const Icon = meta.icon;
                const isHov = hovered === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => abrirLivro(cat.id)}
                    onMouseEnter={() => setHovered(cat.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative flex-1 max-w-[180px] min-w-[90px] focus:outline-none group"
                    style={{
                      transform: isHov
                        ? "translateY(-44px) scale(1.05)"
                        : "translateY(0) scale(1)",
                      transition:
                        "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      filter: isHov
                        ? "drop-shadow(0 40px 50px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(201,160,96,0.35))"
                        : "drop-shadow(0 16px 32px rgba(0,0,0,0.8))",
                    }}
                  >
                    {/* ── LOMBADA CILÍNDRICA ── */}
                    <div
                      className="relative w-full"
                      style={{
                        height: "290px",
                        // Gradiente cilíndrico: escuro nas bordas, reflexo de luz no centro — igual referência
                        background: `
                          linear-gradient(90deg,
                            #04060a 0%,
                            #080d18 6%,
                            #0d1525 14%,
                            #121d35 24%,
                            #1a2645 34%,
                            #1e2d52 44%,
                            #1a2645 54%,
                            #121d35 64%,
                            #0d1525 76%,
                            #080d18 88%,
                            #04060a 100%
                          )
                        `,
                        borderRadius: "10px 4px 4px 10px",
                        overflow: "hidden",
                        // Borda de cobre/bronze no hover
                        border: isHov
                          ? "1px solid rgba(180,130,60,0.7)"
                          : "1px solid rgba(201,160,96,0.15)",
                        borderLeft: isHov
                          ? "2px solid rgba(201,150,50,0.8)"
                          : "2px solid rgba(201,160,96,0.1)",
                        transition: "border 0.3s",
                      }}
                    >
                      {/* Reflexo de luz central (highlight do cilindro) */}
                      <div
                        className="absolute top-0 bottom-0 pointer-events-none"
                        style={{
                          left: "30%",
                          width: "40%",
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.035) 70%, transparent 100%)",
                        }}
                      />

                      {/* Sombra de encadernação (borda esquerda escura) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 pointer-events-none"
                        style={{
                          width: "18%",
                          background:
                            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                        }}
                      />

                      {/* Sombra direita */}
                      <div
                        className="absolute right-0 top-0 bottom-0 pointer-events-none"
                        style={{
                          width: "10%",
                          background:
                            "linear-gradient(270deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
                        }}
                      />

                      {/* Textura de couro: linhas horizontais muito sutis */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(180deg, transparent, transparent 5px, rgba(0,0,0,0.12) 5px, rgba(0,0,0,0.12) 6px)",
                          opacity: 0.6,
                        }}
                      />

                      {/* Borda decorativa dupla interna */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          inset: "8px 7px",
                          border: "1px solid rgba(201,160,96,0.3)",
                          borderRadius: "5px",
                        }}
                      />
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          inset: "12px 10px",
                          border: "0.5px solid rgba(201,160,96,0.15)",
                          borderRadius: "3px",
                        }}
                      />

                      {/* Ornamento de canto — topo */}
                      {[
                        ["10px", "10px"],
                        ["10px", "auto"],
                        ["auto", "10px"],
                        ["auto", "auto"],
                      ].map(([t, r], ci) => (
                        <div
                          key={ci}
                          className="absolute pointer-events-none"
                          style={{
                            top: t === "auto" ? undefined : "14px",
                            bottom: t === "auto" ? "14px" : undefined,
                            left: r === "auto" ? "12px" : undefined,
                            right: r === "auto" ? undefined : "12px",
                            width: "10px",
                            height: "10px",
                            borderTop:
                              ci < 2
                                ? "1.5px solid rgba(201,160,96,0.5)"
                                : undefined,
                            borderBottom:
                              ci >= 2
                                ? "1.5px solid rgba(201,160,96,0.5)"
                                : undefined,
                            borderLeft:
                              ci === 0 || ci === 2
                                ? "1.5px solid rgba(201,160,96,0.5)"
                                : undefined,
                            borderRight:
                              ci === 1 || ci === 3
                                ? "1.5px solid rgba(201,160,96,0.5)"
                                : undefined,
                          }}
                        />
                      ))}

                      {/* Conteúdo */}
                      <div className="absolute inset-0 flex flex-col items-center justify-between py-6 px-3">
                        {/* Capítulo */}
                        <div className="text-center">
                          <p
                            className="text-[7px] uppercase tracking-[0.3em] font-bold"
                            style={{ color: "rgba(201,160,96,0.75)" }}
                          >
                            Capítulo
                          </p>
                          <p
                            className="font-serif leading-none mt-1"
                            style={{
                              fontSize: "2rem",
                              fontWeight: 700,
                              color: "#C9A060",
                              textShadow:
                                "0 0 20px rgba(201,160,96,0.5), 0 2px 6px rgba(0,0,0,0.6)",
                            }}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>

                        {/* Linha ornamental */}
                        <div className="flex items-center justify-center gap-1 w-full px-2">
                          <div
                            className="h-px flex-1"
                            style={{
                              background:
                                "linear-gradient(90deg, transparent, rgba(201,160,96,0.6))",
                            }}
                          />
                          <svg width="6" height="6" viewBox="0 0 6 6">
                            <path
                              d="M3 0 L6 3 L3 6 L0 3 Z"
                              fill="rgba(201,160,96,0.8)"
                            />
                          </svg>
                          <div
                            className="h-px flex-1"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(201,160,96,0.6), transparent)",
                            }}
                          />
                        </div>

                        {/* Ícone */}
                        <Icon
                          size={32}
                          style={{
                            color: "#C9A060",
                            filter: isHov
                              ? "drop-shadow(0 0 10px rgba(201,160,96,0.8))"
                              : "drop-shadow(0 0 4px rgba(201,160,96,0.4))",
                            transition: "filter 0.3s",
                          }}
                          strokeWidth={1.2}
                        />

                        {/* Linha ornamental */}
                        <div className="flex items-center justify-center gap-1 w-full px-2">
                          <div
                            className="h-px flex-1"
                            style={{
                              background:
                                "linear-gradient(90deg, transparent, rgba(201,160,96,0.6))",
                            }}
                          />
                          <svg width="6" height="6" viewBox="0 0 6 6">
                            <path
                              d="M3 0 L6 3 L3 6 L0 3 Z"
                              fill="rgba(201,160,96,0.8)"
                            />
                          </svg>
                          <div
                            className="h-px flex-1"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(201,160,96,0.6), transparent)",
                            }}
                          />
                        </div>

                        {/* Título */}
                        <div className="text-center px-1">
                          <p
                            className="font-serif font-bold leading-tight"
                            style={{
                              fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
                              color: isHov ? "#D4B070" : "#C9A060",
                              textShadow: isHov
                                ? "0 0 16px rgba(201,160,96,0.7)"
                                : "none",
                              transition: "all 0.3s",
                            }}
                          >
                            {cat.titulo}
                          </p>
                          <p
                            className="text-[8px] mt-1.5"
                            style={{ color: "rgba(201,160,96,0.5)" }}
                          >
                            {cat.itens.length} respostas
                          </p>
                        </div>

                        {/* Logo marca d'água */}
                        <div
                          style={{
                            opacity: isHov ? 0.35 : 0.2,
                            transition: "opacity 0.3s",
                          }}
                        >
                          <svg
                            width="14"
                            height="18"
                            viewBox="0 0 80 96"
                            fill="none"
                          >
                            <path
                              d="M40 4 L76 40 L40 76 L4 40 Z"
                              stroke="#C9A060"
                              strokeWidth="4"
                              fill="none"
                            />
                            <line
                              x1="40"
                              y1="32"
                              x2="40"
                              y2="76"
                              stroke="#C9A060"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <circle cx="40" cy="29" r="5" fill="#C9A060" />
                          </svg>
                        </div>
                      </div>

                      {/* Marcador de fita no topo quando hover */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{
                          top: "-2px",
                          width: "12px",
                          height: isHov ? "20px" : "0px",
                          background:
                            "linear-gradient(180deg, #C9A060 0%, #8B6020 100%)",
                          clipPath:
                            "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
                          transition:
                            "height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      />
                    </div>

                    {/* Espessura do livro (lateral direita) */}
                    <div
                      className="absolute top-1.5 -right-1 bottom-0 pointer-events-none"
                      style={{
                        width: "5px",
                        background: isHov
                          ? "linear-gradient(90deg, rgba(180,130,60,0.6) 0%, rgba(100,70,20,0.4) 100%)"
                          : "linear-gradient(90deg, rgba(201,160,96,0.15) 0%, rgba(0,0,0,0.5) 100%)",
                        borderRadius: "0 2px 2px 0",
                        transition: "background 0.3s",
                      }}
                    />

                    {/* Luz no chão abaixo do livro quando hover */}
                    {isHov && (
                      <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{
                          width: "80%",
                          height: "12px",
                          background:
                            "radial-gradient(ellipse, rgba(201,160,96,0.25) 0%, transparent 70%)",
                          filter: "blur(4px)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prateleira de madeira */}
            <div
              className="relative"
              style={{
                height: "22px",
                background:
                  "linear-gradient(180deg, #5a3a18 0%, #3d2710 40%, #2a1c08 70%, #1a1005 100%)",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.9), inset 0 2px 0 rgba(201,160,96,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
                borderTop: "1px solid rgba(201,160,96,0.22)",
              }}
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.2) 12px, rgba(0,0,0,0.2) 13px)",
                }}
              />
            </div>

            {/* Base da alcova */}
            <div
              style={{
                height: "16px",
                background: "linear-gradient(180deg, #150f06 0%, #0a0703 100%)",
                boxShadow: "0 12px 40px rgba(0,0,0,1)",
              }}
            />
          </div>

          {/* Citação */}
          <p
            className="text-center text-xs italic mt-5"
            style={{ color: "rgba(201,160,96,0.4)" }}
          >
            &ldquo;Objeções não são barreiras, são convites para demonstrar
            valor com clareza.&rdquo;
          </p>
        </div>
      )}

      {/* ── LIVRO ABERTO ── */}
      {aberto && catAtual && (
        <div
          className={cn(
            "transition-all duration-300",
            abrindo ? "opacity-0 scale-95" : "opacity-100 scale-100",
          )}
        >
          {/* Cabeçalho */}
          {(() => {
            const meta = catMeta[catAtual.id] ?? catMeta.preco;
            const Icon = meta.icon;
            const capNum = String(
              objecoes.findIndex((c) => c.id === aberto) + 1,
            ).padStart(2, "0");
            return (
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(201,160,96,0.12)",
                    border: "1px solid rgba(201,160,96,0.25)",
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: "#C9A060" }}
                    strokeWidth={1.4}
                  />
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "#C9A060" }}
                  >
                    Capítulo {capNum}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-champagne-300">
                    {catAtual.titulo}
                  </h2>
                  <p className="text-xs text-navy-100 mt-0.5">
                    {catAtual.itens.length} respostas para transformar
                    resistência em compromisso.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Livro aberto */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, #1a1208 0%, #120e06 50%, #1a1208 100%)",
              border: "1px solid rgba(201,160,96,0.18)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(201,160,96,0.08)",
            }}
          >
            {/* Encadernação central */}
            <div
              className="absolute left-1/2 top-0 bottom-0 z-10 pointer-events-none hidden md:block"
              style={{
                width: "28px",
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(201,160,96,0.05) 50%, rgba(0,0,0,0.6) 100%)",
                boxShadow: "0 0 24px rgba(0,0,0,0.5)",
              }}
            />

            {/* Páginas */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {[0, 1].map((col) => {
                const colItems = itensPagina.slice(col * 2, col * 2 + 2);
                return (
                  <div
                    key={col}
                    className="relative p-6 sm:p-8"
                    style={{
                      background:
                        col === 0
                          ? "linear-gradient(108deg, #f7f0e0 0%, #ede3cc 100%)"
                          : "linear-gradient(72deg, #ede3cc 0%, #f7f0e0 100%)",
                      minHeight: "420px",
                    }}
                  >
                    {/* Linhas de pauta */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(180deg, transparent, transparent 30px, rgba(180,140,60,0.12) 30px, rgba(180,140,60,0.12) 31px)",
                      }}
                    />

                    {/* Sombra borda encadernação */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none"
                      style={{
                        [col === 0 ? "right" : "left"]: 0,
                        width: "20px",
                        background:
                          col === 0
                            ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.08))"
                            : "linear-gradient(90deg, rgba(0,0,0,0.08), transparent)",
                      }}
                    />

                    {/* Canto decorativo */}
                    <div
                      className="absolute pointer-events-none opacity-20"
                      style={{
                        inset: "12px",
                        border: "1px solid rgba(180,120,40,0.4)",
                        borderRadius: "2px",
                      }}
                    />

                    <div className="relative space-y-4">
                      {colItems.map((item, i) => {
                        const globalIdx = col * 2 + i + pagina * ITEMS_PER_PAGE;
                        return (
                          <div
                            key={i}
                            className="rounded-xl p-4"
                            style={{
                              background: "rgba(255,252,242,0.7)",
                              border: "1px solid rgba(180,140,60,0.2)",
                              boxShadow:
                                "0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                            }}
                          >
                            <p
                              className="text-[9px] uppercase tracking-[0.22em] font-bold mb-2"
                              style={{ color: "rgba(139,100,20,0.6)" }}
                            >
                              Objeção {String(globalIdx + 1).padStart(2, "0")}
                            </p>
                            <div
                              className="h-px mb-2"
                              style={{
                                background:
                                  "linear-gradient(90deg, rgba(180,130,40,0.3), transparent)",
                              }}
                            />
                            <p className="font-serif text-base font-bold text-stone-800 mb-2 leading-snug">
                              &ldquo;{item.gatilho}&rdquo;
                            </p>
                            <div
                              className="h-px mb-3"
                              style={{ background: "rgba(180,130,40,0.12)" }}
                            />
                            <p className="text-sm leading-relaxed text-stone-700 mb-4">
                              {item.resposta}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="[&_button]:rounded-lg [&_button]:border [&_button]:border-stone-800/20 [&_button]:bg-stone-800 [&_button]:text-stone-100 [&_button]:text-xs [&_button]:px-3 [&_button]:py-1.5 [&_button]:font-medium [&_button]:flex [&_button]:items-center [&_button]:gap-1.5">
                                <CopyButton text={item.resposta} />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  personalizar(catAtual.id, item.gatilho)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                                style={{
                                  background: "rgba(180,130,40,0.15)",
                                  color: "#7a5c10",
                                  border: "1px solid rgba(180,130,40,0.3)",
                                }}
                              >
                                <Sparkles size={11} /> Adaptar ao meu tom
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div
                className="flex items-center justify-center gap-4 py-4 relative z-10"
                style={{
                  background:
                    "linear-gradient(180deg, #ede3cc 0%, #e0d4b8 100%)",
                  borderTop: "1px solid rgba(180,130,40,0.15)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={pagina === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-30 hover:scale-110"
                  style={{
                    background: "rgba(180,130,40,0.2)",
                    color: "#8B6914",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPaginas }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPagina(i)}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: i === pagina ? "28px" : "8px",
                        background:
                          i === pagina ? "#8B6914" : "rgba(139,105,20,0.3)",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas - 1, p + 1))
                  }
                  disabled={pagina === totalPaginas - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-30 hover:scale-110"
                  style={{
                    background: "rgba(180,130,40,0.2)",
                    color: "#8B6914",
                  }}
                >
                  <ChevronRight size={16} />
                </button>
                <span
                  className="text-xs font-medium"
                  style={{ color: "#8B6914" }}
                >
                  Página {pagina + 1} de {totalPaginas}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
