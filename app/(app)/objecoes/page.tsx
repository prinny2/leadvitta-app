"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, MousePointerClick } from "lucide-react";
import { objecoes } from "@/data/objecoes";
import { CopyButton } from "@/components/copy-button";

// Mapeia a categoria para a "situação" do Gerador (pré-preenchimento).
const sitMap: Record<string, string> = {
  preco: "preco",
  medo: "medo",
  confianca: "antes_depois",
  agendamento: "agendar",
  pos_venda: "pos_atendimento",
};

// Cor da "capa/lombada" de cada categoria (inline pra não depender do config).
const corCategoria: Record<string, { de: string; ate: string }> = {
  preco: { de: "#d8b45a", ate: "#b8893a" }, // dourado
  medo: { de: "#a99ad6", ate: "#7f6cc0" }, // lavanda
  confianca: { de: "#7fa890", ate: "#557e69" }, // sálvia
  agendamento: { de: "#5b6b7d", ate: "#3a4754" }, // azul-ardósia
  pos_venda: { de: "#d39a9a", ate: "#b46f6f" }, // rosé
};

// Alturas variadas pra dar cara de estante de verdade.
const alturas = [176, 150, 184, 158, 170, 146, 162];

type Selecao = { catId: string; idx: number } | null;

export default function ObjecoesPage() {
  const router = useRouter();
  const primeiro: Selecao = objecoes[0] ? { catId: objecoes[0].id, idx: 0 } : null;
  const [ativa, setAtiva] = useState<Selecao>(primeiro);
  const [fixada, setFixada] = useState<Selecao>(null);

  const catAtiva = objecoes.find((c) => c.id === ativa?.catId);
  const itemAtivo = catAtiva && ativa ? catAtiva.itens[ativa.idx] : undefined;
  const chaveAtiva = ativa ? `${ativa.catId}:${ativa.idx}` : "";

  function ehAtiva(catId: string, idx: number) {
    return ativa?.catId === catId && ativa?.idx === idx;
  }

  function personalizar(catId: string, gatilho: string) {
    try {
      sessionStorage.setItem(
        "re_prefill",
        JSON.stringify({ mensagem: gatilho, situacao: sitMap[catId] || "preco" })
      );
    } catch {
      /* ignora */
    }
    router.push("/gerador");
  }

  return (
    <div>
      <style>{`@keyframes lbFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <header className="mb-5">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Biblioteca de Objeções
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Cada livro é uma objeção da cliente — “tá caro”, “vou pensar”, “dói?”.
          Passe o mouse (ou toque) num livro pra ver a resposta pronta no card.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ===== A estante ===== */}
        <div
          className="rounded-3xl border border-brand-100 p-4 sm:p-6"
          style={{
            background:
              "linear-gradient(180deg,#f4ece1 0%,#efe4d6 100%)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,.6)",
          }}
          onMouseLeave={() => setAtiva(fixada ?? primeiro)}
        >
          {objecoes.map((cat) => {
            const cor = corCategoria[cat.id] ?? { de: "#b9a07f", ate: "#8a6f4f" };
            return (
              <section key={cat.id} className="pt-7 first:pt-2">
                <div className="mb-1 flex items-center gap-2 pl-1">
                  <BookOpen size={15} style={{ color: cor.ate }} />
                  <h2 className="font-serif text-base font-semibold text-ink">
                    {cat.titulo}
                  </h2>
                  <span className="text-xs text-muted">({cat.itens.length})</span>
                </div>

                {/* livros */}
                <div className="flex flex-wrap items-end gap-1.5 px-1">
                  {cat.itens.map((item, i) => {
                    const ativo = ehAtiva(cat.id, i);
                    const altura = alturas[i % alturas.length];
                    return (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setAtiva({ catId: cat.id, idx: i })}
                        onFocus={() => setAtiva({ catId: cat.id, idx: i })}
                        onClick={() => {
                          const sel = { catId: cat.id, idx: i };
                          setFixada(sel);
                          setAtiva(sel);
                        }}
                        aria-label={`Objeção: ${item.gatilho}`}
                        aria-pressed={ativo}
                        className="group relative shrink-0 rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                        style={{
                          width: 40,
                          height: altura,
                          backgroundImage: `linear-gradient(180deg, ${cor.de}, ${cor.ate})`,
                          color: "#fff",
                          transform: ativo ? "translateY(-12px)" : "translateY(0)",
                          boxShadow: ativo
                            ? `0 16px 22px -10px rgba(0,0,0,.5), 0 0 0 2px ${cor.ate}`
                            : "0 6px 10px -7px rgba(0,0,0,.45)",
                          transition:
                            "transform .18s ease, box-shadow .18s ease",
                        }}
                      >
                        {/* faixa decorativa no topo da lombada */}
                        <span
                          className="absolute inset-x-1 top-2 h-px rounded"
                          style={{ background: "rgba(255,255,255,.45)" }}
                        />
                        <span
                          className="absolute inset-x-1 top-3 h-px rounded"
                          style={{ background: "rgba(255,255,255,.25)" }}
                        />
                        <span
                          className="flex h-full items-center justify-center overflow-hidden px-0.5 pb-4 pt-6 text-[10px] font-semibold leading-tight tracking-tight"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            textShadow: "0 1px 1px rgba(0,0,0,.25)",
                          }}
                        >
                          {item.gatilho}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* prateleira de madeira */}
                <div
                  className="mt-0 h-3.5 rounded-b"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg,#9c6b39,#744d27)",
                    boxShadow: "0 9px 14px -8px rgba(80,50,20,.7)",
                  }}
                />
              </section>
            );
          })}
        </div>

        {/* ===== Card da objeção em foco ===== */}
        <div className="lg:sticky lg:top-6 lg:self-start" aria-live="polite">
          {itemAtivo && catAtiva ? (
            <div
              key={chaveAtiva}
              className="rounded-2xl border border-l-4 border-brand-100 bg-white p-5 shadow-card"
              style={{
                borderLeftColor: corCategoria[catAtiva.id]?.ate ?? "#8a6f4f",
                animation: "lbFade .25s ease",
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: corCategoria[catAtiva.id]?.ate }}
                  >
                    {catAtiva.titulo}
                  </span>
                  <p className="font-serif text-lg font-semibold text-ink">
                    “{itemAtivo.gatilho}”
                  </p>
                </div>
                <CopyButton text={itemAtivo.resposta} />
              </div>
              <p className="text-sm leading-relaxed text-ink">
                {itemAtivo.resposta}
              </p>
              <button
                type="button"
                onClick={() => personalizar(catAtiva.id, itemAtivo.gatilho)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
              >
                <Sparkles size={14} /> Adaptar ao meu tom
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-brand-200 bg-nude-50 p-5 text-sm text-muted">
              <MousePointerClick size={16} /> Passe o mouse num livro pra ver a
              resposta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
