import { describe, it, expect } from "vitest";
import { calcularDashboard } from "@/lib/dashboard-stats";
import type { HistoricoItem } from "@/lib/types";

const agora = new Date(2026, 10, 3, 15, 0); // 03/11/2026 15h (local)

function item(dia: Date, extra: Partial<HistoricoItem> = {}): HistoricoItem {
  return {
    id: Math.random().toString(36).slice(2),
    tipo: "gerador",
    contexto: { procedimento: "botox", situacao: "preco" },
    respostas: ["a", "b", "c"],
    created_at: dia.toISOString(),
    ...extra,
  };
}

describe("calcularDashboard", () => {
  it("conta nova: tudo zerado, sem números inventados", () => {
    const s = calcularDashboard([], agora);
    expect(s.hoje).toBe(0);
    expect(s.totalSemana).toBe(0);
    expect(s.scoreMedioSemana).toBeNull();
    expect(s.leads).toEqual({ quentes: 0, mornos: 0, frias: 0 });
    expect(s.procedimentos).toEqual([]);
    expect(s.semana).toHaveLength(7);
    expect(s.semana.every((d) => d.respostas === 0)).toBe(true);
  });

  it("separa hoje, ontem e a semana; fora de 7 dias não entra", () => {
    const s = calcularDashboard(
      [
        item(new Date(2026, 10, 3, 9)),
        item(new Date(2026, 10, 3, 14)),
        item(new Date(2026, 10, 2, 20)),
        item(new Date(2026, 9, 20, 10)), // 14 dias atrás
      ],
      agora
    );
    expect(s.hoje).toBe(2);
    expect(s.ontem).toBe(1);
    expect(s.totalSemana).toBe(3);
    expect(s.semana[6]).toMatchObject({ respostas: 2 }); // último = hoje
  });

  it("temperatura e score médio vêm do score salvo", () => {
    const s = calcularDashboard(
      [
        item(new Date(2026, 10, 3, 9), { score: 90 }),
        item(new Date(2026, 10, 3, 10), { score: 50 }),
        item(new Date(2026, 10, 3, 11), { score: 10 }),
        item(new Date(2026, 10, 3, 12)), // sem score: não conta
      ],
      agora
    );
    expect(s.leads).toEqual({ quentes: 1, mornos: 1, frias: 1 });
    expect(s.scoreMedioSemana).toBe(50);
  });

  it("conta follow-ups e ranqueia procedimentos e situações com rótulo", () => {
    const s = calcularDashboard(
      [
        item(new Date(2026, 10, 3, 9), { tipo: "follow_up" }),
        item(new Date(2026, 10, 3, 10), { contexto: { procedimento: "preenchimento_labial", situacao: "achou_caro" } }),
        item(new Date(2026, 10, 3, 11)),
      ],
      agora
    );
    expect(s.followUpsSemana).toBe(1);
    expect(s.procedimentos[0]).toEqual({ nome: "Botox (toxina botulínica)", qtd: 2 });
    expect(s.situacoes[0]).toEqual({ sit: "Perguntou o preço", qtd: 2 });
  });
});
