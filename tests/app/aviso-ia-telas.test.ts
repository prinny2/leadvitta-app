import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

// As telas não têm teste de DOM (ambiente node): checa a fiação no fonte.
const fonte = (arquivo: string) => readFileSync(resolve(process.cwd(), arquivo), "utf8");

describe("gerador", () => {
  const page = fonte("app/(app)/gerador/page.tsx");

  it("refina com o modo e o texto que geraram as respostas, não com o formulário atual", () => {
    expect(page).toContain('acao: "refinar", modo: geracao.modo,');
    expect(page).toContain("nomeCliente, mensagemCliente: geracao.mensagemCliente, clinica:");
    expect(page).toMatch(
      /setRespostas\(data\.respostas\);\s+setGeracao\(\{ modo, mensagemCliente \}\);/
    );
  });

  it("salva no histórico o texto que gerou as respostas", () => {
    expect(page).toContain('tipo: geracao.modo === "reescrever"');
    expect(page).toContain("nomeCliente, mensagemCliente: geracao.mensagemCliente },");
  });

  it("o refino trata o aviso como a geração e não apaga o que já estava na tela", () => {
    expect(page).toMatch(/\[variante\]: data\.texto \} : prev\)\);\s+mostrarAviso\(data\);/);
    expect(page).toMatch(/if \(data\.mock\) \{[\s\S]+?\} else if \(data\.aviso\) \{/);
    expect(page).not.toContain('setAviso(data.aviso ?? "")');
  });
});

describe("compliance", () => {
  const page = fonte("app/(app)/compliance/page.tsx");

  it("não rotula como versão segura o texto que veio com aviso", () => {
    expect(page).toContain(
      'resultado.aviso ? "Texto para revisar antes de enviar" : "Versão segura pra enviar"'
    );
  });
});

describe("conversas", () => {
  const page = fonte("app/(app)/conversas/[id]/page.tsx");

  it("avisa quando a sugestão colada na caixa foi trocada pelo texto seguro", () => {
    expect(page).toMatch(/setTexto\(data\.respostas\.consultiva\);\s+setAviso\(data\.aviso \?\? ""\);/);
    expect(page).toContain("<AvisoIA aviso={aviso}");
  });
});
