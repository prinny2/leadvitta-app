// Números do dashboard calculados a partir do histórico REAL da clínica.
// Antes o dashboard mostrava valores fixos (12 respostas hoje, 3 leads quentes…),
// o que confundia quem acabou de criar a conta.
import { procedimentoPorId } from "@/data/procedimentos";
import { situacoes } from "@/data/situacoes";
import type { HistoricoItem } from "@/lib/types";

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type DashboardStats = {
  hoje: number;
  ontem: number;
  semana: { dia: string; respostas: number; score: number | null }[];
  totalSemana: number;
  followUpsSemana: number;
  scoreMedioSemana: number | null;
  leads: { quentes: number; mornos: number; frias: number };
  procedimentos: { nome: string; qtd: number }[];
  situacoes: { sit: string; qtd: number }[];
};

/** Chave de dia local (YYYY-MM-DD) — evita o UTC de toISOString(). */
function diaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function contar<T extends string>(valores: T[], limite: number) {
  const mapa = new Map<T, number>();
  for (const v of valores) mapa.set(v, (mapa.get(v) ?? 0) + 1);
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, limite);
}

export function calcularDashboard(itens: HistoricoItem[], agora: Date = new Date()): DashboardStats {
  const hoje = diaLocal(agora);
  const ontemDate = new Date(agora);
  ontemDate.setDate(agora.getDate() - 1);
  const ontem = diaLocal(ontemDate);

  // Últimos 7 dias, do mais antigo para hoje.
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(agora);
    d.setDate(agora.getDate() - (6 - i));
    return { chave: diaLocal(d), dia: DIAS_CURTOS[d.getDay()] };
  });
  const chavesSemana = new Set(dias.map((d) => d.chave));

  const comDia = itens
    .map((item) => ({ item, dia: diaLocal(new Date(item.created_at)) }))
    .filter(({ item }) => !Number.isNaN(new Date(item.created_at).getTime()));
  const daSemana = comDia.filter(({ dia }) => chavesSemana.has(dia)).map(({ item }) => item);

  const scoresSemana = daSemana.map((i) => i.score).filter((s): s is number => typeof s === "number");
  const media = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

  // Mesmos cortes dos selos do app (lib/conversas.ts): 🔥 >70 · 🌤️ >40 · ❄️ resto.
  const leads = { quentes: 0, mornos: 0, frias: 0 };
  for (const s of scoresSemana) {
    if (s > 70) leads.quentes += 1;
    else if (s > 40) leads.mornos += 1;
    else leads.frias += 1;
  }

  const procs = daSemana
    .map((i) => String(i.contexto?.procedimento ?? ""))
    .filter(Boolean);
  const sits = daSemana
    .map((i) => String(i.contexto?.situacao ?? ""))
    .filter(Boolean);

  return {
    hoje: comDia.filter(({ dia }) => dia === hoje).length,
    ontem: comDia.filter(({ dia }) => dia === ontem).length,
    semana: dias.map(({ chave, dia }) => {
      const doDia = daSemana.filter((i) => diaLocal(new Date(i.created_at)) === chave);
      return {
        dia,
        respostas: doDia.length,
        score: media(doDia.map((i) => i.score).filter((s): s is number => typeof s === "number")),
      };
    }),
    totalSemana: daSemana.length,
    followUpsSemana: daSemana.filter((i) => i.tipo === "follow_up").length,
    scoreMedioSemana: media(scoresSemana),
    leads,
    procedimentos: contar(procs, 6).map(([id, qtd]) => ({ nome: procedimentoPorId(id)?.label ?? id, qtd })),
    situacoes: contar(sits, 5).map(([id, qtd]) => ({ sit: situacoes.find((s) => s.id === id)?.label ?? id, qtd })),
  };
}
