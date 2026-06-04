"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured, siteUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(params.get("erro") || "");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        setErro("E-mail ou senha inválidos.");
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Bem-vinda 💕
          </h1>
          <p className="text-sm text-muted">
            O login fica disponível quando você configurar o Supabase. Por
            enquanto, explore o sistema completo no modo demonstração.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
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
          <h1 className="font-serif text-2xl font-semibold text-ink">Entrar</h1>
          <p className="text-sm text-muted">Que bom te ver de novo!</p>
        </div>

        <form onSubmit={entrar} className="space-y-4">
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
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Entrar
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-brand-100" />
          ou
          <span className="h-px flex-1 bg-brand-100" />
        </div>

        <Button variant="outline" className="w-full" onClick={google}>
          Continuar com Google
        </Button>

        <p className="text-center text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/signup" className="font-medium text-brand-600">
            Criar conta
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
