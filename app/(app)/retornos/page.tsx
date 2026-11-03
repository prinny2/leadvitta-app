"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormSection } from "@/components/form-section";
import { CopyButton } from "@/components/copy-button";
import { ErrorBanner } from "@/components/error-banner";
import { AvisoIA } from "@/components/aviso-ia";
import { LoadingRespostas } from "@/components/loading-respostas";
import { trackEvent } from "@/components/Analytics";
import { procedimentos } from "@/data/procedimentos";
import { protocolosRetorno, objetivosRetorno } from "@/data/protocolos-retorno";
import { useClinica, buildClinicaDnaPayload } from "@/lib/hooks/use-clinica";
import { addRetorno, arquivarRetorno, getClinica, listRetornos, marcarEtapaEnviada, saveClinica } from "@/lib/store";
import { agruparRetornos, diasDoProtocolo, nomeProcedimento, sanitizarCliente, type RetornoAgrupado } from "@/lib/retornos";
import type { Retorno } from "@/lib/types";

const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const dataCurta = (iso: string) => { const [a,m,d] = iso.split("-"); return `${d}/${m}`; };

export default function RetornosPage() {
  const { clinica } = useClinica();
  const [retornos, setRetornos] = useState<Retorno[]>([]);
  const [cliente, setCliente] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [data, setData] = useState(hojeISO);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Record<string, string[]>>({});
  const [aviso, setAviso] = useState("");
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [draftProtocol, setDraftProtocol] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => setRetornos(await listRetornos()), []);
  useEffect(() => { carregar().catch(() => setErro("Não foi possível carregar os retornos.")); }, [carregar]);
  useEffect(() => {
    const drafts: Record<string, string> = {};
    procedimentos.forEach((p) => { drafts[p.id] = diasDoProtocolo(p.id, clinica).join(", "); });
    setDraftProtocol(drafts);
  }, [clinica]);
  const opcoes = useMemo(() => {
    const oferecidos = procedimentos.filter((p) => clinica.procedimentos.includes(p.id));
    const demais = procedimentos.filter((p) => !clinica.procedimentos.includes(p.id));
    return [...oferecidos, ...demais].map((p) => ({ value: p.id, label: p.label }));
  }, [clinica.procedimentos]);
  const dias = diasDoProtocolo(procedimento, clinica);
  const grupos = agruparRetornos(retornos, new Date());

  async function criar() {
    setErro("");
    if (!sanitizarCliente(cliente) || !procedimento || !data) { setErro("Preencha cliente, procedimento e data da aplicação."); return; }
    setSaving(true);
    try {
      await addRetorno({ cliente: sanitizarCliente(cliente), procedimento, data_aplicacao: data, dias });
      trackEvent("retorno_criado", { procedimento });
      setCliente(""); await carregar();
    } catch { setErro("Não foi possível salvar a aplicação."); } finally { setSaving(false); }
  }

  async function gerar(item: RetornoAgrupado) {
    const key = `${item.id}-${item.etapa.dia}`;
    setBusy(key); setErro(""); setOpenId(key); setAviso("");
    const [ano, mes, dia] = item.data_aplicacao.split("-");
    const objetivo = objetivosRetorno(item.procedimento, [item.etapa.dia])[0];
    try {
      const response = await fetch("/api/follow-up", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        gatilho: "retorno_procedimento", procedimento: item.procedimento, nomeCliente: item.cliente,
        contexto: `Aplicação de ${nomeProcedimento(item.procedimento)} em ${dia}/${mes}. Hoje é o dia ${item.etapa.dia} após a aplicação. Objetivo deste retorno: ${objetivo}`,
        tom: clinica.tom_padrao, clinica: buildClinicaDnaPayload(clinica),
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Falha ao gerar mensagens.");
      setMensagens((m) => ({ ...m, [key]: result.mensagens })); setAviso(result.aviso ?? "");
      trackEvent("retorno_gerado", { dia: item.etapa.dia });
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível gerar as mensagens."); }
    finally { setBusy(null); }
  }

  async function salvarProtocolo() {
    const protocolos: Record<string, number[]> = {};
    for (const p of procedimentos) {
      const text = draftProtocol[p.id]?.trim() ?? "";
      const parsed = text ? text.split(",").map((n) => Number(n.trim())) : [];
      if (parsed.some((n) => !Number.isInteger(n) || n < 1) || parsed.length > 6) { setErro(`Revise os dias de ${p.label}. Use até 6 números positivos separados por vírgula.`); return; }
      if (parsed.length) protocolos[p.id] = [...new Set(parsed)].sort((a,b) => a-b);
    }
    try { await saveClinica({ ...clinica, protocolos_retorno: protocolos }); setErro(""); } catch { setErro("Não foi possível salvar o protocolo."); }
  }

  async function marcar(item: RetornoAgrupado) { await marcarEtapaEnviada(item.id, item.etapa.dia); await carregar(); }
  async function arquivar(item: RetornoAgrupado) { await arquivarRetorno(item.id); await carregar(); }

  const seções: [string, RetornoAgrupado[]][] = [["Atrasados", grupos.atrasados], ["Hoje", grupos.hoje], ["Próximos 7 dias", grupos.proximos7dias]];
  return <div className="space-y-6 animate-fade-in">
    <header><h1 className="font-serif text-3xl font-semibold text-champagne-300">Retornos</h1><p className="mt-1 text-sm text-navy-100">Acompanhe cada aplicação e prepare mensagens para a equipe revisar e enviar pelo WhatsApp.</p></header>
    <FormSection titulo="Nova aplicação">
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor="cliente-retorno">Cliente</Label><Input id="cliente-retorno" placeholder="Primeiro nome ou apelido" maxLength={40} value={cliente} onChange={(e) => setCliente(e.target.value)} /></div>
        <div><Label htmlFor="proc-retorno">Procedimento</Label><Select id="proc-retorno" value={procedimento} onChange={setProcedimento} options={opcoes} placeholder="Selecione..." /></div>
        <div><Label htmlFor="data-retorno">Data da aplicação</Label><Input id="data-retorno" type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
      </div>
      <p className="text-xs text-navy-100">Use só o primeiro nome ou um apelido. Não coloque telefone nem informações de saúde.</p>
      {procedimento && <p className="text-sm text-champagne-300">Retornos criados: {dias.length ? dias.map((d) => `dia ${d}`).join(" · ") : "nenhum dia padrão (configure o protocolo abaixo)"}</p>}
      <ErrorBanner message={erro} />
      <button onClick={criar} disabled={saving} className="flex items-center gap-2 rounded-xl bg-navy-800 px-4 py-3 text-sm font-bold text-gold-400 disabled:opacity-60">{saving ? <Loader2 size={17} className="animate-spin" /> : <CalendarClock size={17} />} Registrar aplicação</button>
    </FormSection>
    <section className="space-y-4">
      {retornos.length === 0 && <p className="text-sm text-navy-100">Registre uma aplicação; o protocolo organiza os dias de contato para a equipe preparar cada retorno.</p>}
      {seções.map(([titulo, itens]) => <div key={titulo} className="space-y-3"><h2 className="font-serif text-xl text-champagne-300">{titulo}</h2>{itens.length === 0 ? <p className="text-sm text-navy-100">Nenhum retorno.</p> : itens.map((item) => {
        const key = `${item.id}-${item.etapa.dia}`;
        return <article key={key} className="rounded-2xl border border-navy-500 bg-navy-700 p-4 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-champagne-300">{item.cliente} · {nomeProcedimento(item.procedimento)} · dia {item.etapa.dia} · {dataCurta(item.etapa.data)}</p><div className="flex flex-wrap gap-2"><button onClick={() => gerar(item)} disabled={busy !== null} className="flex items-center gap-2 rounded-lg bg-navy-800 px-3 py-2 text-xs font-bold text-gold-400 disabled:opacity-50">{busy === key ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Gerar 3 mensagens</button><button onClick={() => marcar(item)} className="rounded-lg border border-navy-500 px-3 py-2 text-xs text-champagne-300">Marcar como enviado</button><button onClick={() => arquivar(item)} className="rounded-lg border border-navy-500 px-3 py-2 text-xs text-navy-100">Arquivar</button></div></div>
          {openId === key && <><AvisoIA aviso={aviso} />{busy === key && <LoadingRespostas etapas={["Preparando o contexto do retorno…", "Escrevendo opções cuidadosas…", "Conferindo as mensagens…"]} />}{mensagens[key]?.map((m, i) => <div key={i} className="rounded-xl border border-navy-500 p-3"><div className="mb-2 flex justify-between text-sm text-champagne-300"><span>{["Suave", "Consultiva", "Fechamento"][i] ?? `Opção ${i+1}`}</span><CopyButton text={m} /></div><p className="whitespace-pre-wrap text-sm text-champagne-300">{m}</p></div>)}</>}</article>;
      })}</div>)}
    </section>
    <section className="rounded-2xl border border-navy-500 bg-navy-700 p-4"><button className="w-full text-left font-medium text-champagne-300" onClick={() => setProtocolOpen((v) => !v)}>Protocolo da clínica {protocolOpen ? "−" : "+"}</button>{protocolOpen && <div className="mt-4 space-y-3">{procedimentos.filter((p) => clinica.procedimentos.length === 0 || clinica.procedimentos.includes(p.id)).map((p) => <div key={p.id} className="grid gap-2 sm:grid-cols-[1fr_200px] sm:items-center"><Label htmlFor={`dias-${p.id}`}>{p.label}</Label><Input id={`dias-${p.id}`} value={draftProtocol[p.id] ?? ""} onChange={(e) => setDraftProtocol((d) => ({ ...d, [p.id]: e.target.value }))} placeholder={protocolosRetorno[p.id]?.map((x) => x.dia).join(", ") ?? "Sem padrão"} /></div>)}<p className="text-xs text-navy-100">Dias separados por vírgula; campo vazio remove o padrão sugerido.</p><button onClick={salvarProtocolo} className="rounded-xl bg-navy-800 px-4 py-2 text-sm font-bold text-gold-400">Salvar protocolo</button></div>}</section>
  </div>;
}
