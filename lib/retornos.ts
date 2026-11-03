import { procedimentos } from "@/data/procedimentos";
import { protocolosRetorno } from "@/data/protocolos-retorno";
import type { Clinica, Retorno } from "@/lib/types";

export type EtapaRetorno = { dia: number; data: string; status: "enviado" | "hoje" | "atrasado" | "futuro" };
export type RetornoAgrupado = Retorno & { etapa: EtapaRetorno };

export function diasDoProtocolo(procedimento: string, clinica?: Pick<Clinica, "protocolos_retorno"> | null): number[] {
  return clinica?.protocolos_retorno?.[procedimento] ?? protocolosRetorno[procedimento]?.map(({ dia }) => dia) ?? [];
}

function dataLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function adicionarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const date = new Date(ano, mes - 1, dia + dias);
  return dataLocal(date);
}

export function etapasDoRetorno(retorno: Retorno, hoje: Date): EtapaRetorno[] {
  const hojeString = dataLocal(hoje);
  return retorno.dias.map((dia) => {
    const data = adicionarDias(retorno.data_aplicacao, dia);
    const enviado = retorno.enviados.includes(dia);
    return { dia, data, status: enviado ? "enviado" : data === hojeString ? "hoje" : data < hojeString ? "atrasado" : "futuro" };
  });
}

export function agruparRetornos(retornos: Retorno[], hoje: Date): { atrasados: RetornoAgrupado[]; hoje: RetornoAgrupado[]; proximos7dias: RetornoAgrupado[] } {
  const grupos = { atrasados: [] as RetornoAgrupado[], hoje: [] as RetornoAgrupado[], proximos7dias: [] as RetornoAgrupado[] };
  const hojeString = dataLocal(hoje);
  const limite = adicionarDias(hojeString, 7);
  for (const retorno of retornos) {
    if (retorno.arquivado) continue;
    for (const etapa of etapasDoRetorno(retorno, hoje)) {
      const item = { ...retorno, etapa };
      if (etapa.status === "atrasado") grupos.atrasados.push(item);
      else if (etapa.status === "hoje") grupos.hoje.push(item);
      else if (etapa.status === "futuro" && etapa.data <= limite) grupos.proximos7dias.push(item);
    }
  }
  for (const lista of Object.values(grupos)) lista.sort((a, b) => a.etapa.data.localeCompare(b.etapa.data));
  return grupos;
}

export function sanitizarCliente(nome: string): string {
  return nome.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function nomeProcedimento(id: string): string { return procedimentos.find((p) => p.id === id)?.label ?? id; }
