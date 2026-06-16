"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Check, Save, KeyRound, Wand2, CreditCard, Dna, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { procedimentos } from "@/data/procedimentos";
import { tons } from "@/data/tons";
import { comoChamarOptions, ctaOptions, formalidadeLabel } from "@/data/opcoes";
import { getClinica, saveClinica } from "@/lib/store";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkout-button";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { billingPlanList, billingPlans, parseBillingPlan } from "@/lib/billing";
import { trackEvent } from "@/components/Analytics";

const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-brand-50 bg-brand-500 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Icon size={18} className="text-gold-400" />
      </div>
      <div>
        <p className="font-serif text-base font-semibold text-white">{title}</p>
        {subtitle && <p className="text-xs text-lavender-300">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [c, setC] = useState<Clinica>(clinicaVazia);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  const [novaSenha, setNovaSenha] = useState("");
  const [senhaMsg, setSenhaMsg] = useState("");
  const [abrindoCheckout, setAbrindoCheckout] = useState(false);

  useEffect(() => {
    getClinica().then((v) => { setC(v); setCarregando(false); });

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "sucesso") {
      trackEvent("purchase", { stripe_session_id: params.get("session_id") });
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const params = new URLSearchParams(window.location.search);
    const plan = parseBillingPlan(params.get("plan"));
    if (!plan || params.get("next") !== "checkout") return;
    if (!billingPlans[plan].disponivel) return;

    params.delete("next");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));

    setAbrindoCheckout(true);
    let disparado = false;
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) return;
      disparado = true;
      clearTimeout(timeout);
      unsub();
      try {
        trackEvent("initiate_checkout", { plan, origem: "funil_pos_cadastro" });
        const firebaseIdToken = await user.getIdToken();
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan, firebaseIdToken, customerEmail: user.email }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error || "Não foi possível abrir o pagamento.");
        window.location.assign(data.url);
      } catch (err) {
        setAbrindoCheckout(false);
        setErro(err instanceof Error ? err.message : "Não foi possível abrir o pagamento.");
      }
    });
    const timeout = setTimeout(() => {
      if (disparado) return;
      unsub();
      setAbrindoCheckout(false);
      setErro("Sua sessão ainda não carregou. Toque em \"Assinar\" no plano escolhido para continuar.");
    }, 8000);
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  function set<K extends keyof Clinica>(key: K, value: Clinica[K]) {
    setC((prev) => ({ ...prev, [key]: value }));
  }

  function toggleProc(label: string) {
    setC((prev) => ({
      ...prev,
      procedimentos: prev.procedimentos.includes(label)
        ? prev.procedimentos.filter((p) => p !== label)
        : [...prev.procedimentos, label],
    }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setOk(false);
    let numeroReivindicado = false;
    try {
      if (isFirebaseConfigured) {
        const user = getFirebaseAuth().currentUser;
        if (user) {
          const firebaseIdToken = await user.getIdToken();
          const res = await fetch("/api/clinica/whatsapp", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ numero: c.whatsapp, firebaseIdToken }),
          });
          if (!res.ok) {
            const d = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(d.error || "Não foi possível conectar o número de WhatsApp.");
          }
          numeroReivindicado = !!c.whatsapp.trim();
        }
      }
      await saveClinica({ ...c, onboarded: true });
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (err) {
      if (numeroReivindicado) {
        try {
          const user = getFirebaseAuth().currentUser;
          if (user) {
            const t = await user.getIdToken();
            await fetch("/api/clinica/whatsapp", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ numero: "", firebaseIdToken: t }),
            });
          }
        } catch { /* rollback best-effort */ }
      }
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setSenhaMsg("");
    if (novaSenha.length < 6) { setSenhaMsg("A senha precisa ter ao menos 6 caracteres."); return; }
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("Não autenticado");
      await updatePassword(user, novaSenha);
      setSenhaMsg("Senha atualizada com sucesso!");
      setNovaSenha("");
    } catch (err) {
      setSenhaMsg("Erro: " + (err instanceof Error ? err.message : "Tente novamente."));
    }
  }

  if (carregando || abrindoCheckout) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Loader2 className="animate-spin text-brand-400" />
        {abrindoCheckout && <p className="text-sm text-muted">Abrindo o pagamento seguro…</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink">Configurações</h1>
        <p className="text-sm text-muted mt-1">
          O DNA da sua clínica deixa todas as respostas com a sua identidade.
        </p>
      </div>

      {/* ── Dados + DNA ── */}
      <form onSubmit={salvar}>
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
          <SectionHeader icon={Building2} title="Dados da clínica" subtitle="Nome, cidade e WhatsApp" />

          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome da clínica</Label>
                <Input id="nome" value={c.nome_clinica} onChange={(e) => set("nome_clinica", e.target.value)} placeholder="Ex.: Espaço Beleza & Cuidado" />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={c.cidade} onChange={(e) => set("cidade", e.target.value)} placeholder="Ex.: São Paulo - SP" />
              </div>
              <div>
                <Label htmlFor="whats">WhatsApp</Label>
                <Input id="whats" value={c.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label htmlFor="tom">Tom de voz padrão</Label>
                <Select id="tom" value={c.tom_padrao} onChange={(v) => set("tom_padrao", v)} options={tomOptions} />
              </div>
            </div>
          </div>

          {/* Divisor DNA */}
          <div className="flex items-center gap-3 border-y border-brand-100 bg-nude-50 px-5 py-3 sm:px-6">
            <Dna size={16} className="text-brand-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">DNA da Clínica</p>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {/* Formalidade */}
            <div>
              <Label htmlFor="form">Nível de formalidade</Label>
              <input
                id="form"
                type="range"
                min={0}
                max={100}
                step={5}
                value={c.formalidade}
                onChange={(e) => set("formalidade", Number(e.target.value))}
                className="mt-2 w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Bem íntimo</span>
                <span className="font-semibold text-brand-600">{formalidadeLabel(c.formalidade)}</span>
                <span>Formal</span>
              </div>
            </div>

            {/* Como chamar */}
            <div>
              <Label>Como chamar a cliente</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {comoChamarOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("como_chamar", o.value)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      c.como_chamar === o.value
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA preferido */}
            <div>
              <Label htmlFor="cta">CTA preferido</Label>
              <Select id="cta" value={c.cta_preferido} onChange={(v) => set("cta_preferido", v)} options={ctaOptions} />
            </div>

            {/* Procedimentos */}
            <div>
              <Label>Procedimentos que você oferece</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {procedimentos.map((p) => {
                  const ativo = c.procedimentos.includes(p.label);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProc(p.label)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        ativo
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-brand-200 bg-white text-muted hover:bg-nude-100"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-gold-400 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-cta disabled:opacity-60 disabled:translate-y-0"
              >
                {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Salvar DNA
              </button>
              {ok && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <Check size={15} /> Salvo com sucesso!
                </span>
              )}
              <Link
                href="/onboarding"
                className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <Wand2 size={14} /> Refazer o DNA passo a passo
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* ── Plano e pagamento ── */}
      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
        <SectionHeader icon={CreditCard} title="Plano e pagamento" subtitle="Stripe · cobrança segura" />

        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-sm text-muted">
            No lançamento, o Start está disponível. Os demais planos entram por lista de espera.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {billingPlanList.map((plano) => (
              <div
                key={plano.id}
                className={cn(
                  "rounded-2xl border p-4",
                  plano.destaque
                    ? "border-brand-300 bg-gradient-to-br from-nude-50 to-brand-50"
                    : "border-brand-100 bg-nude-50"
                )}
              >
                <p className="text-xs font-medium text-muted">Plano {plano.label}</p>
                <p className="font-serif text-3xl font-semibold text-ink mt-0.5">
                  {plano.priceLabel}
                  <span className="text-sm font-normal text-muted">{plano.periodLabel}</span>
                </p>
                <p className="mt-1 text-xs text-muted">{plano.tagline}</p>
                {plano.disponivel ? (
                  <CheckoutButton plan={plano.id} variant={plano.destaque ? "primary" : "outline"} className="mt-4 w-full">
                    Assinar {plano.label}
                  </CheckoutButton>
                ) : (
                  <p className="mt-4 rounded-xl bg-nude-100 px-3 py-2 text-center text-xs font-medium text-muted">
                    Em breve — lista de espera
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-nude-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Já assinou?</p>
              <p className="mt-0.5 text-xs text-muted">Abra o portal para atualizar cartão ou cancelar.</p>
            </div>
            <BillingPortalButton />
          </div>
        </div>
      </div>

      {/* ── Trocar senha ── */}
      {isFirebaseConfigured && (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
          <SectionHeader icon={KeyRound} title="Trocar senha" />

          <div className="p-5 sm:p-6">
            <form onSubmit={trocarSenha} className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="senha">Nova senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                />
              </div>
              <Button type="submit" variant="outline">Atualizar</Button>
            </form>
            {senhaMsg && (
              <p className={cn("mt-3 text-sm", senhaMsg.startsWith("Erro") ? "text-red-600" : "text-green-600")}>
                {senhaMsg}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
