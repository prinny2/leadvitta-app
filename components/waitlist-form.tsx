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
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
          <Check size={15} /> Pronto! Você será avisada quando o {plan === "premium" ? "Premium" : "Pro"} abrir.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={entrar} className={className}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="h-10 min-w-0 flex-1 rounded-xl border border-brand-200 bg-white px-3 text-sm text-ink outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-bold transition-opacity disabled:opacity-60"
          style={{ background: "#C9A060", color: "#07101e" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Avise-me
        </button>
      </div>
      {erro ? <p className="mt-1.5 text-xs text-red-600">{erro}</p> : (
        <p className="mt-1.5 text-xs text-muted">Entre na lista de espera — sem compromisso.</p>
      )}
    </form>
  );
}
