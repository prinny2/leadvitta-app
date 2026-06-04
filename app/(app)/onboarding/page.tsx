"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { procedimentos } from "@/data/procedimentos";
import { comoChamarOptions, ctaOptions, formalidadeLabel } from "@/data/opcoes";
import { getClinica, saveClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { cn } from "@/lib/utils";

const TOTAL = 5;

function exemploAbertura(comoChamar: string): string {
  switch (comoChamar) {
    case "amor":
      return "“Oi, amor! Te explico sim 😊...”";
    case "nome":
      return "“Oi, Ana! Te explico sim 😊...”";
    case "nenhum":
      return "“Oi, tudo bem? Te explico sim 😊...”";
    default:
      return "“Oi, linda! Te explico sim 😊...”";
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [c, setC] = useState<Clinica>(clinicaVazia);
  const [step, setStep] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

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

  async function concluir(onboarded = true) {
    setSalvando(true);
    try {
      await saveClinica({ ...c, onboarded });
      router.push("/gerador");
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-brand-400" />
      </div>
    );
  }

  const podeAvancar = step === 0 ? c.nome_clinica.trim().length > 0 : true;

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6 text-center">
        <LogoMark size={22} className="mx-auto mb-3 h-12 w-12 rounded-2xl" />
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Vamos criar o DNA da sua clínica
        </h1>
        <p className="text-sm text-muted">
          5 perguntas rápidas para a IA responder como{" "}
          <strong>você</strong> — não como um robô.
        </p>
      </header>

      {/* progresso */}
      <div className="mb-5 flex gap-1.5">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-brand-400" : "bg-brand-100"
            )}
          />
        ))}
      </div>

      <Card>
        <CardBody className="space-y-5">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Seu nome ou o nome da clínica</Label>
                <Input
                  id="nome"
                  value={c.nome_clinica}
                  onChange={(e) => set("nome_clinica", e.target.value)}
                  placeholder="Ex.: Espaço Beleza & Cuidado"
                  autoFocus
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
            </div>
          )}

          {step === 1 && (
            <div>
              <Label>Quais procedimentos você oferece?</Label>
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
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label htmlFor="form">Como você prefere falar com as clientes?</Label>
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
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label>Como você costuma chamar suas clientes?</Label>
              <div className="grid grid-cols-2 gap-2">
                {comoChamarOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("como_chamar", o.value)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      c.como_chamar === o.value
                        ? "border-brand-400 bg-brand-50 text-brand-600"
                        : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-nude-100 px-3 py-2 text-sm text-muted">
                Prévia: {exemploAbertura(c.como_chamar)}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <Label>Qual chamada para ação você mais usa?</Label>
              <div className="space-y-2">
                {ctaOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("cta_preferido", o.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      c.cta_preferido === o.value
                        ? "border-brand-400 bg-brand-50 text-brand-600"
                        : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                    )}
                  >
                    <Sparkles size={15} /> {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* navegação */}
          <div className="flex items-center justify-between pt-2">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={16} /> Voltar
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => concluir(true)}
                className="text-sm text-muted hover:text-ink"
              >
                Pular por agora
              </button>
            )}

            {step < TOTAL - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!podeAvancar}
              >
                Continuar <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={() => concluir(true)} disabled={salvando}>
                {salvando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Concluir
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
