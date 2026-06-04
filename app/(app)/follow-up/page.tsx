"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, Info, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ResponseCard } from "@/components/response-card";
import { AvisoIA } from "@/components/aviso-ia";
import { LoadingRespostas } from "@/components/loading-respostas";
import { EmptyState } from "@/components/empty-state";
import { followups } from "@/data/followups";
import { procedimentos } from "@/data/procedimentos";
import { tons } from "@/data/tons";
import { followupContextoOptions } from "@/data/opcoes";
import { addHistorico } from "@/lib/store";
import { useClinica } from "@/lib/hooks/use-clinica";

const fupOptions = followups.map((f) => ({ value: f.id, label: f.label }));
const procOptions = procedimentos.map((p) => ({ value: p.id, label: p.label }));
const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));

export default function FollowUpPage() {
  const { clinica } = useClinica();
  const [gatilho, setGatilho] = useState("sumiu_1d");
  const [contexto, setContexto] = useState("ela disse que ia pensar");
  const [procedimento, setProcedimento] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [tom, setTom] = useState("acolhedor");
  const [nomeCliente, setNomeCliente] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [mensagens, setMensagens] = useState<string[] | null>(null);

  useEffect(() => {
    if (clinica?.tom_padrao) setTom(clinica.tom_padrao);
  }, [clinica]);

  async function gerar() {
    setLoading(true);
    setErro("");
    setAviso("");
    setMensagens(null);
    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatilho,
          contexto,
          detalhe,
          procedimento,
          tom,
          nomeCliente,
          clinica: clinica
            ? {
                nome_clinica: clinica.nome_clinica,
                cidade: clinica.cidade,
                como_chamar: clinica.como_chamar,
                formalidade: clinica.formalidade,
                cta_preferido: clinica.cta_preferido,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível gerar agora.");
        return;
      }
      setMensagens(data.mensagens);
      if (data.mock) {
        setAviso(
          data.aviso ||
            "Exemplo de demonstração — configure a chave da IA para mensagens reais."
        );
      } else if (data.aviso) {
        setAviso(data.aviso);
      }
      addHistorico({
        tipo: "follow_up",
        contexto: { gatilho, contexto, procedimento, tom, nomeCliente },
        respostas: data.mensagens,
      }).catch(() => {});
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Follow-up Inteligente
        </h1>
        <p className="text-sm text-muted">
          A maioria das vendas se perde por falta de follow-up. Reative quem
          sumiu sem parecer insistente.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="gat">Sumiu há quanto tempo?</Label>
                <Select id="gat" value={gatilho} onChange={setGatilho} options={fupOptions} />
              </div>
              <div>
                <Label htmlFor="ctx">O que aconteceu antes?</Label>
                <Select
                  id="ctx"
                  value={contexto}
                  onChange={setContexto}
                  options={followupContextoOptions}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome da cliente (opcional)</Label>
                <Input id="nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Ex.: Ana" />
              </div>
              <div>
                <Label htmlFor="proc">Procedimento de interesse</Label>
                <Select id="proc" value={procedimento} onChange={setProcedimento} options={procOptions} placeholder="Selecione..." />
              </div>
            </div>

            <div>
              <Label htmlFor="tom">Tom da mensagem</Label>
              <Select id="tom" value={tom} onChange={setTom} options={tomOptions} />
            </div>

            <div>
              <Label htmlFor="det">Detalhe adicional (opcional)</Label>
              <Textarea
                id="det"
                value={detalhe}
                onChange={(e) => setDetalhe(e.target.value)}
                placeholder="Ex.: ela pediu orçamento de preenchimento e disse que ia ver com o marido."
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <Button onClick={gerar} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Gerar follow-ups
            </Button>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <AvisoIA aviso={aviso} />

          {loading && <LoadingRespostas mensagem="Preparando mensagens de reativação..." />}

          {!loading &&
            mensagens &&
            mensagens.map((m, i) => (
              <ResponseCard
                key={i}
                titulo={`Mensagem ${i + 1}`}
                descricao={i === 0 ? "Mais suave" : i === mensagens.length - 1 ? "Mais direta" : "Intermediária"}
                texto={m}
                accent={i % 2 === 1 ? "lavender" : "brand"}
              />
            ))}

          {!loading && !mensagens && (
            <EmptyState
              icon={Clock}
              mensagem={
                <>
                  Escolha o tempo e o contexto e gere 3 mensagens prontas para
                  reativar a conversa.
                </>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
