"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Tag, Shield, Handshake, Calendar, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { objecoes } from "@/data/objecoes";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

const sitMap: Record<string, string> = {
  preco:       "preco",
  medo:        "medo",
  confianca:   "antes_depois",
  agendamento: "agendar",
  pos_venda:   "pos_atendimento",
};

const catMeta: Record<string, { icon: React.ElementType; accent: string; spineBase: string; spineLight: string }> = {
  preco:       { icon: Tag,          accent: "#C9A060", spineBase: "#1a1208", spineLight: "#2e2010" },
  medo:        { icon: Shield,       accent: "#9AAEC9", spineBase: "#0e1520", spineLight: "#18253a" },
  confianca:   { icon: Handshake,    accent: "#C9A060", spineBase: "#1a1208", spineLight: "#2e2010" },
  agendamento: { icon: Calendar,     accent: "#A0C9A0", spineBase: "#101a10", spineLight: "#1a2e1a" },
  pos_venda:   { icon: MessageCircle,accent: "#C9A060", spineBase: "#1a1208", spineLight: "#2e2010" },
};

const ITEMS_PER_PAGE = 4;

// Cylindrical spine gradient simulating leather + reflected light
function spineGradient(base: string, light: string) {
  return `linear-gradient(90deg,
    #060402 0%,
    ${base} 10%,
    ${light} 28%,
    #3a2c18 45%,
    ${light} 60%,
    ${base} 78%,
    #060402 100%
  )`;
}

function OrnamentLine({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-1 w-full">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}60)` }} />
      <svg width="8" height="8" viewBox="0 0 8 8">
        <path d="M4 0 L8 4 L4 8 L0 4 Z" fill={color} opacity="0.7" />
      </svg>
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
    </div>
  );
}

