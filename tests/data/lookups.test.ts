import { describe, it, expect } from "vitest";
import {
  procedimentos,
  procedimentoPorId,
  procedimentosLabels,
} from "@/data/procedimentos";
import { perfisCliente, perfilPorValue } from "@/data/perfis-cliente";
import { tons, tomPorId } from "@/data/tons";
import { followups, followUpPorId } from "@/data/followups";
import { situacoes, situacaoPorId } from "@/data/situacoes";
import { scripts, scriptPorId } from "@/data/scripts";
import { objecoes, categoriaPorId } from "@/data/objecoes";

describe("procedimentos", () => {
  it("encontra por id e retorna undefined para id inexistente", () => {
    expect(procedimentoPorId("botox")?.label).toBe("Botox (toxina botulínica)");
    expect(procedimentoPorId("nao-existe")).toBeUndefined();
  });

  it("todos os procedimentos têm os campos esperados e ids únicos", () => {
    const ids = procedimentos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of procedimentos) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.conducao).toBeTruthy();
      expect(Array.isArray(p.duvidas)).toBe(true);
      expect(Array.isArray(p.medos)).toBe(true);
    }
  });

  it("procedimentosLabels espelha os labels na mesma ordem", () => {
    expect(procedimentosLabels).toEqual(procedimentos.map((p) => p.label));
  });
});

describe("perfilPorValue", () => {
  it("encontra por value e ignora desconhecidos", () => {
    expect(perfilPorValue("veio por indicação")?.label).toBe("Indicação");
    expect(perfilPorValue("???")).toBeUndefined();
  });

  it("todo perfil tem diretriz", () => {
    expect(perfisCliente.every((p) => p.diretriz.length > 0)).toBe(true);
  });
});

describe("tomPorId", () => {
  it("encontra por id e ignora desconhecidos", () => {
    expect(tomPorId("acolhedor")?.label).toBe("Acolhedor");
    expect(tomPorId("inexistente")).toBeUndefined();
  });

  it("ids únicos e instrução presente", () => {
    const ids = tons.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(tons.every((t) => t.instrucao.length > 0)).toBe(true);
  });
});

describe("followUpPorId", () => {
  it("encontra por id e ignora desconhecidos", () => {
    expect(followUpPorId("sumiu_1h")?.label).toBe("Sumiu há 1 hora");
    expect(followUpPorId("nope")).toBeUndefined();
  });

  it("toda diretriz preenchida", () => {
    expect(followups.every((f) => f.diretriz.length > 0)).toBe(true);
  });
});

describe("situacaoPorId", () => {
  it("encontra por id e ignora desconhecidos", () => {
    expect(situacaoPorId("preco")?.label).toBe("Perguntou o preço");
    expect(situacaoPorId("nope")).toBeUndefined();
  });

  it("ids únicos", () => {
    const ids = situacoes.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("scriptPorId", () => {
  it("encontra por id e ignora desconhecidos", () => {
    const s = scriptPorId("perguntou_preco");
    expect(s?.titulo).toBe("Cliente perguntou o preço");
    expect(s?.passos.length).toBeGreaterThan(0);
    expect(scriptPorId("nope")).toBeUndefined();
  });

  it("cada passo tem etapa, mensagem e intervalo", () => {
    for (const script of scripts) {
      for (const passo of script.passos) {
        expect(passo.etapa).toBeTruthy();
        expect(passo.mensagem).toBeTruthy();
        expect(passo.intervalo).toBeTruthy();
      }
    }
  });
});

describe("categoriaPorId", () => {
  it("encontra por id e ignora desconhecidos", () => {
    const c = categoriaPorId("preco");
    expect(c?.titulo).toBe("Preço");
    expect(c?.itens.length).toBeGreaterThan(0);
    expect(categoriaPorId("nope")).toBeUndefined();
  });

  it("cada item tem gatilho e resposta", () => {
    for (const cat of objecoes) {
      for (const item of cat.itens) {
        expect(item.gatilho).toBeTruthy();
        expect(item.resposta).toBeTruthy();
      }
    }
  });
});
