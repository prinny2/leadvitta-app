"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";
import { AvisoIA } from "@/components/aviso-ia";
import { LoadingRespostas } from "@/components/loading-respostas";
import { useClinica } from "@/lib/hooks/use-clinica";
import type { AuditoriaResultado, GravidadeRisco } from "@/lib/types";

const EXEMPLO =
  "Oi! O botox aqui custa R$ 900 e o resultado é garantido, sem risco nenhum. Faz que você vai ficar perfeita! 😍";

const STATUS_META = {
  ok: {
    titulo: "Tudo certo",
    descricao:
      "Não encontramos promessas ou termos de risco. Pode enviar com tranquilidade.",
    icon: ShieldCheck,
    cor: "#5EE0A0",
    bg: "rgba(94,224,160,0.12)",
    borda: "rgba(94,224,160,0.4)",
  },
  ajustes: {
    titulo: "Vale um ajuste",
    descricao:
      "Achamos pontos que é melhor suavizar. Veja abaixo e use a versão segura.",
    icon: ShieldAlert,
    cor: "#C9A060",
    bg: "rgba(201,160,96,0.12)",
    borda: "rgba(201,160,96,0.4)",
  },
  risco: {
    titulo: "Atenção: risco alto",
    descricao:
      "Tem promessa proibida no texto. Troque pela versão segura antes de enviar.",
    icon: ShieldX,
    cor: "#F87171",
    bg: "rgba(248,113,113,0.12)",
    borda: "rgba(248,113,113,0.4)",
  },
} as const;

const GRAVIDADE_META: Record<
  GravidadeRisco,
  { label: string; cor: string; bg: string }
> = {
  alta: { label: "Alta", cor: "#F87171", bg: "rgba(248,113,113,0.15)" },
  media: { label: "Média", cor: "#F7C96B", bg: "rgba(247,201,107,0.15)" },
  baixa: { label: "Baixa", cor: "#9CC2E0", bg: "rgba(156,194,224,0.15)" },
};

export default function CompliancePage() {
  const { clinica } = useClinica();
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<AuditoriaResultado | null>(null);

  async function revisar() {
    if (!texto.trim()) {
      setErro("Cole o texto que você quer revisar.");
      return;
    }
    setLoading(true);
    setErro("");
    setAviso("");
    setResultado(null);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto,
          clinica: clinica
            ? {
                nome_clinica: clinica.nome_clinica,
                cidade: clinica.cidade,
                como_chamar: clinica.como_chamar,
                formalidade: clinica.formalidade,
                cta_preferido: clinica.cta_preferido,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível revisar agora.");
        return;
      }
      setResultado(data);
      if (data.mock) {
        setAviso(
          data.aviso ||
            "Modo demonstração — usando a checagem automática. A revisão com IA entra quando a clínica está ativa.",
        );
      } else if (data.aviso) {
        setAviso(data.aviso);
      }
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const status = resultado ? STATUS_META[resultado.status] : null;
  const StatusIcon = status?.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-champagne-300">
          Revisar texto
        </h1>
        <p className="text-sm text-navy-100 mt-1">
          Cole uma mensagem, legenda ou anúncio que você escreveu. A gente
          aponta os riscos de compliance (promessa de resultado, preço fixo,
          cura…) e devolve uma versão segura pra você usar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Formulário */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
          <div className="border-b border-brand-50 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-100">
              Seu texto
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="texto">Texto a revisar</Label>
                <button
                  type="button"
                  onClick={() => setTexto(EXEMPLO)}
                  className="text-xs font-medium text-gold-400 hover:text-gold-500"
                >
                  Usar exemplo
                </button>
              </div>
              <Textarea
                id="texto"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ex.: cole aqui a mensagem que você ia mandar pra cliente…"
                className="min-h-[220px]"
              />
              <p className="mt-1 text-xs text-navy-100">
                Nada é publicado — é só uma revisão pra você.
              </p>
            </div>

            {erro && (
              <p className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400">
                {erro}
              </p>
            )}

            <button
              type="button"
              onClick={revisar}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 px-4 py-3 text-sm font-bold text-gold-400 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-cta disabled:translate-y-0 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShieldCheck size={18} />
              )}
              Revisar compliance
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <AvisoIA aviso={aviso} />

          {loading && (
            <LoadingRespostas
              etapas={[
                "Lendo o texto com calma…",
                "Procurando promessas e preços fixos…",
                "Reescrevendo do jeito seguro…",
              ]}
            />
          )}

          {!loading && resultado && status && (
            <div className="space-y-4">
              {/* Status geral */}
              <div
                className="flex items-start gap-3 rounded-2xl border p-4"
                style={{ background: status.bg, borderColor: status.borda }}
              >
                {StatusIcon && (
                  <StatusIcon
                    size={22}
                    className="mt-0.5 shrink-0"
                    style={{ color: status.cor }}
                  />
                )}
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: status.cor }}
                  >
                    {status.titulo}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-champagne-300">
                    {status.descricao}
                  </p>
                </div>
              </div>

              {/* Riscos */}
              {resultado.riscos.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-100">
                    <AlertTriangle size={14} className="text-gold-500" />
                    {resultado.riscos.length} ponto
                    {resultado.riscos.length > 1 ? "s" : ""} de atenção
                  </p>
                  {resultado.riscos.map((r, i) => {
                    const g =
                      GRAVIDADE_META[r.gravidade] ?? GRAVIDADE_META.media;
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-navy-500 bg-navy-700 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          {r.trecho ? (
                            <span className="rounded bg-navy-800 px-2 py-0.5 text-xs italic text-champagne-300">
                              “{r.trecho}”
                            </span>
                          ) : (
                            <span />
                          )}
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: g.cor, background: g.bg }}
                          >
                            {g.label}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-navy-100">
                          {r.motivo}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reescrita segura */}
              <div className="rounded-2xl border border-gold-500/40 bg-gradient-to-br from-navy-700 to-navy-800 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-champagne-300">
                    <Sparkles size={15} className="text-gold-500" />
                    Versão segura pra enviar
                  </p>
                  <CopyButton text={resultado.reescrita} />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-champagne-300">
                  {resultado.reescrita}
                </p>
              </div>
            </div>
          )}

          {!loading && !resultado && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-500 bg-navy-700 py-14 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10">
                <ShieldCheck size={22} className="text-gold-500" />
              </div>
              <p className="mb-1 text-sm font-medium text-champagne-300">
                A revisão aparece aqui
              </p>
              <p className="max-w-[240px] text-xs leading-relaxed text-navy-100">
                Cole um texto ao lado e clique em “Revisar compliance”.
                Mostramos os riscos e a versão segura.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
