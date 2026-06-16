"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles, MessageSquareQuote } from "lucide-react";
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

const catColors: Record<string, string> = {
  preco: "bg-gold-500 text-navy-900",
  medo: "bg-navy-800 text-white",
  confianca: "bg-brand-700 text-white",
  agendamento: "bg-gold-400 text-navy-900",
  pos_venda: "bg-brand-400 text-white",
};

export default function ObjecoesPage() {
  const router = useRouter();
  const [abertas, setAbertas] = useState<string[]>(
    objecoes[0] ? [objecoes[0].id] : []
  );

  function toggle(id: string) {
    setAbertas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function personalizar(catId: string, gatilho: string) {
    try {
      sessionStorage.setItem(
        "re_prefill",
        JSON.stringify({ mensagem: gatilho, situacao: sitMap[catId] || "preco" })
      );
    } catch { /* ignora */ }
    router.push("/gerador");
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-champagne-300">
          Biblioteca de Objeções
        </h1>
        <p className="text-sm text-navy-100 mt-1">
          Objeção é quando a cliente trava — &quot;tá caro&quot;, &quot;vou pensar&quot;, &quot;dói?&quot;.
          A resposta certa já está pronta: use na hora ou adapte ao seu tom.
        </p>
      </div>

      {/* Acordeão de categorias */}
      <div className="space-y-3">
        {objecoes.map((cat, idx) => {
          const aberta = abertas.includes(cat.id);
          const badgeClass = catColors[cat.id] ?? "bg-navy-800 text-white";
          return (
            <div
              key={cat.id}
              className="overflow-hidden rounded-2xl border border-navy-500 bg-navy-700 shadow-card"
            >
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-navy-800"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold", badgeClass)}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="font-serif text-base font-semibold text-champagne-300">
                      {cat.titulo}
                    </span>
                    <span className="ml-2 text-xs text-navy-100">
                      {cat.itens.length} respostas
                    </span>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={cn("text-navy-100 transition-transform duration-200", aberta && "rotate-180")}
                />
              </button>

              {aberta && (
                <div className="border-t border-navy-500 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {cat.itens.map((item, i) => (
                      <div
                        key={i}
                        className="group rounded-xl border border-navy-500 bg-navy-800 p-4 transition-shadow hover:shadow-card"
                      >
                        {/* Gatilho */}
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-700 border border-navy-500 px-2.5 py-1 text-xs font-medium text-champagne-300 shadow-sm">
                            <MessageSquareQuote size={12} className="text-gold-500 shrink-0" />
                            &quot;{item.gatilho}&quot;
                          </span>
                          <CopyButton text={item.resposta} />
                        </div>

                        {/* Resposta */}
                        <p className="text-sm leading-relaxed text-champagne-300 mb-3">
                          {item.resposta}
                        </p>

                        {/* CTA adaptar */}
                        <button
                          type="button"
                          onClick={() => personalizar(cat.id, item.gatilho)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-semibold text-gold-400 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                        >
                          <Sparkles size={12} /> Adaptar ao meu tom
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
