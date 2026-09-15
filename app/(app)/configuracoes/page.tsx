"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Save, KeyRound, CreditCard, Dna, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { procedimentos } from "@/data/procedimentos";
import { tons } from "@/data/tons";
import { comoChamarOptions, ctaOptions, formalidadeLabel } from "@/data/opcoes";
import {
  getBillingStatus,
  getClinica,
  invalidateClinicaCache,
  saveClinica,
  waitForAuthUser,
  type BillingStatus,
} from "@/lib/store";
import { reconcileBillingClient } from "@/lib/billing-client";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import {
  isClerkClientConfigured,
  isFirebaseConfigured,
  isWebPushConfigured,
} from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnaOnboarding } from "@/components/ana-onboarding";
import { CheckoutButton } from "@/components/checkout-button";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { NotificacoesToggle } from "@/components/notificacoes-toggle";
import { billingPlanList, billingPlans, parseBillingPlan } from "@/lib/billing";
import { getGaClientId, trackEvent } from "@/components/Analytics";

const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-brand-50 bg-navy-800 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-700/10">
        <Icon size={18} className="text-gold-400" />
      </div>
      <div>
        <p className="font-serif text-base font-semibold text-white">{title}</p>
        {subtitle && <p className="text-xs text-champagne-300">{subtitle}</p>}
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
  const [checkoutNotice, setCheckoutNotice] = useState<"sucesso" | "cancelado" | null>(null);
  const [billing, setBilling] = useState<BillingStatus>({ plan: null, status: null, paid: false });
  const [liberandoPlano, setLiberandoPlano] = useState(false);

  useEffect(() => {
    getClinica().then((v) => { setC(v); setCarregando(false); });
    getBillingStatus().then(setBilling);

    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    if (checkoutStatus === "sucesso" || checkoutStatus === "cancelado") {
      setCheckoutNotice(checkoutStatus);
    }
    if (checkoutStatus === "sucesso") {
      // O purchase real vem do webhook assinado do Stripe. Aqui só marcamos
      // retorno de checkout para UX/diagnóstico, sem receita duplicada.
      const sid = params.get("session_id");
      const key = `lb_checkout_returned_${sid ?? "sem_sessao"}`;
      let already = false;
      try {
        already = !!localStorage.getItem(key);
        if (!already) localStorage.setItem(key, "1");
      } catch {
        // localStorage indisponível: dispara mesmo assim.
      }
      if (!already) trackEvent("checkout_returned", { stripe_session_id: sid });
    }
  }, []);

  // Volta do Stripe: o webhook grava `billing` alguns segundos depois. Em vez
  // de pedir "recarregue a página", liga o pagamento (reconcile, caso tenha sido
  // checkout de visitante) e relê o status até o plano aparecer como ativo.
  useEffect(() => {
    if (checkoutNotice !== "sucesso" || !isFirebaseConfigured) return;
    let cancelled = false;
    const esperas = [0, 2000, 4000, 6000, 9000, 13000];
    setLiberandoPlano(true);

    (async () => {
      for (const ms of esperas) {
        if (ms) await new Promise((r) => setTimeout(r, ms));
        if (cancelled) return;
        const user = await waitForAuthUser();
        if (!user) continue;
        const idToken = await user.getIdToken().catch(() => null);
        if (idToken) await reconcileBillingClient(idToken);
        invalidateClinicaCache();
        const status = await getBillingStatus();
        if (cancelled) return;
        setBilling(status);
        if (status.paid) break;
      }
      if (!cancelled) setLiberandoPlano(false);
    })();

    return () => { cancelled = true; };
  }, [checkoutNotice]);

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
        trackEvent("checkout_click", { plan, origem: "funil_pos_cadastro" });
        const firebaseIdToken = await user.getIdToken();
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            plan,
            firebaseIdToken,
            customerEmail: user.email,
            gaClientId: getGaClientId(),
          }),
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
            body: JSON.stringify({ 
              numero: c.whatsapp, 
              zapi_instance_id: c.zapi_instance_id, 
              zapi_token: c.zapi_token, 
              zapi_client_token: c.zapi_client_token, 
              firebaseIdToken 
            }),
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
        } catch (rollbackErr) {
          console.warn("[config] rollback WhatsApp falhou:", rollbackErr instanceof Error ? rollbackErr.message : rollbackErr);
        }
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
        <Loader2 className="animate-spin text-gold-500" />
        {abrindoCheckout && <p className="text-sm text-navy-100">Abrindo o pagamento seguro…</p>}
      </div>
    );
  }

  // Completude do "DNA" — sinaliza o quanto a IA tem pra trabalhar com a cara
  // da clínica. Usa só dados que já existem; nenhum campo novo.
  const dnaCampos = [
    c.nome_clinica.trim(),
    c.cidade.trim(),
    c.whatsapp.trim(),
    c.procedimentos.length > 0 ? "x" : "",
  ];
  const dnaPct = Math.round(
    (dnaCampos.filter(Boolean).length / dnaCampos.length) * 100
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-champagne-300">
          {c.onboarded ? "Configurações" : "Bem-vinda ao LeadBellus"}
        </h1>
        <p className="text-sm text-navy-100 mt-1">
          O DNA da sua clínica deixa todas as respostas com a sua identidade.
        </p>
      </div>

      {/* Ana — guia de onboarding até o DNA ser salvo */}
      {!c.onboarded && (
        <AnaOnboarding dnaPct={dnaPct} nomeClinica={c.nome_clinica.trim() || undefined} />
      )}

      {checkoutNotice === "sucesso" && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-green-300">
            {billing.paid ? <Check size={16} /> : liberandoPlano ? <Loader2 size={16} className="animate-spin" /> : null}
            {billing.paid ? "Pagamento confirmado — seu plano está ativo." : "Pagamento recebido."}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-champagne-300">
            {billing.paid
              ? "Gerações liberadas. Vá para o gerador e responda sua próxima cliente."
              : liberandoPlano
              ? "Liberando seu plano… isso leva só alguns segundos."
              : "Ainda não recebemos a confirmação do Stripe. Recarregue a página em instantes; se continuar assim, fale com suporte@leadbellus.com.br."}
          </p>
        </div>
      )}

      {checkoutNotice === "cancelado" && (
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-gold-300">Pagamento não concluído.</p>
          <p className="mt-1 text-xs leading-relaxed text-champagne-300">
            Nada foi cobrado. Você pode escolher o plano novamente quando quiser.
          </p>
        </div>
      )}

      {/* ── Dados + DNA ── */}
      <form onSubmit={salvar}>
        <div className="overflow-hidden rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
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
                <Label htmlFor="whats">WhatsApp (número da clínica)</Label>
                <Input id="whats" value={c.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(11) 99999-9999" />
              </div>

              {/* Campos avancados para conectar o WhatsApp da clinica. */}
              <div className="sm:col-span-2 border-t border-navy-600 pt-4">
                <Label htmlFor="zapi">Conexão do WhatsApp</Label>
                <p className="text-xs text-navy-100 mb-2">Cole os dados da sua conexão para a LeadBellus receber e responder mensagens automaticamente.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="zapi-inst" className="text-xs">Instance ID</Label>
                    <Input id="zapi-inst" value={c.zapi_instance_id || ""} onChange={(e) => set("zapi_instance_id", e.target.value)} placeholder="Sua instância" />
                  </div>
                  <div>
                    <Label htmlFor="zapi-token" className="text-xs">Token</Label>
                    <Input id="zapi-token" value={c.zapi_token || ""} onChange={(e) => set("zapi_token", e.target.value)} placeholder="Token" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="zapi-client" className="text-xs">Client-Token (se usar)</Label>
                    <Input id="zapi-client" value={c.zapi_client_token || ""} onChange={(e) => set("zapi_client_token", e.target.value)} placeholder="Opcional" type="password" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="tom">Tom de voz padrão</Label>
                <Select id="tom" value={c.tom_padrao} onChange={(v) => set("tom_padrao", v)} options={tomOptions} />
              </div>
            </div>
          </div>

          {/* Divisor DNA */}
          <div className="border-y border-navy-500 bg-navy-800 px-5 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Dna size={16} className="text-gold-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">DNA da Clínica</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                  dnaPct === 100
                    ? "bg-green-500/15 text-green-400"
                    : "bg-gold-500/15 text-gold-400"
                )}
              >
                DNA {dnaPct}% completo
              </span>
            </div>
            <p className="mt-2 text-sm text-navy-100">
              Quanto mais completo, mais a IA responde com a sua cara.
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-[width] duration-500"
                style={{ width: `${dnaPct}%` }}
              />
            </div>
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
                className="mt-2 w-full accent-gold-500"
              />
              <div className="flex justify-between text-xs text-navy-100 mt-1">
                <span>Bem íntimo</span>
                <span className="font-semibold text-gold-400">{formalidadeLabel(c.formalidade)}</span>
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
                        ? "border-brand-500 bg-navy-800 text-white"
                        : "border-navy-500 bg-navy-700 text-champagne-300 hover:bg-navy-700"
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
              <Label>
                Procedimentos que você oferece
                {c.procedimentos.length > 0 && (
                  <span className="ml-1 font-normal text-navy-100">
                    ({c.procedimentos.length} selecionado{c.procedimentos.length > 1 ? "s" : ""})
                  </span>
                )}
              </Label>
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
                          ? "border-brand-500 bg-navy-800 text-white"
                          : "border-navy-500 bg-navy-700 text-navy-100 hover:bg-navy-700"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {erro && <p className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400">{erro}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-navy-800 px-5 py-2.5 text-sm font-bold text-gold-400 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-cta disabled:opacity-60 disabled:translate-y-0"
              >
                {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Salvar DNA
              </button>
              {ok && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400">
                  <Check size={15} /> Salvo com sucesso!
                </span>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* ── Plano e pagamento ── */}
      <div className="overflow-hidden rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
        <SectionHeader icon={CreditCard} title="Plano e pagamento" subtitle="Cobrança segura" />

        <div className="space-y-4 p-5 sm:p-6">
          {billing.paid && billing.plan ? (
            <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3">
              <Check size={18} className="shrink-0 text-green-300" />
              <div>
                <p className="text-sm font-semibold text-green-300">
                  Plano {billingPlans[billing.plan].label} ativo
                </p>
                <p className="text-xs text-champagne-300">
                  Gerações ilimitadas. Cartão e cancelamento pelo portal abaixo.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-navy-100">
              No lançamento, o Start está disponível. Os demais planos entram por lista de espera.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {billingPlanList.map((plano) => (
              <div
                key={plano.id}
                className={cn(
                  "rounded-2xl border p-4",
                  plano.destaque
                    ? "border-gold-500/40 bg-gradient-to-br from-navy-700 to-navy-800"
                    : "border-navy-500 bg-navy-800"
                )}
              >
                <p className="text-xs font-medium text-navy-100">Plano {plano.label}</p>
                <p className="font-serif text-3xl font-semibold text-champagne-300 mt-0.5">
                  {plano.priceLabel}
                  <span className="text-sm font-normal text-navy-100">{plano.periodLabel}</span>
                </p>
                <p className="mt-1 text-xs text-navy-100">{plano.tagline}</p>
                {billing.paid && billing.plan === plano.id ? (
                  <p className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-center text-xs font-semibold text-green-300">
                    <Check size={14} /> Seu plano atual
                  </p>
                ) : plano.disponivel ? (
                  <CheckoutButton plan={plano.id} variant={plano.destaque ? "primary" : "outline"} className="mt-4 w-full">
                    {billing.paid ? `Mudar para ${plano.label}` : `Assinar ${plano.label}`}
                  </CheckoutButton>
                ) : (
                  <p className="mt-4 rounded-xl bg-navy-700 px-3 py-2 text-center text-xs font-medium text-navy-100">
                    Em breve — lista de espera
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-navy-500 bg-navy-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-champagne-300">Já assinou?</p>
              <p className="mt-0.5 text-xs text-navy-100">Abra o portal para atualizar cartão ou cancelar.</p>
            </div>
            <BillingPortalButton />
          </div>
        </div>
      </div>

      {isWebPushConfigured && <NotificacoesToggle />}

      {/* ── Conta e senha ── */}
      {isClerkClientConfigured ? (
        <div className="overflow-hidden rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
          <SectionHeader icon={KeyRound} title="Conta e senha" />

          <div className="p-5 sm:p-6">
            <p className="text-sm text-navy-100">
              Sua conta agora é gerenciada pelo Clerk. Use os fluxos de login,
              recuperação de acesso e provedores sociais do Clerk para alterar
              credenciais.
            </p>
          </div>
        </div>
      ) : isFirebaseConfigured ? (
        <div className="overflow-hidden rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
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
              <p className={cn("mt-3 text-sm", senhaMsg.startsWith("Erro") ? "text-red-400" : "text-green-400")}>
                {senhaMsg}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
