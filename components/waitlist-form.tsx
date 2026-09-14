"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { BillingPlan } from "@/lib/billing";
import { trackEvent } from "./Analytics";

type WaitlistFormProps = {
  plan: BillingPlan;
  className?: string;
};

/** Captura de e-mail para os planos "Em breve" (Pro/Premium). */
export function WaitlistForm({ plan, className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");
  const inputId = `waitlist-email-${plan}`;

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (loading || ok) return;
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Tente de novo.");
      trackEvent("waitlist_join", { plan });
      setOk(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <p className={className}>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-300">
          <Check size={15} /> Pronto! Você será avisada quando o {plan === "premium" ? "Premium" : "Pro"} abrir.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={entrar} className={className}>
      <div className="flex gap-2">
        <input
          id={inputId}
          name="email"
          type="email"
          aria-label={`E-mail para lista de espera do plano ${plan}`}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="h-10 min-w-0 flex-1 rounded-xl border border-navy-500 bg-navy-800 px-3 text-sm text-champagne-300 placeholder:text-navy-100/60 outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-gold-500 px-4 text-sm font-bold text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Avise-me
        </button>
      </div>
      {erro ? <p className="mt-1.5 text-xs text-pain-300">{erro}</p> : (
        <p className="mt-1.5 text-xs text-navy-50">Entre na lista de espera — sem compromisso.</p>
      )}
    </form>
  );
}
