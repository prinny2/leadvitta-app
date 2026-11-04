import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type {
  GerarInput,
  RefineInput,
  FollowUpInput,
} from "@/lib/types";
import {
  AVISO_REVISAO_MANUAL,
  AVISO_SEM_LEITURA,
  AVISO_TEXTO_SEGURO,
  violaCompliance,
} from "@/lib/ai/prompts";
import { mockFollowup, softenText } from "@/lib/ai/mock";

// Mocks dos SDKs externos: nenhum teste faz chamada de rede real.
const { openaiCreate, anthropicCreate, geminiGenerate } = vi.hoisted(() => ({
  openaiCreate: vi.fn(),
  anthropicCreate: vi.fn(),
  geminiGenerate: vi.fn(),
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

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: geminiGenerate };
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
  geminiGenerate.mockReset();
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

  it.each([JSON.stringify({ outra_chave: "x" }), "isso não é json"])(
    "refinarResposta mantém o texto e avisa a falha de leitura: %s",
    async (raw) => {
      openaiCreate.mockResolvedValue(oai(raw));
      const { refinarResposta } = await loadProvider();
      const res = await refinarResposta(refineInput);
      expect(res).toEqual({
        texto: refineInput.respostaAtual,
        mock: false,
        aviso: AVISO_SEM_LEITURA,
      });
    }
  );

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

  it("se a reescrita AINDA viola, devolve texto seguro (compliant)", async () => {
    openaiCreate.mockImplementation((args: any) => {
      const user: string = args?.messages?.[1]?.content ?? "";
      if (user.startsWith("MENSAGEM:")) {
        return Promise.resolve(oai(JSON.stringify({ intent: "objecao" })));
      }
      // Geração E reescrita violam: a última linha de defesa deve sanear.
      return Promise.resolve(
        oai(
          JSON.stringify({
            resposta_curta: "resultado garantido",
            resposta_consultiva: "resultado garantido",
            resposta_persuasiva: "resultado garantido",
          })
        )
      );
    });
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    for (const t of [
      res.respostas.curta,
      res.respostas.consultiva,
      res.respostas.persuasiva,
    ]) {
      expect(t).toBeTruthy();
      expect(violaCompliance(t)).toBe(false);
    }
  });

  it("preserva as variantes compliant quando só uma viola (reescrita ruim)", async () => {
    openaiCreate.mockImplementation((args: any) => {
      const user: string = args?.messages?.[1]?.content ?? "";
      if (user.startsWith("MENSAGEM:")) {
        return Promise.resolve(oai(JSON.stringify({ intent: "objecao" })));
      }
      if (user.includes("termos proibidos")) {
        // Reescrita ruim: viola TODAS — não pode contaminar as originais boas.
        return Promise.resolve(
          oai(
            JSON.stringify({
              resposta_curta: "resultado garantido",
              resposta_consultiva: "resultado garantido",
              resposta_persuasiva: "resultado garantido",
            })
          )
        );
      }
      // Geração: só a curta viola; consultiva/persuasiva já são compliant.
      return Promise.resolve(
        oai(
          JSON.stringify({
            resposta_curta: "resultado garantido",
            resposta_consultiva: "Depende da avaliação — me conta seu objetivo?",
            resposta_persuasiva: "Quer ver um horário pra avaliarmos juntas?",
          })
        )
      );
    });
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    // As originalmente compliant são preservadas (não viram mock).
    expect(res.respostas.consultiva).toBe("Depende da avaliação — me conta seu objetivo?");
    expect(res.respostas.persuasiva).toBe("Quer ver um horário pra avaliarmos juntas?");
    // A que violava (e cuja reescrita também violou) é saneada.
    expect(violaCompliance(res.respostas.curta)).toBe(false);
  });

  it("gerarFollowUp reescreve e mantém as mensagens compliant originais", async () => {
    openaiCreate.mockImplementation((args: any) => {
      const user: string = args?.messages?.[1]?.content ?? "";
      if (user.includes("termos proibidos")) {
        return Promise.resolve(
          oai(JSON.stringify({ mensagens: ["oi de novo", "tudo bem?", "vamos marcar?"] }))
        );
      }
      return Promise.resolve(
        oai(JSON.stringify({ mensagens: ["resultado garantido!", "ok", "ok"] }))
      );
    });
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mensagens.length).toBeGreaterThan(0);
    for (const m of res.mensagens) {
      expect(violaCompliance(m)).toBe(false);
    }
    // A original "ok" (compliant) não pode ser descartada pela reescrita.
    expect(res.mensagens).toContain("ok");
  });

  it("gerarFollowUp cai no mock quando até a reescrita viola", async () => {
    // Geração e reescrita sempre violam → todas filtradas → fallback no mock.
    openaiCreate.mockResolvedValue(
      oai(
        JSON.stringify({
          mensagens: [
            "resultado garantido",
            "resultado garantido de novo",
            "resultado garantido sempre",
          ],
        })
      )
    );
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mensagens.length).toBeGreaterThan(0);
    for (const m of res.mensagens) {
      expect(violaCompliance(m)).toBe(false);
    }
    expect(res.mensagens).toEqual(mockFollowup(followInput));
  });

  describe("classificarMensagem — saneamento", () => {
    async function classificar(payload: Record<string, unknown>) {
      openaiCreate.mockResolvedValue(oai(JSON.stringify(payload)));
      const { classificarMensagem } = await loadProvider();
      return classificarMensagem("quanto custa?");
    }

    it("descarta intent/sentiment fora do vocabulário e clampa score alto", async () => {
      const res = await classificar({ intent: "xpto", sentiment: "banana", score: 9999 });
      expect(res.score).toBe(100);
      expect(res.intent).toBeUndefined();
      expect(res.sentiment).toBeUndefined();
    });

    it("converte score em string e arredonda", async () => {
      const res = await classificar({ intent: "objecao", sentiment: "3 stars", score: "42.7" });
      expect(res.score).toBe(43);
      expect(res.intent).toBe("objecao");
      expect(res.sentiment).toBe("3 stars");
    });

    it("clampa score negativo para 0", async () => {
      expect((await classificar({ score: -10 })).score).toBe(0);
    });

    it("descarta score nulo/NaN", async () => {
      expect((await classificar({ score: null })).score).toBeUndefined();
      expect((await classificar({ score: "abc" })).score).toBeUndefined();
    });

    it("normaliza intent com capitalização diferente", async () => {
      const res = await classificar({ intent: "OBJECAO", score: 75 });
      expect(res.intent).toBe("objecao");
      expect(res.score).toBe(75);
    });

    it("normaliza sentiment por espaços/caixa e descarta inválido", async () => {
      expect((await classificar({ sentiment: " 5star " })).sentiment).toBe("5 stars");
      expect((await classificar({ sentiment: "3 STARS" })).sentiment).toBe("3 stars");
      expect((await classificar({ sentiment: "muito bom" })).sentiment).toBeUndefined();
    });
  });
});

