"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { saveClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";
import type { BillingPlan } from "@/lib/billing";
import { trackEvent } from "@/components/Analytics";
import { reconcileBillingClient } from "@/lib/billing-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function setAuthCookie() {
  document.cookie = "firebase_auth=1; path=/; SameSite=Lax; max-age=604800";
}

async function notifyOpsSignup(idToken: string) {
  await fetch("/api/notify/signup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ event: "signup.created" }),
  }).catch(() => {});
}

function loadDnaDraft(): Partial<Clinica> | null {
  try {
    const raw = window.localStorage.getItem("lb_dna_draft");
    return raw ? (JSON.parse(raw) as Partial<Clinica>) : null;
  } catch {
    return null;
  }
}

type VisualAuthPanelProps = {
  mode: "login" | "signup";
  plan?: BillingPlan;
  checkoutAfter?: boolean;
  clinicName?: string;
  previewMessage?: string;
  onSuccess?: () => void;
  next?: string;
  compact?: boolean;
};

export function VisualAuthPanel({
  mode,
  plan,
  checkoutAfter = false,
  clinicName = "",
  previewMessage = "",
  onSuccess,
  next = "/dashboard",
  compact = false,
}: VisualAuthPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const nome =
    clinicName.trim() ||
    loadDnaDraft()?.nome_clinica?.trim() ||
    "sua clínica";

  const preview =
    previewMessage.trim() ||
    "Oi, linda! O valor do botox depende do seu objetivo — cada rosto é único. Quer que eu reserve sua avaliação pra você decidir com calma? 💛";

  async function persistDraft() {
    const draft = loadDnaDraft();
    if (draft?.nome_clinica?.trim()) {
      await saveClinica({ ...clinicaVazia, ...draft, onboarded: true });
    }
  }

  async function finishAuth(idToken: string) {
    await reconcileBillingClient(idToken);
    if (onSuccess) {
      onSuccess();
      return;
    }
    if (checkoutAfter && plan) {
      router.push(`/configuracoes?plan=${plan}&next=checkout`);
      router.refresh();
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        senha
      );
      setAuthCookie();
      await finishAuth(await credential.user.getIdToken());
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        senha
      );
      setAuthCookie();
      const idToken = await credential.user.getIdToken();
      notifyOpsSignup(idToken);
      trackEvent("sign_up", { method: "Email/Password" });
      await persistDraft();
      await finishAuth(idToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setErro(
        msg.includes("email-already-in-use")
          ? "Este e-mail já está cadastrado."
          : "Não foi possível criar a conta."
      );
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setErro("");
    setLoading(true);
    try {
      const credential = await signInWithPopup(
        getFirebaseAuth(),
        new GoogleAuthProvider()
      );
      setAuthCookie();
      const idToken = await credential.user.getIdToken();
      if (mode === "signup") {
        notifyOpsSignup(idToken);
        trackEvent("sign_up", { method: "Google" });
        await persistDraft();
      }
      await finishAuth(idToken);
    } catch {
      setErro("Não foi possível continuar com o Google.");
    } finally {
      setLoading(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <Button className="w-full" onClick={() => router.push("/dashboard")}>
        Entrar no modo demonstração
      </Button>
    );
  }

  const isSignup = mode === "signup";

  // Preserva o funil (plano escolhido + retomar checkout pós-login) ao
  // alternar entre /signup e /login.
  const switchQuery = plan
    ? `?plan=${plan}${checkoutAfter ? "&next=checkout" : ""}`
    : "";

  return (
    <div className={compact ? "space-y-4" : "grid gap-6 md:grid-cols-2"}>
      {!compact && (
        <div className="flex flex-col justify-center rounded-3xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Sua resposta no WhatsApp
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">{nome}</p>
          <div className="mt-4 rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
            {preview}
          </div>
          <ul className="mt-4 space-y-2 text-xs text-muted">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-brand-500" />
              Você já viu o valor — agora só falta liberar o acesso
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-brand-500" />
              Sem WhatsApp conectado: copia e cola no celular
            </li>
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            {isSignup ? "Só falta sua conta" : "Bem-vinda de volta"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {isSignup
              ? "E-mail e senha só para pagar e entrar. Nada disso bloqueia o teste."
              : "Entre para continuar de onde parou."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={google}
          disabled={loading}
        >
          Continuar com Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-brand-100" />
          ou e-mail
          <span className="h-px flex-1 bg-brand-100" />
        </div>

        <form onSubmit={isSignup ? cadastrar : entrar} className="space-y-3">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
          />
          <Input
            type="password"
            required
            minLength={isSignup ? 6 : undefined}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder={isSignup ? "senha (mín. 6)" : "sua senha"}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isSignup
              ? checkoutAfter
                ? "Criar conta e pagar"
                : "Criar conta"
              : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          {isSignup ? (
            <>
              Já tem conta?{" "}
              <Link href={`/login${switchQuery}`} className="font-medium text-gold-400 hover:text-gold-300">
                Entrar
              </Link>
            </>
          ) : (
            <>
              Primeira vez?{" "}
              <Link href={`/signup${switchQuery}`} className="font-medium text-gold-400 hover:text-gold-300">
                Testar grátis
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}