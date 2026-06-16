"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Tag, Shield, Handshake, Calendar, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
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

const catMeta: Record<string, { icon: React.ElementType; cor: string; spine: string }> = {
  preco:      { icon: Tag,         cor: "#C9A060", spine: "from-[#1a2a1a] to-[#0d1a0d]" },
  medo:       { icon: Shield,      cor: "#7B9EC9", spine: "from-[#1a1a2e] to-[#0d0d1a]" },
  confianca:  { icon: Handshake,   cor: "#C9A060", spine: "from-[#2a1a10] to-[#1a0d08]" },
  agendamento:{ icon: Calendar,    cor: "#9EC9A0", spine: "from-[#1a2a1a] to-[#0d180d]" },
  pos_venda:  { icon: MessageCircle,cor: "#C9A060",spine: "from-[#2a1a1a] to-[#1a0d0d]" },
};

const ITEMS_PER_PAGE = 4;

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
    }, 300);
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
        {aberto && (
          <button
            type="button"
            onClick={fecharLivro}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-500 bg-navy-700 px-4 py-2 text-sm font-medium text-champagne-400 hover:bg-navy-600 transition-all"
          >
            <ChevronLeft size={16} /> Voltar para estante
          </button>
        )}
        {!aberto && (
          <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-gold-500/20 bg-gold-500/10 px-3 py-2 text-xs text-gold-400">
            🖱️ Passe o mouse para puxar o livro
          </span>
        )}
      </div>

      {/* ── ESTANTE ── */}
      {!aberto && (
        <div
          className={cn(
            "relative transition-all duration-300",
            abrindo && "opacity-0 scale-95"
          )}
        >
          {/* Prateleira */}
          <div
            className="relative rounded-2xl p-8 pb-4"
            style={{
              background: "linear-gradient(180deg, #0a1220 0%, #060d18 100%)",
              boxShadow: "inset 0 -4px 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)",
              border: "1px solid rgba(201,160,96,0.1)",
            }}
          >
            {/* Parede de fundo da estante */}
            <div
              className="absolute inset-2 rounded-xl pointer-events-none"
              style={{
                background: "repeating-linear-gradient(90deg, rgba(201,160,96,0.02) 0px, transparent 1px, transparent 40px, rgba(201,160,96,0.02) 40px)",
              }}
            />

            {/* Livros */}
            <div className="relative flex items-end justify-center gap-3 sm:gap-5 min-h-[260px]">
              {objecoes.map((cat, idx) => {
                const meta = catMeta[cat.id] ?? catMeta.preco;
                const Icon = meta.icon;
                const isHovered = hovered === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => abrirLivro(cat.id)}
                    onMouseEnter={() => setHovered(cat.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative flex-1 max-w-[180px] min-w-[100px] cursor-pointer focus:outline-none"
                    style={{
                      transform: isHovered ? "translateY(-28px) scale(1.04)" : "translateY(0) scale(1)",
                      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      filter: isHovered ? `drop-shadow(0 20px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 20px ${meta.cor}40)` : "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
                    }}
                  >
                    {/* Sombra lateral do livro (espessura) */}
                    <div
                      className="absolute -right-1.5 top-1 bottom-0 w-3 rounded-r-sm"
                      style={{
                        background: `linear-gradient(180deg, ${meta.cor}30 0%, rgba(0,0,0,0.5) 100%)`,
                        borderRadius: "0 4px 4px 0",
                      }}
                    />

                    {/* Capa do livro */}
                    <div
                      className="relative w-full rounded-sm overflow-hidden"
                      style={{
                        height: "220px",
                        background: `linear-gradient(160deg, #1a2535 0%, #0d1520 40%, #080f18 100%)`,
                        border: `1px solid ${meta.cor}30`,
                        borderRight: "none",
                      }}
                    >
                      {/* Textura de couro */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)",
                        }}
                      />

                      {/* Borda decorativa dourada */}
                      <div
                        className="absolute inset-2 rounded-sm pointer-events-none"
                        style={{ border: `1px solid ${meta.cor}25` }}
                      />
                      <div
                        className="absolute inset-3 rounded-sm pointer-events-none"
                        style={{ border: `0.5px solid ${meta.cor}15` }}
                      />

                      {/* Conteúdo do livro */}
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-4 py-5">
                        {/* Capítulo */}
                        <div className="text-center">
                          <p className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: meta.cor }}>
                            Capítulo
                          </p>
                          <p className="font-serif text-2xl font-bold leading-none mt-0.5" style={{ color: meta.cor }}>
                            {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>

                        {/* Divisor */}
                        <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${meta.cor}80, transparent)` }} />

                        {/* Ícone */}
                        <Icon size={28} style={{ color: meta.cor }} strokeWidth={1.5} />

                        {/* Divisor */}
                        <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${meta.cor}80, transparent)` }} />

                        {/* Título */}
                        <div className="text-center">
                          <p className="font-serif text-sm font-semibold leading-tight" style={{ color: meta.cor }}>
                            {cat.titulo}
                          </p>
                          <p className="text-[9px] mt-1" style={{ color: `${meta.cor}80` }}>
                            {cat.itens.length} respostas
                          </p>
                        </div>

                        {/* Logo pequena */}
                        <div className="opacity-30">
                          <svg width="16" height="20" viewBox="0 0 80 96" fill="none">
                            <path d="M40 4 L76 40 L40 76 L4 40 Z" stroke={meta.cor} strokeWidth="4" strokeLinejoin="round" fill="none"/>
                            <line x1="40" y1="32" x2="40" y2="76" stroke={meta.cor} strokeWidth="3" strokeLinecap="round"/>
                            <circle cx="40" cy="29" r="5" fill={meta.cor}/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tábua da prateleira */}
            <div
              className="relative mt-2 h-4 rounded-b-lg"
              style={{
                background: "linear-gradient(180deg, #1a1008 0%, #0d0804 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                border: "1px solid rgba(201,160,96,0.15)",
              }}
            />
          </div>

          {/* Citação na parte inferior */}
          <p className="text-center text-xs text-navy-100 mt-4 italic">
            &ldquo;Objeções não são barreiras, são convites para demonstrar valor com clareza.&rdquo;
          </p>
        </div>
      )}

      {/* ── LIVRO ABERTO ── */}
      {aberto && catAtual && (
        <div
          className={cn(
            "transition-all duration-400",
            abrindo ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          {/* Cabeçalho do capítulo */}
          <div className="flex items-center gap-3 mb-6">
            {(() => {
              const meta = catMeta[catAtual.id] ?? catMeta.preco;
              const Icon = meta.icon;
              return (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${meta.cor}20`, border: `1px solid ${meta.cor}30` }}>
                    <Icon size={20} style={{ color: meta.cor }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest" style={{ color: catMeta[catAtual.id]?.cor ?? "#C9A060" }}>
                      Capítulo {String(objecoes.findIndex(c => c.id === aberto) + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-serif text-2xl font-semibold text-champagne-300">{catAtual.titulo}</h2>
                    <p className="text-xs text-navy-100">{catAtual.itens.length} respostas para transformar resistência em compromisso.</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Livro aberto */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #12100e 0%, #1a1510 50%, #12100e 100%)",
              border: "1px solid rgba(201,160,96,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,160,96,0.1)",
            }}
          >
            {/* Encadernação central */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(201,160,96,0.08) 50%, rgba(0,0,0,0.4) 100%)",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              }}
            />

            {/* Páginas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {[0, 1].map((pageCol) => {
                const startIdx = pageCol * 2;
                const colItems = itensPagina.slice(startIdx, startIdx + 2);
                return (
                  <div
                    key={pageCol}
                    className="relative p-6 sm:p-8"
                    style={{
                      background: pageCol === 0
                        ? "linear-gradient(100deg, #f5f0e4 0%, #ede5d0 100%)"
                        : "linear-gradient(80deg, #ede5d0 0%, #f5f0e4 100%)",
                      minHeight: "400px",
                    }}
                  >
                    {/* Textura de papel */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,0,0,0.05) 28px, rgba(0,0,0,0.05) 29px)",
                      }}
                    />

                    <div className="relative space-y-4">
                      {colItems.map((item, i) => {
                        const globalIdx = pageCol * 2 + i + pagina * ITEMS_PER_PAGE;
                        return (
                          <div
                            key={i}
                            className="rounded-xl p-4"
                            style={{
                              background: "rgba(255,255,255,0.6)",
                              border: "1px solid rgba(180,140,60,0.2)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                          >
                            {/* Número da objeção */}
                            <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-700/60 mb-2">
                              Objeção {String(globalIdx + 1).padStart(2, "0")}
                            </p>

                            {/* Gatilho */}
                            <p className="font-serif text-base font-semibold text-stone-800 mb-2 leading-snug">
                              &ldquo;{item.gatilho}&rdquo;
                            </p>

                            {/* Divisor */}
                            <div className="h-px bg-amber-800/10 mb-3" />

                            {/* Resposta */}
                            <p className="text-sm leading-relaxed text-stone-700 mb-3">{item.resposta}</p>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                              <div style={{ filter: "invert(1)" }} className="opacity-80">
                                <CopyButton text={item.resposta} />
                              </div>
                              <button
                                type="button"
                                onClick={() => personalizar(catAtual.id, item.gatilho)}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
                                style={{
                                  background: "rgba(180,130,40,0.15)",
                                  color: "#8B6914",
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

            {/* Paginação inferior */}
            {totalPaginas > 1 && (
              <div
                className="flex items-center justify-center gap-4 py-4"
                style={{ background: "linear-gradient(180deg, #f0e8d0 0%, #e8ddc0 100%)" }}
              >
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={pagina === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-30"
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
                        width: i === pagina ? "24px" : "8px",
                        background: i === pagina ? "#8B6914" : "rgba(139,105,20,0.3)",
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                  disabled={pagina === totalPaginas - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-30"
                  style={{ background: "rgba(180,130,40,0.2)", color: "#8B6914" }}
                >
                  <ChevronRight size={16} />
                </button>

                <span className="text-xs" style={{ color: "#8B6914" }}>
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