describe("provider — cadeia customizada (LP: OpenAI → Gemini)", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "sk-openai");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant");
    vi.stubEnv("GEMINI_API_KEY", "gem-key");
    vi.stubEnv("AI_MODEL", "gpt-4o-mini");
  });

  it("pula Anthropic e usa Gemini quando OpenAI falha", async () => {
    const json = JSON.stringify({
      resposta_curta: "curta",
      resposta_consultiva: "consultiva",
      resposta_persuasiva: "persuasiva",
    });

    openaiCreate.mockImplementation((args: any) => {
      const user: string = args?.messages?.[1]?.content ?? "";
      if (user.startsWith("MENSAGEM:")) {
        return Promise.resolve(oai(JSON.stringify({ intent: "pergunta_preco" })));
      }
      return Promise.reject(new Error("openai down"));
    });
    anthropicCreate.mockResolvedValue(
      ant(
        JSON.stringify({
          resposta_curta: "nunca",
          resposta_consultiva: "nunca",
          resposta_persuasiva: "nunca",
        })
      )
    );
    geminiGenerate.mockResolvedValue({ text: json });

    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({
      ...geradorInput,
      providerChain: ["openai", "gemini"],
    });

    expect(res.mock).toBe(false);
    expect(res.respostas).toEqual({
      curta: "curta",
      consultiva: "consultiva",
      persuasiva: "persuasiva",
    });
    expect(anthropicCreate).not.toHaveBeenCalled();
    expect(geminiGenerate).toHaveBeenCalled();
  });
});

