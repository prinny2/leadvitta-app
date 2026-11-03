"use client";

import { useEffect, useRef, useState } from "react";
import { ResponseCard } from "@/components/response-card";
import { trackEvent } from "@/components/Analytics";
import { trackFreeGeneration } from "@/lib/analytics/free-generation";
import {
  DEMO_LIMIT,
  DEMO_USAGE_KEY,
  FORMALIDADE_OPCOES,
  QUICK_REPLY_ERRORS,
  QUICK_REPLY_VARIANTS,
  buildQuickReplyBody,
  getQuickReplyPreset,
  nearestFormalidade,
  parseDemoUses,
  readQuickReplyResponse,
  type QuickReplyClinica,
} from "@/lib/quick-reply";
import { comoChamarOptions } from "@/data/opcoes";
import { cn } from "@/lib/utils";
import type { ComoChamar, RespostaTripla } from "@/lib/types";

/**
 * Núcleo do "cole a mensagem → 3 respostas", compartilhado pela demo da landing
 * (`source="landing_demo"`) e pelo onboarding (`source="onboarding"`): cota
 * anônima de 5 testes (mesma chave nas duas telas), exemplos, chamada real a
 * /api/generate e os 3 cards com Copiar.
 */

export type QuickReplySource = "landing_demo" | "onboarding";

export type QuickReplyError = {
  tipo: "vazio" | "api" | "conexao" | "limite_diario";
  mensagem: string;
};

export type QuickReplyOutcome =
  | { status: "ok"; esgotouAgora: boolean }
  | { status: "vazio" | "esgotado" | "erro" | "cancelado" };

type GenerateOptions = {
  clinica?: QuickReplyClinica;
  /** Procedimento escolhido à mão (vence o do exemplo). */
  procedimento?: string;
  /** Gera já com estes valores (ex.: "usar um exemplo" num toque só). */
  override?: { mensagem: string; situacao?: string; procedimento?: string };
};

function readStoredUses(): number {
  try {
    return parseDemoUses(window.localStorage.getItem(DEMO_USAGE_KEY));
  } catch {
    return 0;
  }
}

function writeStoredUses(value: number) {
  try {
    window.localStorage.setItem(DEMO_USAGE_KEY, String(value));
  } catch {
    /* contador local indisponível: a demo segue funcionando. */
  }
}

