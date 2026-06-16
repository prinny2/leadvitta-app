"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";
import { objecoes } from "@/data/objecoes";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

// Mapeia a categoria para a "situação" do Gerador (pré-preenchimento).
const sitMap: Record<string, string> = {
  preco: "preco",
  medo: "medo",
  confianca: "antes_depois",
  agendamento: "agendar",
  pos_venda: "pos_atendimento",
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
    } catch {
      /* ignora */
    }
    router.push("/gerador");
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Biblioteca de Objeções
        </h1>
        <p className="text-sm text-muted">
          Objeção é quando a cliente trava — “tá caro”, “vou pensar”, “dói?”.
          Aqui a resposta certa já está pronta: use na hora ou adapte ao tom da
          sua clínica.
        </p>
      </header>

      <div className="space-y-3">
        {objecoes.map((cat) => {
          const aberta = abertas.includes(cat.id);
          return (
            <div
              key={cat.id}
              className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card"
            >
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-serif text-lg font-semibold text-ink">
                  {cat.titulo}
                  <span className="ml-2 text-sm font-normal text-muted">
                    ({cat.itens.length})
                  </span>
                </span>
                <ChevronDown
                  size={20}
                  className={cn(
                    "text-muted transition-transform",
                    aberta && "rotate-180"
                  )}
                />
              </button>

              {aberta && (
                <div className="grid gap-3 border-t border-brand-100 p-4 md:grid-cols-2">
                  {cat.itens.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-brand-100 bg-nude-50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted">
                          “{item.gatilho}”
                        </span>
                        <CopyButton text={item.resposta} />
                      </div>
                      <p className="text-sm leading-relaxed text-ink">
                        {item.resposta}
                      </p>
                      <button
                        type="button"
                        onClick={() => personalizar(cat.id, item.gatilho)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <Sparkles size={14} /> Adaptar ao meu tom
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