describe("provider — fallback entre modelos Gemini", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "gem-key");
    vi.stubEnv("GEMINI_MODEL", "gemini-ocupado,gemini-livre");
  });

  it("passa para o próximo modelo quando o primeiro responde 503", async () => {
    const json = JSON.stringify({
      resposta_curta: "curta",
      resposta_consultiva: "consultiva",
      resposta_persuasiva: "persuasiva",
    });
    geminiGenerate.mockImplementation((args: any) =>
      args.model === "gemini-ocupado"
        ? Promise.reject(new Error('{"error":{"code":503,"status":"UNAVAILABLE"}}'))
        : Promise.resolve({ text: json })
    );

    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, providerChain: ["gemini"] });

    expect(res.mock).toBe(false);
    expect(res.respostas.curta).toBe("curta");
    const modelos = geminiGenerate.mock.calls.map((c: any[]) => c[0].model);
    expect(modelos).toContain("gemini-ocupado");
    expect(modelos).toContain("gemini-livre");
  });

  it("cai no mock só quando todos os modelos falham", async () => {
    geminiGenerate.mockRejectedValue(new Error("503"));

    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, providerChain: ["gemini"] });

    expect(res.mock).toBe(true);
    const modelos = new Set(geminiGenerate.mock.calls.map((c: any[]) => c[0].model));
    expect(modelos).toEqual(new Set(["gemini-ocupado", "gemini-livre"]));
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