export function useQuickReply(source: QuickReplySource) {
  const [mensagem, setMensagem] = useState("");
  // Situação/procedimento só vêm de um exemplo escolhido. Editar a caixa à mão
  // zera os dois: antes "preco"/"botox" iam junto com qualquer texto colado e
  // uma mensagem de medo virava resposta de preço.
  const [situacao, setSituacao] = useState("");
  const [presetProcedimento, setPresetProcedimento] = useState("");

  const [respostas, setRespostas] = useState<RespostaTripla | null>(null);
  const [mensagemRespondida, setMensagemRespondida] = useState("");
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState<QuickReplyError | null>(null);
  const [loading, setLoading] = useState(false);

  const [uses, setUses] = useState(0);
  const [limitLoaded, setLimitLoaded] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    setUses(readStoredUses());
    setLimitLoaded(true);
  }, []);

  const remaining = Math.max(0, DEMO_LIMIT - uses);
  const exhausted = limitLoaded && remaining <= 0;

  function editMensagem(value: string) {
    setMensagem(value);
    setSituacao("");
    setPresetProcedimento("");
    if (erro?.tipo === "vazio") setErro(null);
  }

  function applyPreset(id: string) {
    const preset = getQuickReplyPreset(id);
    if (!preset) return null;
    setMensagem(preset.mensagem);
    setSituacao(preset.situacao);
    setPresetProcedimento(preset.procedimento);
    setRespostas(null);
    setAviso("");
    setErro(null);
    return preset;
  }

  function clearResult() {
    seq.current += 1;
    setLoading(false);
    setRespostas(null);
    setAviso("");
    setErro(null);
  }

  async function generate(options: GenerateOptions = {}): Promise<QuickReplyOutcome> {
    const texto = options.override?.mensagem ?? mensagem;
    if (!texto.trim()) {
      setErro({ tipo: "vazio", mensagem: QUICK_REPLY_ERRORS.vazio });
      return { status: "vazio" };
    }

    // Relê o contador: a pessoa pode ter testado na outra tela (landing ↔
    // onboarding) ou em outra aba.
    const usedBefore = Math.max(uses, readStoredUses());
    if (usedBefore !== uses) setUses(usedBefore);
    if (usedBefore >= DEMO_LIMIT) return { status: "esgotado" };

    const current = ++seq.current;
    setLoading(true);
    setErro(null);
    setAviso("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildQuickReplyBody({
            mensagem: texto,
            situacao: options.override ? options.override.situacao : situacao,
            procedimento:
              options.procedimento ||
              (options.override ? options.override.procedimento : presetProcedimento),
            clinica: options.clinica,
          })
        ),
      });
      const data = await res.json().catch(() => null);
      if (current !== seq.current) return { status: "cancelado" };

      const result = readQuickReplyResponse(res.status, data);
      if (!result.ok) {
        setErro({ tipo: result.tipo, mensagem: result.mensagem });
        return { status: "erro" };
      }

      trackFreeGeneration(source, { ...data, ok: res.ok }, trackEvent);
      const next = Math.min(DEMO_LIMIT, Math.max(usedBefore, readStoredUses()) + 1);
      writeStoredUses(next);
      setUses(next);
      setRespostas(result.respostas);
      setMensagemRespondida(texto.trim());
      setAviso(result.aviso);
      return { status: "ok", esgotouAgora: next >= DEMO_LIMIT };
    } catch {
      if (current !== seq.current) return { status: "cancelado" };
      setErro({ tipo: "conexao", mensagem: QUICK_REPLY_ERRORS.conexao });
      return { status: "erro" };
    } finally {
      if (current === seq.current) setLoading(false);
    }
  }

  return {
    mensagem,
    editMensagem,
    situacao,
    applyPreset,
    respostas,
    mensagemRespondida,
    aviso,
    erro,
    loading,
    generate,
    clearResult,
    uses,
    remaining,
    exhausted,
    limitLoaded,
  };
}

/** Avança as etapas do carregamento enquanto `active` (para no último passo). */
export function useLoadingStep(active: boolean, total: number, intervalMs = 1400) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    if (!active || total <= 1) return;
    const id = setInterval(() => {
      setStep((s) => Math.min(total - 1, s + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, total, intervalMs]);
  return step;
}

/** Os 3 cards Suave / Consultiva / Fechamento, cada um com Copiar. */
export function QuickReplyCards({
  respostas,
  tone = "dark",
}: {
  respostas: RespostaTripla;
  tone?: "light" | "dark";
}) {
  return (
    <div className="grid gap-3">
      {QUICK_REPLY_VARIANTS.map((v) =>
        respostas[v.key] ? (
          <ResponseCard
            key={v.key}
            titulo={v.label}
            descricao={v.descricao}
            texto={respostas[v.key]}
            tone={tone}
            copiedLabel="Copiado"
          />
        ) : null
      )}
    </div>
  );
}

/** Grupo de botões de escolha única (Como chamar / Jeito de falar). */
export function ChoiceGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
  columns = 2,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-champagne-400">{label}</legend>
      <div
        className={cn(
          "grid gap-2",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-[44px] rounded-xl border px-1.5 py-2 text-[13px] font-medium leading-tight transition-colors sm:px-3 sm:text-sm",
                active
                  ? "border-gold-500 bg-gold-500/15 text-champagne-100"
                  : "border-navy-500 bg-navy-700 text-champagne-300 hover:border-navy-300 hover:bg-navy-600"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ComoChamarChoice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ComoChamar;
  onChange: (value: ComoChamar) => void;
}) {
  return (
    <ChoiceGroup<ComoChamar>
      label={label}
      value={value}
      options={comoChamarOptions}
      onChange={onChange}
      columns={4}
    />
  );
}

export function JeitoDeFalarChoice({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <ChoiceGroup<number>
      label="Jeito de falar"
      value={nearestFormalidade(value)}
      options={FORMALIDADE_OPCOES}
      onChange={onChange}
      columns={3}
    />
  );
}
