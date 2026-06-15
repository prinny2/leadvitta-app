import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type {
  GerarInput,
  RefineInput,
  FollowUpInput,
} from "@/lib/types";

// Mocks dos SDKs externos: nenhum teste faz chamada de rede real.
const { openaiCreate, anthropicCreate } = vi.hoisted(() => ({
  openaiCreate: vi.fn(),
  anthropicCreate: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: openaiCreate } };
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: anthropicCreate };
  },
}));

// Recarrega o provider depois de ajustar env, pois config.ts lê env no import.
async function loadProvider() {
  vi.resetModules();
  return import("@/lib/ai/provider");
}

/** Resposta no formato do chat.completions da OpenAI. */
const oai = (content: string) => ({ choices: [{ message: { content } }] });
/** Resposta no formato do messages.create da Anthropic. */
const ant = (text: string) => ({ content: [{ type: "text", text }] });

const geradorInput: GerarInput = {
  modo: "gerar",
  procedimento: "botox",
  situacao: "preco",
  tom: "acolhedor",
  objetivo: "",
  mensagemCliente: "Quanto custa?",
  clinica: { como_chamar: "linda" },
};

const refineInput: RefineInput = {
  variante: "curta",
  respostaAtual: "Oi!",
  procedimento: "botox",
  situacao: "preco",
  tom: "acolhedor",
  objetivo: "",
  mensagemCliente: "Quanto custa?",
};

const followInput: FollowUpInput = {
  gatilho: "sumiu_1h",
  contexto: "",
  procedimento: "botox",
  tom: "acolhedor",
};

beforeEach(() => {
  vi.unstubAllEnvs();
  openaiCreate.mockReset();
  anthropicCreate.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function configureOpenAI() {
  vi.stubEnv("OPENAI_API_KEY", "sk-openai");
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("AI_MODEL", "gpt-4o-mini");
}

function configureAnthropicOnly() {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant");
  vi.stubEnv("AI_MODEL", "claude-haiku-4-5");
}

function configureNone() {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("AI_MODEL", "");
}

describe("provider — sem nenhuma IA configurada (modo demonstração)", () => {
  beforeEach(configureNone);

  it("gerarRespostas devolve mock com mock:true", async () => {
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.mock).toBe(true);
    expect(res.respostas.curta).toBeTruthy();
    expect(openaiCreate).not.toHaveBeenCalled();
    expect(anthropicCreate).not.toHaveBeenCalled();
  });

  it("refinarResposta devolve mock com mock:true", async () => {
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta(refineInput);
    expect(res.mock).toBe(true);
    expect(res.texto).toBeTruthy();
  });

  it("gerarFollowUp devolve mock com mock:true", async () => {
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mock).toBe(true);
    expect(res.mensagens).toHaveLength(3);
  });

  it("classificarMensagem devolve objeto vazio", async () => {
    const { classificarMensagem } = await loadProvider();
    expect(await classificarMensagem("oi")).toEqual({});
  });
});