describe("provider — disponibilidade inventada", () => {
  beforeEach(configureOpenAI);

  const INVENTADO = "Temos horários disponíveis essa semana, quer marcar?";
  const LIMPO = "Quer que eu veja um horário pra você?";
  const tripla = (persuasiva: string) =>
    JSON.stringify({ resposta_curta: "oi", resposta_consultiva: "ok", resposta_persuasiva: persuasiva });

  /** Mock por conteúdo: `primeira` responde a geração e `revisao` a reescrita. */
  function ia(primeira: string, revisao: string) {
    openaiCreate.mockImplementation((args: any) => {
      const user: string = args?.messages?.[1]?.content ?? "";
      if (user.startsWith("MENSAGEM:")) return Promise.resolve(oai("{}"));
      return Promise.resolve(oai(user.includes("ATENÇÃO:") ? revisao : primeira));
    });
  }
  const pedidosDeReescrita = () =>
    openaiCreate.mock.calls
      .map((c: any[]) => String(c[0]?.messages?.[1]?.content ?? ""))
      .filter((u) => u.includes("ATENÇÃO:"));

  it("gerarRespostas regenera e devolve a resposta limpa", async () => {
    ia(tripla(INVENTADO), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.persuasiva).toBe(LIMPO);
    expect(res.respostas.curta).toBe("oi");
    expect(pedidosDeReescrita()).toHaveLength(1);
    expect(pedidosDeReescrita()[0]).toContain("Não afirme horários");
  });

  it("gerarRespostas cai no texto neutro, sem preço, e avisa se a reescrita insistir", async () => {
    ia(tripla(INVENTADO), tripla("Ainda temos vagas!"));
    const { gerarRespostas } = await loadProvider();
    const { mockNeutro } = await import("@/lib/ai/mock");
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.persuasiva).toBe(mockNeutro(geradorInput).persuasiva);
    expect(res.respostas.persuasiva).not.toMatch(/valor|preço/i);
    expect(res.mock).toBe(false);
    expect(res.aviso).toBe(AVISO_TEXTO_SEGURO);
    expect(res.respostas.curta).toBe("oi");
  });

  it("gerarRespostas não avisa quando nada foi trocado", async () => {
    ia(tripla(INVENTADO), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    expect((await gerarRespostas(geradorInput)).aviso).toBeUndefined();
  });

  it("gerarRespostas regenera a frase do incidente seguida de emoji e pergunta", async () => {
    ia(tripla("Temos horários disponíveis essa semana 😊 Quer que eu reserve?"), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.persuasiva).toBe(LIMPO);
    expect(pedidosDeReescrita()).toHaveLength(1);
  });

  it("gerarRespostas não troca a resposta que só diz que vai verificar", async () => {
    const verifica = "Claro que pode 😊 Vou conferir os horários disponíveis essa semana e já te falo!";
    ia(tripla(verifica), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.persuasiva).toBe(verifica);
    expect(pedidosDeReescrita()).toHaveLength(0);
  });

  it("gerarRespostas não troca empatia sobre a agenda da cliente", async () => {
    const empatia = "Entendo, agenda cheia é complicado mesmo! Quando ficar melhor pra você?";
    ia(tripla(empatia), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({
      ...geradorInput,
      mensagemCliente: "Quero fazer mas minha agenda tá cheia esse mês",
    });
    expect(res.respostas.persuasiva).toBe(empatia);
    expect(pedidosDeReescrita()).toHaveLength(0);
  });

  it("gerarRespostas no reescrever mantém o texto da profissional na troca", async () => {
    const proprio = "Oi, vou olhar a agenda da semana pra sua sobrinha";
    ia(tripla(INVENTADO), tripla("Últimas vagas!"));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, modo: "reescrever", mensagemCliente: proprio });
    expect(res.respostas.persuasiva).toBe(proprio);
    expect(res.aviso).toBe(AVISO_TEXTO_SEGURO);
  });

  it("gerarRespostas no reescrever não aceita fonte que só hesita", async () => {
    ia(tripla("Temos horários pra você!"), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({
      ...geradorInput,
      modo: "reescrever",
      mensagemCliente: "Oi, vou ver se temos horários pra você e te falo",
    });
    expect(res.respostas.persuasiva).toBe(LIMPO);
  });

  it("gerarRespostas não confirma parcelamento só porque a cliente citou", async () => {
    ia(tripla("Isso, parcelamos em 12x sem juros! Quer que eu veja um horário?"), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({
      ...geradorInput,
      mensagemCliente: "Vi que vocês parcelam em 12x sem juros, é isso?",
    });
    expect(res.respostas.persuasiva).toBe(LIMPO);
  });

  it("gerarRespostas não regenera quando o fato veio do CTA da clínica", async () => {
    const cta = "aproveitar a agenda aberta essa semana";
    const texto = "Nossa agenda aberta essa semana te espera!";
    ia(tripla(texto), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, clinica: { cta_preferido: cta } });
    expect(res.respostas.persuasiva).toBe(texto);
    expect(pedidosDeReescrita()).toHaveLength(0);
  });

  it("gerarRespostas não regenera no reescrever quando o fato é da profissional", async () => {
    const proprio = "Temos horários na sexta, quer marcar?";
    ia(tripla(proprio), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, modo: "reescrever", mensagemCliente: proprio });
    expect(res.respostas.persuasiva).toBe(proprio);
    expect(pedidosDeReescrita()).toHaveLength(0);
  });

  it("gerarRespostas no modo gerar não aceita o fato só porque a cliente escreveu", async () => {
    ia(tripla("Temos horários na sexta!"), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, mensagemCliente: "Temos horários na sexta?" });
    expect(res.respostas.persuasiva).toBe(LIMPO);
  });

  it("refinarResposta regenera e devolve a resposta limpa", async () => {
    ia(JSON.stringify({ resposta: INVENTADO }), JSON.stringify({ resposta: LIMPO }));
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta(refineInput);
    expect(res.texto).toBe(LIMPO);
    expect(pedidosDeReescrita()[0]).toContain("Não afirme horários");
  });

  it("refinarResposta mantém a resposta atual e avisa se a reescrita insistir", async () => {
    ia(JSON.stringify({ resposta: INVENTADO }), JSON.stringify({ resposta: "Tenho horários!" }));
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta(refineInput);
    expect(res.texto).toBe(refineInput.respostaAtual);
    expect(res.mock).toBe(false);
    expect(res.aviso).toBe(AVISO_TEXTO_SEGURO);
  });

  it("refinarResposta usa o texto neutro se a resposta atual também reprovar", async () => {
    ia(JSON.stringify({ resposta: INVENTADO }), JSON.stringify({ resposta: "Tenho horários!" }));
    const { refinarResposta } = await loadProvider();
    const { mockNeutro } = await import("@/lib/ai/mock");
    const input = { ...refineInput, respostaAtual: INVENTADO };
    const res = await refinarResposta(input);
    expect(res.texto).toBe(mockNeutro(input).curta);
    expect(res.aviso).toBe(AVISO_TEXTO_SEGURO);
  });

  it("refinarResposta no reescrever cai no texto da profissional", async () => {
    const proprio = "Oi, vou olhar a agenda da semana pra sua sobrinha";
    ia(JSON.stringify({ resposta: INVENTADO }), JSON.stringify({ resposta: "Tenho horários!" }));
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta({
      ...refineInput,
      modo: "reescrever",
      mensagemCliente: proprio,
      respostaAtual: INVENTADO,
    });
    expect(res.texto).toBe(proprio);
  });

  it("refinarResposta aceita o fato da profissional só no reescrever", async () => {
    const proprio = "Temos horários na sexta, quer marcar?";
    ia(JSON.stringify({ resposta: proprio }), JSON.stringify({ resposta: LIMPO }));
    const { refinarResposta } = await loadProvider();
    const input = { ...refineInput, mensagemCliente: proprio };
    expect((await refinarResposta({ ...input, modo: "reescrever" })).texto).toBe(proprio);
    expect((await refinarResposta({ ...input, modo: "gerar" })).texto).toBe(LIMPO);
  });

  it("refinarResposta também não devolve termo proibido se a reescrita insistir", async () => {
    const proibido = JSON.stringify({ resposta: "resultado garantido" });
    ia(proibido, proibido);
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta(refineInput);
    expect(violaCompliance(res.texto)).toBe(false);
  });

  it("gerarFollowUp regenera, mantém só mensagens limpas e completa as 3", async () => {
    ia(
      JSON.stringify({ mensagens: ["Oi, tudo bem?", INVENTADO] }),
      JSON.stringify({ mensagens: [LIMPO, "Últimas vagas!"] })
    );
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mensagens).toEqual(["Oi, tudo bem?", LIMPO, mockFollowup(followInput)[0]]);
    expect(res.aviso).toBe(AVISO_TEXTO_SEGURO);
    expect(pedidosDeReescrita()[0]).toContain("Não afirme horários");
  });

  it("gerarFollowUp não passa de 3 mensagens quando a reescrita é boa", async () => {
    ia(
      JSON.stringify({ mensagens: ["Oi A", "Oi B", INVENTADO] }),
      JSON.stringify({ mensagens: ["Novo 1", "Novo 2", "Novo 3"] })
    );
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mensagens).toEqual(["Oi A", "Oi B", "Novo 3"]);
    expect(res.aviso).toBeUndefined();
  });

  it("gerarFollowUp cai no mock quando nada sobra limpo", async () => {
    ia(JSON.stringify({ mensagens: [INVENTADO] }), JSON.stringify({ mensagens: [INVENTADO] }));
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp(followInput);
    expect(res.mensagens).toEqual(mockFollowup(followInput));
    expect(res.aviso).toBe(AVISO_TEXTO_SEGURO);
  });

  it("gerarFollowUp não aceita detalhe que só relata a pergunta da cliente", async () => {
    ia(JSON.stringify({ mensagens: ["Temos vaga na sexta! Quer vir?"] }), JSON.stringify({ mensagens: [LIMPO] }));
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp({ ...followInput, detalhe: "ela perguntou se temos vaga na sexta" });
    expect(res.mensagens).not.toContain("Temos vaga na sexta! Quer vir?");
    expect(res.mensagens[0]).toBe(LIMPO);
  });

  it("gerarFollowUp aceita o que a profissional pôs no detalhe", async () => {
    const proprio = "Temos horários na sexta, quer marcar?";
    ia(JSON.stringify({ mensagens: [proprio] }), JSON.stringify({ mensagens: [LIMPO] }));
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp({ ...followInput, detalhe: "temos horários na sexta" });
    expect(res.mensagens).toEqual([proprio]);
    expect(pedidosDeReescrita()).toHaveLength(0);
  });

  it("o Auditor não muda: agenda da clínica segue ok e intacta", async () => {
    const texto = "Temos horários essa semana, quer marcar?";
    openaiCreate.mockResolvedValue(oai(JSON.stringify({ riscos: [], reescrita: texto })));
    const { auditarCompliance } = await loadProvider();
    const res = await auditarCompliance({ texto });
    expect(res).toMatchObject({ status: "ok", riscos: [], reescrita: texto });
    expect(openaiCreate).toHaveBeenCalledTimes(1);
  });

  it.each([
    "Oi! Vem fazer botox com a gente, cada caso é avaliado. Temos horários essa semana!",
    "Oi! Vem fazer botox com a gente, cada caso é avaliado. Parcelamos em até 12x!",
  ])("o Auditor tira só a frase que soma fato se a nova tentativa insistir: %s", async (reescrita) => {
    const texto = "Oi! Vem fazer botox com a gente, resultado garantido!";
    openaiCreate.mockResolvedValue(oai(JSON.stringify({ riscos: [], reescrita })));
    const { auditarCompliance } = await loadProvider();
    const res = await auditarCompliance({ texto });
    expect(res.reescrita).toBe("Oi! Vem fazer botox com a gente, cada caso é avaliado.");
    expect(pedidosDeReescrita()).toHaveLength(1);
    expect(res.aviso).toBeUndefined();
  });

  describe("Auditor — reescrita que soma fato", () => {
    const risco = { trecho: "seu melasma é leve", motivo: "Diagnóstico sem avaliação", gravidade: "alta" };
    const texto = "Pelo que você contou, seu melasma é leve e o peeling resolve em 2 sessões.";
    const boa = "O peeling pode ajudar, depende da avaliação.";
    const auditoria = (reescrita: string) => JSON.stringify({ riscos: [risco], reescrita });

    it("pede outra reescrita e adota a limpa", async () => {
      ia(auditoria(`${boa} Temos horários essa semana!`), auditoria(boa));
      const { auditarCompliance } = await loadProvider();
      const res = await auditarCompliance({ texto });
      expect(res.reescrita).toBe(boa);
      expect(res.aviso).toBeUndefined();
      expect(pedidosDeReescrita()[0]).toContain("Não afirme horários");
      expect(pedidosDeReescrita()[0]).not.toContain("veja um horário");
    });

    it("avisa quando nada da reescrita se salva", async () => {
      const inventada = auditoria("Temos horários essa semana!");
      ia(inventada, inventada);
      const { auditarCompliance } = await loadProvider();
      const res = await auditarCompliance({ texto });
      expect(res.reescrita).toBe(softenText(texto));
      expect(res.aviso).toBe(AVISO_REVISAO_MANUAL);
    });

    it("segue quando a segunda tentativa falha", async () => {
      vi.useFakeTimers();
      try {
        openaiCreate
          .mockResolvedValueOnce(oai(auditoria(`${boa} Temos horários essa semana!`)))
          .mockRejectedValue(new Error("boom"));
        const { auditarCompliance } = await loadProvider();
        const promise = auditarCompliance({ texto });
        await vi.advanceTimersByTimeAsync(1500);
        expect((await promise).reescrita).toBe(boa);
      } finally {
        vi.useRealTimers();
      }
    });

    it("avisa quando sobra risco que só a IA viu e o texto não mudou", async () => {
      openaiCreate.mockResolvedValue(oai(auditoria(texto)));
      const { auditarCompliance } = await loadProvider();
      const res = await auditarCompliance({ texto });
      expect(res).toMatchObject({ status: "risco", reescrita: texto, aviso: AVISO_REVISAO_MANUAL });
    });

    it("não troca a reescrita boa que só pede o horário da cliente", async () => {
      const reescrita = "Esse preenchimento pode ajudar na flacidez, depende da avaliação. Me diz um horário disponível pra você.";
      openaiCreate.mockResolvedValue(oai(auditoria(reescrita)));
      const { auditarCompliance } = await loadProvider();
      const res = await auditarCompliance({
        texto: "Esse preenchimento resolve sua flacidez na hora, vem logo antes que você envelheça mais!",
      });
      expect(res.reescrita).toBe(reescrita);
      expect(res.aviso).toBeUndefined();
    });

    it("mantém a negação que já estava no texto da clínica", async () => {
      const reescrita = "Não temos horário amanhã, mas cuidamos de você com calma.";
      openaiCreate.mockResolvedValue(oai(JSON.stringify({ riscos: [], reescrita })));
      const { auditarCompliance } = await loadProvider();
      const res = await auditarCompliance({
        texto: "Não temos horário amanhã, mas garanto que vai ficar perfeito.",
      });
      expect(res.reescrita).toBe(reescrita);
      expect(openaiCreate).toHaveBeenCalledTimes(1);
    });
  });

  it.each([
    "Tem sim, linda! Prefere de manhã ou à tarde?",
    "Temos sim! Prefere manhã ou tarde? 😊",
    "Tem sim, amanhã às 14h! Quer que eu deixe marcado?",
    "Ficou agendado para amanhã às 14h, tá?",
  ])("gerarRespostas não deixa confirmar a pergunta da cliente: %s", async (curta) => {
    ia(
      JSON.stringify({ resposta_curta: curta, resposta_consultiva: curta, resposta_persuasiva: curta }),
      JSON.stringify({ resposta_curta: LIMPO, resposta_consultiva: LIMPO, resposta_persuasiva: LIMPO })
    );
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({
      ...geradorInput,
      situacao: "agendar",
      mensagemCliente: "Tem horário amanhã às 14h?",
    });
    expect(res.respostas).toEqual({ curta: LIMPO, consultiva: LIMPO, persuasiva: LIMPO });
    expect(pedidosDeReescrita()).toHaveLength(1);
  });

  it.each([
    "A avaliação é R$ 150 e dá pra parcelar em 10x no cartão",
    "A avaliação não tem custo e temos 10 anos de experiência",
  ])("gerarRespostas não deixa passar preço, condição ou credencial: %s", async (persuasiva) => {
    ia(tripla(persuasiva), tripla(LIMPO));
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.persuasiva).toBe(LIMPO);
  });

  it("refinarResposta também não confirma a pergunta da cliente", async () => {
    ia(JSON.stringify({ resposta: "Tem sim!" }), JSON.stringify({ resposta: LIMPO }));
    const { refinarResposta } = await loadProvider();
    const res = await refinarResposta({ ...refineInput, mensagemCliente: "Tem horário hoje?" });
    expect(res.texto).toBe(LIMPO);
  });

  it("gerarRespostas no reescrever não aceita data nova na frase seguinte", async () => {
    const proprio = "Oi, temos horários essa semana, quer marcar?";
    ia(
      tripla("Temos horários essa semana! Terça às 10h ou quinta às 15h, qual fica melhor?"),
      tripla(proprio)
    );
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({ ...geradorInput, modo: "reescrever", mensagemCliente: proprio });
    expect(res.respostas.persuasiva).toBe(proprio);
    expect(pedidosDeReescrita()).toHaveLength(1);
  });

  it("gerarRespostas no reescrever não aceita 'sem juros' que a profissional não disse", async () => {
    ia(
      tripla("Parcelamos em até 12x sem juros! Quer que eu veja um horário?"),
      tripla("Parcelamos em até 12x no cartão!")
    );
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas({
      ...geradorInput,
      modo: "reescrever",
      mensagemCliente: "Oi, parcelamos em até 12x no cartão",
    });
    expect(res.respostas.persuasiva).toBe("Parcelamos em até 12x no cartão!");
  });

  it("gerarRespostas não troca as 3 respostas que pedem a agenda da cliente", async () => {
    const resposta = JSON.stringify({
      resposta_curta: "Me diz um horário disponível pra você e eu verifico a agenda.",
      resposta_consultiva: "Vou te passar os horários disponíveis assim que eu conferir.",
      resposta_persuasiva: "Quando você tiver um horário livre, me chama que eu vejo a agenda 💕",
    });
    ia(resposta, resposta);
    const { gerarRespostas } = await loadProvider();
    const res = await gerarRespostas(geradorInput);
    expect(res.respostas.curta).toContain("Me diz um horário");
    expect(res.aviso).toBeUndefined();
    expect(pedidosDeReescrita()).toHaveLength(0);
  });

  it("gerarFollowUp não aceita condição que a cliente só viu no Instagram", async () => {
    const inventada = "Fazemos 12x sem juros sim! Quer retomar?";
    ia(JSON.stringify({ mensagens: [inventada, inventada, inventada] }), JSON.stringify({ mensagens: [LIMPO] }));
    const { gerarFollowUp } = await loadProvider();
    const res = await gerarFollowUp({ ...followInput, detalhe: "ela viu no Instagram 12x sem juros" });
    expect(res.mensagens).not.toContain(inventada);
    expect(res.mensagens[0]).toBe(LIMPO);
  });

  describe("pedido de reescrita em acompanhamento", () => {
    const denylist = "Oi! Vai ficar perfeito!";
    const fato = "Oi! Temos horários essa semana.";
    const limpo = "Oi! Como você está?";

    it.each([
      ["pos_atendimento", denylist],
      ["pedir_avaliacao", denylist],
      ["pos_atendimento", fato],
    ])("gerarRespostas em %s não pede horário: %s", async (situacao, persuasiva) => {
      ia(tripla(persuasiva), tripla(limpo));
      const { gerarRespostas } = await loadProvider();
      await gerarRespostas({ ...geradorInput, situacao });
      expect(pedidosDeReescrita()[0]).toContain("ão peça horário");
      expect(pedidosDeReescrita()[0]).not.toContain("veja um horário");
    });

    it("gerarFollowUp no retorno de procedimento não pede horário", async () => {
      ia(JSON.stringify({ mensagens: [denylist] }), JSON.stringify({ mensagens: [limpo] }));
      const { gerarFollowUp } = await loadProvider();
      await gerarFollowUp({ ...followInput, gatilho: "retorno_procedimento" });
      expect(pedidosDeReescrita()[0]).toContain("Não peça horário");
      expect(pedidosDeReescrita()[0]).not.toContain("veja um horário");
    });

    it("refinarResposta só fala de fatos quando a reprovação veio de fato", async () => {
      ia(JSON.stringify({ resposta: denylist }), JSON.stringify({ resposta: limpo }));
      const { refinarResposta } = await loadProvider();
      await refinarResposta(refineInput);
      expect(pedidosDeReescrita()[0]).not.toContain("Não afirme horários");
    });
  });

  it("refinarResposta mantém o texto da tela se a reescrita falhar", async () => {
    vi.useFakeTimers();
    try {
      const atual = "Oi, tudo bem? Como está depois da sessão?";
      openaiCreate
        .mockResolvedValueOnce(oai(JSON.stringify({ resposta: INVENTADO })))
        .mockRejectedValue(new Error("boom"));
      const { refinarResposta } = await loadProvider();
      const promise = refinarResposta({
        ...refineInput,
        modo: "reescrever",
        situacao: "pos_atendimento",
        respostaAtual: atual,
      });
      await vi.advanceTimersByTimeAsync(1500);
      expect(await promise).toEqual({ texto: atual, mock: false, aviso: AVISO_TEXTO_SEGURO });
    } finally {
      vi.useRealTimers();
    }
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