export default function ObjecoesPage() {
  const router = useRouter();
  const [aberto, setAberto] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState(false);

  const catAtual = objecoes.find((c) => c.id === aberto);
  const totalPaginas = catAtual ? Math.ceil(catAtual.itens.length / ITEMS_PER_PAGE) : 0;
  const itensPagina = catAtual ? catAtual.itens.slice(pagina * ITEMS_PER_PAGE, (pagina + 1) * ITEMS_PER_PAGE) : [];

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
      sessionStorage.setItem("re_prefill", JSON.stringify({ mensagem: gatilho, situacao: sitMap[catId] || "preco" }));
    } catch { /* ignora */ }
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
            className="inline-flex items-center gap-2 rounded-xl border border-[#C9A060]/30 bg-[#C9A060]/10 px-4 py-2 text-sm font-medium text-[#C9A060] hover:bg-[#C9A060]/20 transition-all"
          >
            <ChevronLeft size={16} /> Voltar para estante
          </button>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#C9A060]/20 bg-[#C9A060]/10 px-3 py-2 text-xs text-[#C9A060]">
            🖱️ Passe o mouse para puxar o livro
          </span>
        )}
      </div>

      {/* ── ESTANTE ── */}
      {!aberto && (
        <div className={cn("transition-all duration-350", abrindo && "opacity-0 scale-95 pointer-events-none")}>
          {/* Alcova / Nicho */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "radial-gradient(ellipse at 50% 30%, #2a1f0e 0%, #150e06 40%, #0a0603 100%)",
              boxShadow: "inset 0 0 80px rgba(0,0,0,0.8), inset 0 40px 60px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid rgba(201,160,96,0.12)",
              padding: "40px 32px 0 32px",
            }}
          >
            {/* Luz de teto (candle glow) */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(201,160,96,0.12) 0%, transparent 70%)",
              }}
            />

            {/* Linhas de painel de madeira no fundo */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, rgba(201,160,96,0.06) 0px, transparent 1px, transparent 80px, rgba(201,160,96,0.06) 80px)",
              }}
            />

            {/* ── LIVROS ── */}
            <div className="relative flex items-end justify-center gap-1.5 sm:gap-2.5" style={{ minHeight: "300px" }}>
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
                    className="relative flex-1 max-w-[160px] min-w-[80px] focus:outline-none"
                    style={{
                      transform: isHov
                        ? "translateY(-40px) scale(1.06) rotateX(2deg)"
                        : "translateY(0) scale(1) rotateX(0deg)",
                      transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      filter: isHov
                        ? `drop-shadow(0 30px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 30px ${meta.accent}50)`
                        : "drop-shadow(0 12px 24px rgba(0,0,0,0.7))",
                      transformStyle: "preserve-3d",
                      perspective: "600px",
                    }}
                  >
                    {/* Lombada do livro (spine) - efeito cilíndrico */}
                    <div
                      className="relative w-full"
                      style={{
                        height: "280px",
                        background: spineGradient(meta.spineBase, meta.spineLight),
                        borderRadius: "6px 3px 3px 6px",
                        border: `1px solid ${meta.accent}20`,
                        borderLeft: `2px solid ${meta.accent}10`,
                        overflow: "hidden",
                      }}
                    >
                      {/* Reflexo superior (gloss no couro) */}
                      <div
                        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                        style={{
                          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
                        }}
                      />

                      {/* Sombra borda esquerda (encadernação) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none"
                        style={{
                          background: "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
                        }}
                      />

                      {/* Textura de couro — linhas horizontais sutis */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-15"
                        style={{
                          backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 5px)",
                        }}
                      />

                      {/* Borda decorativa interna dupla */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          inset: "8px 6px",
                          border: `1px solid ${meta.accent}35`,
                          borderRadius: "3px",
                        }}
                      />
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          inset: "12px 9px",
                          border: `0.5px solid ${meta.accent}18`,
                          borderRadius: "2px",
                        }}
                      />

                      {/* Conteúdo do livro */}
                      <div className="absolute inset-0 flex flex-col items-center justify-between py-5 px-3">

                        {/* Capítulo */}
                        <div className="text-center">
                          <p
                            className="text-[8px] uppercase tracking-[0.25em] font-bold"
                            style={{ color: `${meta.accent}90` }}
                          >
                            Capítulo
                          </p>
                          <p
                            className="font-serif text-3xl font-bold leading-none mt-1"
                            style={{
                              color: meta.accent,
                              textShadow: `0 0 20px ${meta.accent}60, 0 2px 4px rgba(0,0,0,0.5)`,
                            }}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>

                        <OrnamentLine color={meta.accent} />

                        {/* Ícone */}
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${meta.accent}20 0%, transparent 70%)`,
                          }}
                        >
                          <Icon
                            size={26}
                            style={{
                              color: meta.accent,
                              filter: `drop-shadow(0 0 6px ${meta.accent}80)`,
                            }}
                            strokeWidth={1.2}
                          />
                        </div>

                        <OrnamentLine color={meta.accent} />

                        {/* Título */}
                        <div className="text-center">
                          <p
                            className="font-serif text-sm font-bold leading-tight"
                            style={{
                              color: isHov ? meta.accent : `${meta.accent}CC`,
                              textShadow: isHov ? `0 0 12px ${meta.accent}60` : "none",
                              transition: "all 0.3s",
                            }}
                          >
                            {cat.titulo}
                          </p>
                          <p className="text-[9px] mt-1.5 font-medium" style={{ color: `${meta.accent}60` }}>
                            {cat.itens.length} respostas
                          </p>
                        </div>

                        {/* Logo marca d'água */}
                        <div style={{ opacity: 0.2 }}>
                          <svg width="14" height="18" viewBox="0 0 80 96" fill="none">
                            <path d="M40 4 L76 40 L40 76 L4 40 Z" stroke={meta.accent} strokeWidth="4" fill="none" />
                            <line x1="40" y1="32" x2="40" y2="76" stroke={meta.accent} strokeWidth="3" strokeLinecap="round" />
                            <circle cx="40" cy="29" r="5" fill={meta.accent} />
                          </svg>
                        </div>
                      </div>

                      {/* Marcador de fita (bookmark) no topo quando hover */}
                      {isHov && (
                        <div
                          className="absolute -top-1 left-1/2 -translate-x-1/2 w-4"
                          style={{
                            height: "24px",
                            background: `linear-gradient(180deg, ${meta.accent} 0%, ${meta.accent}80 100%)`,
                            clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
                          }}
                        />
                      )}
                    </div>

                    {/* Lombada lateral (espessura do livro) */}
                    <div
                      className="absolute top-2 -right-1.5 bottom-0"
                      style={{
                        width: "6px",
                        background: `linear-gradient(90deg, ${meta.accent}20 0%, rgba(0,0,0,0.6) 100%)`,
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Prateleira de madeira */}
            <div
              className="relative mt-0"
              style={{
                height: "20px",
                background: "linear-gradient(180deg, #3d2810 0%, #2a1c0a 40%, #1a1006 100%)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(201,160,96,0.15)",
                borderTop: "1px solid rgba(201,160,96,0.2)",
              }}
            >
              {/* Grão de madeira */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)",
                }}
              />
            </div>

            {/* Sombra embaixo da estante */}
            <div
              className="h-3 rounded-b-2xl"
              style={{
                background: "linear-gradient(180deg, #100a04 0%, #0a0603 100%)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.9)",
              }}
            />
          </div>

          {/* Citação */}
          <p className="text-center text-xs text-navy-100 mt-5 italic" style={{ color: "rgba(201,160,96,0.5)" }}>
            &ldquo;Objeções não são barreiras, são convites para demonstrar valor com clareza.&rdquo;
          </p>
        </div>
      )}

      {/* ── LIVRO ABERTO ── */}
      {aberto && catAtual && (
        <div className={cn("transition-all duration-300", abrindo ? "opacity-0 scale-95" : "opacity-100 scale-100")}>

          {/* Cabeçalho do capítulo */}
          {(() => {
            const meta = catMeta[catAtual.id] ?? catMeta.preco;
            const Icon = meta.icon;
            const capNum = String(objecoes.findIndex(c => c.id === aberto) + 1).padStart(2, "0");
            return (
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}30` }}
                >
                  <Icon size={22} style={{ color: meta.accent }} strokeWidth={1.4} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: meta.accent }}>
                    Capítulo {capNum}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-champagne-300">{catAtual.titulo}</h2>
                  <p className="text-xs text-navy-100 mt-0.5">
                    {catAtual.itens.length} respostas para transformar resistência em compromisso.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Livro aberto */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #1a1208 0%, #120e06 50%, #1a1208 100%)",
              border: "1px solid rgba(201,160,96,0.18)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(201,160,96,0.08)",
            }}
          >
            {/* Canto dobrado — decoração topo-esquerdo e topo-direito */}
            <div
              className="absolute top-0 left-0 w-10 h-10 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(201,160,96,0.12) 0%, transparent 60%)",
                borderRight: "1px solid rgba(201,160,96,0.08)",
                borderBottom: "1px solid rgba(201,160,96,0.08)",
              }}
            />
            <div
              className="absolute top-0 right-0 w-10 h-10 pointer-events-none"
              style={{
                background: "linear-gradient(225deg, rgba(201,160,96,0.12) 0%, transparent 60%)",
                borderLeft: "1px solid rgba(201,160,96,0.08)",
                borderBottom: "1px solid rgba(201,160,96,0.08)",
              }}
            />

            {/* Encadernação central */}
            <div
              className="absolute left-1/2 top-0 bottom-0 z-10 pointer-events-none hidden md:block"
              style={{
                width: "28px",
                transform: "translateX(-50%)",
                background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(201,160,96,0.06) 50%, rgba(0,0,0,0.6) 100%)",
                boxShadow: "0 0 24px rgba(0,0,0,0.6)",
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
                      background: col === 0
                        ? "linear-gradient(108deg, #f7f0e0 0%, #ede3cc 100%)"
                        : "linear-gradient(72deg, #ede3cc 0%, #f7f0e0 100%)",
                      minHeight: "420px",
                    }}
                  >
                    {/* Linhas de pauta */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-25"
                      style={{
                        backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 30px, rgba(180,140,60,0.12) 30px, rgba(180,140,60,0.12) 31px)",
                      }}
                    />

                    {/* Sombra borda encadernação */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none"
                      style={{
                        [col === 0 ? "right" : "left"]: 0,
                        width: "20px",
                        background: col === 0
                          ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.08))"
                          : "linear-gradient(90deg, rgba(0,0,0,0.08), transparent)",
                      }}
                    />

                    {/* Ornamento de canto */}
                    <div
                      className="absolute pointer-events-none opacity-20"
                      style={{ top: 12, left: 12, right: 12, bottom: 12, border: "1px solid rgba(180,120,40,0.4)", borderRadius: "2px" }}
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
                              boxShadow: "0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                            }}
                          >
                            <p className="text-[9px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: "rgba(139,100,20,0.6)" }}>
                              Objeção {String(globalIdx + 1).padStart(2, "0")}
                            </p>

                            {/* Linha decorativa */}
                            <div className="h-px mb-2" style={{ background: "linear-gradient(90deg, rgba(180,130,40,0.3), transparent)" }} />

                            <p className="font-serif text-base font-bold text-stone-800 mb-2 leading-snug">
                              &ldquo;{item.gatilho}&rdquo;
                            </p>

                            <div className="h-px mb-3" style={{ background: "rgba(180,130,40,0.12)" }} />

                            <p className="text-sm leading-relaxed text-stone-700 mb-4">{item.resposta}</p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="[&_button]:rounded-lg [&_button]:border [&_button]:border-stone-800/20 [&_button]:bg-stone-800 [&_button]:text-stone-100 [&_button]:text-xs [&_button]:px-3 [&_button]:py-1.5 [&_button]:font-medium [&_button]:flex [&_button]:items-center [&_button]:gap-1.5 [&_button]:transition-colors [&_button:hover]:bg-stone-700"
                              >
                                <CopyButton text={item.resposta} />
                              </div>
                              <button
                                type="button"
                                onClick={() => personalizar(catAtual.id, item.gatilho)}
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
                  background: "linear-gradient(180deg, #ede3cc 0%, #e0d4b8 100%)",
                  borderTop: "1px solid rgba(180,130,40,0.15)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={pagina === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-30 hover:scale-110"
                  style={{ background: "rgba(180,130,40,0.2)", color: "#8B6914" }}
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
                        background: i === pagina ? "#8B6914" : "rgba(139,105,20,0.3)",
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                  disabled={pagina === totalPaginas - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-30 hover:scale-110"
                  style={{ background: "rgba(180,130,40,0.2)", color: "#8B6914" }}
                >
                  <ChevronRight size={16} />
                </button>

                <span className="text-xs font-medium" style={{ color: "#8B6914" }}>
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
