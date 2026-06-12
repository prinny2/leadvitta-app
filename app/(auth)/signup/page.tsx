"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { saveClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { trackEvent } from "@/components/Analytics";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function setAuthCookie() {
  document.cookie = "firebase_auth=1; path=/; SameSite=Lax; max-age=604800";
}

async function notifyZapierSignup(idToken: string) {
  await fetch("/api/zapier/lead", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ event: "signup.created" }),
  }).catch(() => {
    // Zapier é automação auxiliar; cadastro não deve falhar por isso.
  });
}

export default function SignupPage() {
  const router = useRouter();
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const finalizandoCompra = !!planoSelecionado;
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setPlanoSelecionado(
      new URLSearchParams(window.location.search).get("plan") || ""
    );
  }, []);

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
      notifyZapierSignup(await credential.user.getIdToken());
      trackEvent("sign_up", { method: "Email/Password" });
      // O DNA montado no funil público fica em localStorage ("lb_dna_draft").
      // Persiste na conta recém-criada AGORA — senão quem vem de /signup?plan
      // pula o onboarding e faz checkout com o perfil vazio (respostas genéricas).
      try {
        const raw = window.localStorage.getItem("lb_dna_draft");
        if (raw) {
          const draft = JSON.parse(raw) as Partial<Clinica>;
          if (draft?.nome_clinica?.trim()) {
            await saveClinica({ ...clinicaVazia, ...draft, onboarded: true });
          }
        }
      } catch (draftErr) {
        // Não bloqueia o cadastro/checkout; o onboarding/configurações cobre depois.
        console.warn("[signup] não foi possível persistir o DNA do funil:", draftErr);
      }
      // Se veio de um plano escolhido na landing (/signup?plan=...),
      // leva o plano adiante pra concluir o checkout em /configuracoes.
      // Sem plano: primeiro o DNA da clínica (onboarding) — sem ele as
      // respostas saem genéricas e a usuária acha que o produto é ruim.
      const plano = new URLSearchParams(window.location.search).get("plan");
      router.push(plano ? `/configuracoes?plan=${plano}` : "/onboarding");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setErro("Este e-mail já está cadastrado.");
      } else {
        setErro("Não foi possível criar a conta.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Criar conta
          </h1>
          <p className="text-sm text-muted">
            O cadastro fica disponível quando você configurar o Firebase. Por
            enquanto, explore tudo no modo demonstração.
          </p>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Entrar no modo demonstração
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            {finalizandoCompra ? "Criar conta para assinar" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted">
            {finalizandoCompra
              ? "Só precisamos da sua conta para vincular o pagamento e liberar seu acesso."
              : "Comece a responder melhor hoje mesmo."}
          </p>
        </div>

        <form onSubmit={cadastrar} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {finalizandoCompra ? "Criar conta e continuar" : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand-600">
            Entrar
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
