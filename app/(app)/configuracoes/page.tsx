"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Check, Save, KeyRound, Wand2 } from "lucide-react";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { procedimentos } from "@/data/procedimentos";
import { tons } from "@/data/tons";
import { comoChamarOptions, ctaOptions, formalidadeLabel } from "@/data/opcoes";
import { getClinica, saveClinica } from "@/lib/store";
import { updatePassword } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { cn } from "@/lib/utils";

const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));

export default function ConfiguracoesPage() {
  const [c, setC] = useState<Clinica>(clinicaVazia);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  const [novaSenha, setNovaSenha] = useState("");
  const [senhaMsg, setSenhaMsg] = useState("");

  useEffect(() => {
    getClinica().then((v) => {
      setC(v);
      setCarregando(false);
    });
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
    try {
      await saveClinica({ ...c, onboarded: true });
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setSenhaMsg("");
    if (novaSenha.length < 6) {
      setSenhaMsg("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
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

  if (carregando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Configurações
        </h1>
        <p className="text-sm text-muted">
          O DNA da sua clínica deixa as respostas com a sua cara.
        </p>
      </header>

      <form onSubmit={salvar}>
        <Card>
          <CardBody className="space-y-5">
            <CardTitle>Dados da clínica</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome da clínica</Label>
                <Input
                  id="nome"
                  value={c.nome_clinica}
                  onChange={(e) => set("nome_clinica", e.target.value)}
                  placeholder="Ex.: Espaço Beleza & Cuidado"
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={c.cidade}
                  onChange={(e) => set("cidade", e.target.value)}
                  placeholder="Ex.: São Paulo - SP"
                />
              </div>
              <div>
                <Label htmlFor="whats">WhatsApp</Label>
                <Input
                  id="whats"
                  value={c.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="tom">Tom de voz padrão</Label>
                <Select
                  id="tom"
                  value={c.tom_padrao}
                  onChange={(v) => set("tom_padrao", v)}
                  options={tomOptions}
                />
              </div>
            </div>

            <div className="border-t border-brand-100 pt-4">
              <CardTitle>DNA da Clínica</CardTitle>
            </div>

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
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>Bem íntimo</span>
                <span className="font-medium text-brand-600">
                  {formalidadeLabel(c.formalidade)}
                </span>
                <span>Formal</span>
              </div>
            </div>

            <div>
              <Label>Como chamar a cliente</Label>
              <div className="flex flex-wrap gap-2">
                {comoChamarOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("como_chamar", o.value)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      c.como_chamar === o.value
                        ? "border-brand-400 bg-brand-50 text-brand-600"
                        : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="cta">CTA preferido</Label>
              <Select
                id="cta"
                value={c.cta_preferido}
                onChange={(v) => set("cta_preferido", v)}
                options={ctaOptions}
              />
            </div>

            <div>
              <Label>Procedimentos que você oferece</Label>
              <div className="flex flex-wrap gap-2">
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
                          ? "border-brand-400 bg-brand-50 text-brand-600"
                          : "border-brand-200 bg-white text-muted hover:bg-nude-100"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={salvando}>
                {salvando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Salvar
              </Button>
              {ok && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                  <Check size={16} /> Salvo!
                </span>
              )}
              <Link
                href="/onboarding"
                className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <Wand2 size={15} /> Refazer o DNA passo a passo
              </Link>
            </div>
          </CardBody>
        </Card>
      </form>

      {isFirebaseConfigured && (
        <Card>
          <CardBody className="space-y-4">
            <CardTitle className="flex items-center gap-2">
              <KeyRound size={18} className="text-brand-500" /> Trocar senha
            </CardTitle>
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
              <Button type="submit" variant="outline">
                Atualizar
              </Button>
            </form>
            {senhaMsg && (
              <p
                className={cn(
                  "text-sm",
                  senhaMsg.startsWith("Erro")
                    ? "text-red-600"
                    : "text-green-600"
                )}
              >
                {senhaMsg}
              </p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
