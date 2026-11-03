import { describe, expect, it } from "vitest";
import { agruparRetornos, diasDoProtocolo, etapasDoRetorno, sanitizarCliente } from "@/lib/retornos";
import type { Retorno } from "@/lib/types";

const retorno = (overrides: Partial<Retorno> = {}): Retorno => ({ id: "r1", cliente: "Ana", procedimento: "botox", data_aplicacao: "2026-10-25", dias: [7, 15, 30], enviados: [], created_at: "2026-10-25T12:00:00.000Z", ...overrides });

describe("retornos", () => {
  it("prioriza protocolo da clínica e usa o padrão quando não há override", () => {
    expect(diasDoProtocolo("botox")).toEqual([14]);
    expect(diasDoProtocolo("botox", { protocolos_retorno: { botox: [3, 9] } })).toEqual([3, 9]);
    expect(diasDoProtocolo("limpeza_de_pele")).toEqual([]);
  });
  it("calcula dias locais atravessando mês e preserva enviados", () => {
    expect(etapasDoRetorno(retorno({ data_aplicacao: "2026-10-25", dias: [7, 15], enviados: [7] }), new Date(2026, 10, 9, 23))).toEqual([
      { dia: 7, data: "2026-11-01", status: "enviado" }, { dia: 15, data: "2026-11-09", status: "hoje" },
    ]);
  });
  it("classifica, agrupa, ordena e ignora arquivados", () => {
    const items = [retorno({ id: "future", data_aplicacao: "2026-11-06", dias: [1] }), retorno({ id: "today", data_aplicacao: "2026-11-02", dias: [4] }), retorno({ id: "late", data_aplicacao: "2026-10-20", dias: [1] }), retorno({ id: "archived", arquivado: true })];
    const groups = agruparRetornos(items, new Date(2026, 10, 6));
    expect(groups.atrasados.map((x) => x.id)).toEqual(["late"]);
    expect(groups.hoje.map((x) => x.id)).toEqual(["today"]);
    expect(groups.proximos7dias.map((x) => x.id)).toEqual(["future"]);
  });
  it("sanitiza espaços e limita o nome a 40 caracteres", () => {
    expect(sanitizarCliente("  Ana   Maria ")).toBe("Ana Maria");
    expect(sanitizarCliente("a".repeat(45))).toHaveLength(40);
  });
});
