"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function setAuthCookie() {
  document.cookie = "firebase_auth=1; path=/; SameSite=Lax; max-age=604800";
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, senha);
      setAuthCookie();
      router.push("/configuracoes");
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
            Criar conta
          </h1>
          <p className="text-sm text-muted">
            Comece a responder melhor hoje mesmo.
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
            Criar conta
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
