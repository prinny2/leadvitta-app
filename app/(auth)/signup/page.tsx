"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { isSupabaseConfigured, siteUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmar, setConfirmar] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) {
        setErro(error.message || "Não foi possível criar a conta.");
        return;
      }
      if (data.session) {
        router.push("/configuracoes");
        router.refresh();
      } else {
        setConfirmar(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Criar conta
          </h1>
          <p className="text-sm text-muted">
            O cadastro fica disponível quando você configurar o Supabase. Por
            enquanto, explore tudo no modo demonstração.
          </p>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Entrar no modo demonstração
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (confirmar) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <MailCheck size={24} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Confirme seu e-mail
          </h1>
          <p className="text-sm text-muted">
            Enviamos um link de confirmação para <strong>{email}</strong>. Após
            confirmar, é só entrar.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Ir para o login
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