describe("provider — OpenAI configurada", () => {
  beforeEach(configureOpenAI);

  it("gerarRespostas parseia o JSON e marca mock:false", async () => {
    openaiCreate.mockResolvedValue(
      oai(
        JSON.stringify({
          resposta_curta: "curta",
          resposta_consultiva: "consultiva",
          resposta_persuasiva: "persuasiva",
        })
      )
    );
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.mock).toBe(false);
    expect(res.respostas).toEqual({
      curta: "curta",
      consultiva: "consultiva",
      persuasiva: "persuasiva",
    });
  });

  it("extrai JSON mesmo com texto ao redor (parse resiliente)", async () => {
    openaiCreate.mockResolvedValue(
      oai(
        'Claro! Aqui vai:\n{"resposta_curta":"a","resposta_consultiva":"b","resposta_persuasiva":"c"}\nEspero ter ajudado.'
      )
    );
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.curta).toBe("a");
    expect(res.mock).toBe(false);
  });

  it("faz fallback para mock (mock:false + aviso) quando não há JSON parseável", async () => {
    openaiCreate.mockResolvedValue(oai("desculpe, não consigo responder em json"));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.mock).toBe(false);
    expect(res.aviso).toMatch(/interpretar/i);
    expect(res.respostas.curta).toBeTruthy();
  });

  it("reescreve quando a resposta viola compliance", async () => {
    // Mock por conteúdo (não por ordem): o gerador e o classificador rodam em
    // paralelo via Promise.all, então a ordem das chamadas não é garantida.
    openaiCreate.mockImplementation((args: any) => {
      const user: string = args?.messages?.[1]?.content ?? "";
      if (user.startsWith("MENSAGEM:")) {
        return Promise.resolve(oai(JSON.stringify({ intent: "objecao" })));
      }
      if (user.includes("termos proibidos")) {
        return Promise.resolve(
          oai(
            JSON.stringify({
              resposta_curta: "depende da avaliação",
              resposta_consultiva: "ok",
              resposta_persuasiva: "ok",
            })
          )
        );
      }
      // Primeira geração: viola compliance.
      return Promise.resolve(
        oai(
          JSON.stringify({
            resposta_curta: "resultado garantido pra você",
            resposta_consultiva: "ok",
            resposta_persuasiva: "ok",
          })
        )
      );
    });
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.curta).toBe("depende da avaliação");
    // gerador + classificador (paralelo) + revisão de compliance.
    expect(openaiCreate).toHaveBeenCalledTimes(3);
  });

  it("classificarMensagem retorna intent/sentiment/score", async () => {
    openaiCreate.mockResolvedValue(
      oai(JSON.stringify({ intent: "pergunta_preco", sentiment: "3 stars", score: 72 }))
    );
    const { classificarMensagem } = await loadProvider();
    const res = await classificarMensagem("quanto custa?");
    expect(res).toMatchObject({
      intent: "pergunta_preco",
      sentiment: "3 stars",
      score: 72,
    });
  });

  it("refinarResposta retorna o texto parseado", async () => {
    openaiCreate.mockResolvedValue(oai(JSON.stringify({ resposta: "versão melhor" })));
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta(refineInput);
    expect(res).toEqual({ texto: "versão melhor", mock: false });
  });

  it("refinarResposta cai no mock (mock:false) sem texto utilizável", async () => {
    openaiCreate.mockResolvedValue(oai(JSON.stringify({ outra_chave: "x" })));
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta(refineInput);
    expect(res.mock).toBe(false);
    expect(res.texto).toBeTruthy();
  });

  it("gerarFollowUp retorna mensagens filtradas e não vazias", async () => {
    openaiCreate.mockResolvedValue(
      oai(JSON.stringify({ mensagens: ["m1", "  ", "m2"] }))
    );
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mock).toBe(false);
    expect(res.mensagens).toEqual(["m1", "m2"]);
  });

  it("gerarFollowUp tenta novamente e cai no mock quando vem vazio", async () => {
    openaiCreate.mockResolvedValue(oai(JSON.stringify({ mensagens: [] })));
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mock).toBe(false);
    expect(res.mensagens).toHaveLength(3); // mockFollowup
  });
});

describe("provider — Anthropic configurada", () => {
  beforeEach(configureAnthropicOnly);

  it("usa o cliente Anthropic e parseia o resultado", async () => {
    anthropicCreate.mockResolvedValue(
      ant(JSON.stringify({ mensagens: ["a", "b", "c"] }))
    );
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(anthropicCreate).toHaveBeenCalled();
    expect(res.mensagens).toEqual(["a", "b", "c"]);
  });
});

describe("provider — erro de rede cai no mock", () => {
  beforeEach(configureOpenAI);

  it("refinarResposta devolve mock:true quando a IA falha após retry", async () => {
    vi.useFakeTimers();
    try {
      openaiCreate.mockRejectedValue(new Error("boom"));
      const { refinarResposta } = await loadProvider();
      const promise = refinarResposta(refineInput);
      // Avança o tempo do retry (1s) interno do callAI.
      await vi.advanceTimersByTimeAsync(1500);
      const res = await promise;
      expect(res.mock).toBe(true);
      expect(res.texto).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
