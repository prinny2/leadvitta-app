import { describe, it, expect } from "vitest";
import {
  buildGeradorUser,
  buildRefineUser,
  buildFollowupUser,
  buildAuditoriaUser,
  violaCompliance,
  reprovaGeracao,
  afirmaDisponibilidade,
  afirmaCondicao,
  afirmaFatoSemFonte,
  denylistHits,
  AVISO_FATOS,
  DENYLIST,
  DENYLIST_RULES,
  SYSTEM_GERADOR,
  SYSTEM_REFINE,
  SYSTEM_FOLLOWUP,
  SYSTEM_AUDITORIA,
} from "@/lib/ai/prompts";
import { situacoes } from "@/data/situacoes";
import { followups } from "@/data/followups";
import { tons } from "@/data/tons";
import { perfisCliente } from "@/data/perfis-cliente";
import { objecoes } from "@/data/objecoes";
import { scripts } from "@/data/scripts";
import type { GerarInput, RefineInput, FollowUpInput } from "@/lib/types";

const clinica: GerarInput["clinica"] = {
  nome_clinica: "Clínica Bella",
  cidade: "Belém",
  formalidade: 40,
  como_chamar: "linda",
  cta_preferido: "marcar uma avaliação",
};

describe("buildGeradorUser", () => {
  const base: GerarInput = {
    modo: "gerar",
    procedimento: "botox",
    situacao: "preco",
    tom: "acolhedor",
    objetivo: "direcionar para a avaliação",
    nomeCliente: "Ana",
    mensagemCliente: "Quanto custa?",
    clinica,
  };

  it("inclui a tarefa de gerar e os dados do DNA da clínica", () => {
    const out = buildGeradorUser(base);
    expect(out).toContain("TAREFA: Gere 3 respostas");
    expect(out).toContain("Clínica: Clínica Bella — Belém.");
    expect(out).toContain('Mensagem da cliente: "Quanto custa?"');
  });

  it("injeta a inteligência do procedimento conhecido", () => {
    const out = buildGeradorUser(base);
    expect(out).toContain("Procedimento: Botox (toxina botulínica).");
    expect(out).toContain("Dúvidas comuns:");
    expect(out).toContain("Medos comuns:");
  });

  it("inclui situação, tom e objetivo quando informados", () => {
    const out = buildGeradorUser(base);
    expect(out).toContain("Situação: Perguntou o preço.");
    expect(out).toContain("Tom desejado: Acolhedor.");
    expect(out).toContain("Objetivo desta resposta: direcionar para a avaliação.");
  });

  it("usa o id cru quando o procedimento é desconhecido", () => {
    const out = buildGeradorUser({ ...base, procedimento: "procedimento_x" });
    expect(out).toContain("Procedimento: procedimento_x.");
    expect(out).not.toContain("Dúvidas comuns:");
  });

  it("no modo reescrever usa a tarefa de reescrita e lista o que melhorar", () => {
    const out = buildGeradorUser({
      ...base,
      modo: "reescrever",
      oQueMelhorar: ["está fria ou seca", "parece robótica"],
    });
    expect(out).toContain("TAREFA: Reescreva a mensagem");
    expect(out).toContain("Pontos a melhorar: está fria ou seca; parece robótica.");
  });

  it("inclui perfil da cliente quando informado", () => {
    const out = buildGeradorUser({
      ...base,
      perfilCliente: "veio por indicação",
    });
    expect(out).toContain("Perfil da cliente: Indicação.");
  });
});

describe("buildRefineUser", () => {
  const base: RefineInput = {
    variante: "curta",
    respostaAtual: "Oi, te explico!",
    procedimento: "botox",
    situacao: "preco",
    tom: "acolhedor",
    objetivo: "fechar o agendamento",
    mensagemCliente: "Quanto custa?",
    clinica,
  };

  it("mapeia a variante para o nome e a postura corretos", () => {
    const out = buildRefineUser(base);
    expect(out).toContain('estilo "Suave"');
    expect(out).toContain("acolhe sem pressionar");
    expect(out).toContain('Resposta atual (a melhorar): "Oi, te explico!"');
  });

  it("usa a postura persuasiva para a variante persuasiva", () => {
    const out = buildRefineUser({ ...base, variante: "persuasiva" });
    expect(out).toContain('estilo "Fechamento"');
    expect(out).toContain("veja um horário");
    expect(out).not.toContain("urgência leve");
  });
});

describe("buildFollowupUser", () => {
  const base: FollowUpInput = {
    gatilho: "sumiu_1h",
    contexto: "ela perguntou o preço",
    procedimento: "botox",
    tom: "acolhedor",
    clinica,
  };

  it("inclui a diretriz do gatilho de tempo e o contexto", () => {
    const out = buildFollowupUser(base);
    expect(out).toContain("TAREFA: Gere 3 mensagens de follow-up");
    expect(out).toContain("Tempo: Sumiu há 1 hora.");
    expect(out).toContain("Contexto da conversa: ela perguntou o preço.");
  });

  it("inclui o detalhe adicional quando presente", () => {
    const out = buildFollowupUser({ ...base, detalhe: "cliente VIP" });
    expect(out).toContain("Detalhe informado pela profissional: cliente VIP");
  });
});

describe("autoria do texto por modo", () => {
  const comum = { procedimento: "botox", situacao: "agendar", tom: "acolhedor", objetivo: "" };
  const texto = "Oi Ana, tenho horário quinta às 15h, pode ser?";

  it("no gerador, o texto da profissional não vira mensagem da cliente", () => {
    const out = buildGeradorUser({ ...comum, modo: "reescrever", mensagemCliente: texto });
    expect(out).toContain(`Texto da profissional: "${texto}"`);
    expect(out).not.toContain("Mensagem da cliente:");
  });

  it("no refine, a tarefa e o rótulo dizem quem escreveu", () => {
    const base = { ...comum, variante: "curta" as const, respostaAtual: "x", mensagemCliente: texto };
    const reescrita = buildRefineUser({ ...base, modo: "reescrever" });
    expect(reescrita).toContain("escrito pela própria profissional");
    expect(reescrita).toContain(`Texto original da profissional: "${texto}"`);
    expect(reescrita).not.toContain("Mensagem original da cliente");
    expect(buildRefineUser(base)).toContain(`Mensagem original da cliente: "${texto}"`);
  });

  it("a diretriz de agendar não anula o horário informado pela profissional", () => {
    expect(situacoes.find((s) => s.id === "agendar")?.diretriz).toContain(
      "a menos que a própria profissional os tenha informado"
    );
  });
});

describe("violaCompliance / DENYLIST", () => {
  it.each([
    "Esse tratamento tem resultado garantido",
    "É 100% seguro, pode confiar",
    "Procedimento sem risco nenhum",
    "Vai ficar perfeita",
    "Emagrece 10 quilos em uma sessão",
    "Cura o melasma de vez",
    "Eu garanto que você vai amar",
    "O botox custa R$ 900",
    "Fica em R$ 1200 e pronto",
  ])("detecta promessa proibida: %s", (texto) => {
    expect(violaCompliance(texto)).toBe(true);
  });

  it.each([
    "O resultado varia de pessoa para pessoa e depende da avaliação.",
    "O investimento começa a partir de R$ 300, mas depende da avaliação.",
    "Fica tranquila, a gente avalia primeiro e te orienta.",
    // Negação de preço fixo não pode ser flagrada como violação.
    "Não trabalhamos com preço fixo — cada caso depende da avaliação.",
    // Estimativa ("em torno de") não é preço cravado.
    "O valor fica em torno de R$ 500, mas só a avaliação confirma.",
  ])("não acusa texto em conformidade: %s", (texto) => {
    expect(violaCompliance(texto)).toBe(false);
  });

  it("a denylist contém ao menos uma regra e todas são RegExp", () => {
    expect(DENYLIST.length).toBeGreaterThan(0);
    expect(DENYLIST.every((re) => re instanceof RegExp)).toBe(true);
  });
});

describe("SYSTEM prompts", () => {
  it("o system do gerador exige saída em JSON com as três chaves", () => {
    expect(SYSTEM_GERADOR).toContain("resposta_curta");
    expect(SYSTEM_GERADOR).toContain("resposta_consultiva");
    expect(SYSTEM_GERADOR).toContain("resposta_persuasiva");
  });

  it.each([
    ["gerador", SYSTEM_GERADOR],
    ["refine", SYSTEM_REFINE],
    ["follow-up", SYSTEM_FOLLOWUP],
  ])("o system de %s traz a regra NÃO INVENTE FATOS", (_nome, system) => {
    expect(system).toContain("NÃO INVENTE FATOS");
    expect(system).toContain("Quer que eu veja um horário pra você?");
    expect(system).toContain("diga que vai verificar");
  });

  it("nenhum prompt manda mencionar disponibilidade", () => {
    const fechamento = buildRefineUser({
      variante: "persuasiva",
      respostaAtual: "x",
      procedimento: "botox",
      situacao: "agendar",
      tom: "urgencia_leve",
      objetivo: "agendamento rápido e breve",
      mensagemCliente: "x",
    });
    const rapido = buildGeradorUser({
      modo: "gerar",
      procedimento: "botox",
      situacao: "agendar",
      tom: "urgencia_leve",
      objetivo: "agendamento rápido e breve",
      mensagemCliente: "x",
    });
    for (const texto of [SYSTEM_GERADOR, fechamento, rapido]) {
      expect(texto).not.toMatch(/urgência leve \(|menção leve a disponibilidade|mencione horários/i);
      expect(texto).not.toContain("confirmação de agenda");
    }
  });

  it("as diretrizes não mandam inventar agenda, condição ou novidade", () => {
    const diretrizes = [
      ...situacoes.map((s) => s.diretriz),
      ...followups.map((f) => f.diretriz),
      ...tons.map((t) => t.instrucao),
    ].join("\n");
    expect(diretrizes).not.toMatch(
      /condição\/horário|formas de pagamento facilitadas|oferecer condição|opções de horário|senso de oportunidade|Oferecer mostrar casos|ou novidade|uma novidade/i
    );
  });

  it("a cliente não é fonte de fato da clínica", () => {
    expect(SYSTEM_GERADOR).not.toContain("ou na mensagem");
    expect(SYSTEM_GERADOR).toContain("não é fato confirmado");
    expect(SYSTEM_GERADOR).toContain("orientação clínica");
  });

  it("autoridade leve e perfil não pedem credencial inventada", () => {
    expect(SYSTEM_GERADOR).toContain("nunca cite equipe, formação, produtos ou experiência");
    expect(SYSTEM_REFINE).toContain("sem citar equipe, formação, produtos ou experiência");
    const qualidade = perfisCliente.find((p) => p.label === "Focada em qualidade");
    expect(qualidade?.diretriz).not.toMatch(/Destaque diferenciais/);
    expect(qualidade?.diretriz).toContain("sem citar diferenciais");
  });

  it("diretrizes não pedem técnica, orientação ou prazo sem fonte", () => {
    const por = (id: string) => situacoes.find((s) => s.id === id)?.diretriz ?? "";
    expect(por("dor")).not.toMatch(/Falar de conforto, técnica/);
    expect(por("dor")).toContain("sem citar anestesia");
    expect(por("pos_atendimento")).not.toMatch(/Reforçar orientações pós-procedimento/);
    expect(por("pos_atendimento")).toContain("sem criar orientação nova");
    expect(followups.find((f) => f.id === "fez_nao_voltou")?.diretriz).toContain(
      "sem citar prazo ou duração"
    );
  });

  it("o pedido de horário fica no Fechamento e fora do pós-atendimento", () => {
    expect(SYSTEM_GERADOR).not.toContain("feche o CTA perguntando");
    expect(SYSTEM_GERADOR).toContain("Se o CTA da clínica envolver agenda, pergunte em vez de afirmar");
    expect(SYSTEM_GERADOR).toMatch(/Fechamento\): quando a situação for de agendamento ou venda/);
    expect(SYSTEM_GERADOR).toContain("em pós-atendimento e pedido de review, não peça horário");
  });

  it("a reescrita do Auditor não pode somar fato", () => {
    expect(SYSTEM_AUDITORIA).toContain("não pode acrescentar fato");
  });
});

describe("bibliotecas estáticas não afirmam fato da clínica", () => {
  const textos = [
    ...objecoes.flatMap((c) => c.itens.map((i) => i.resposta)),
    ...scripts.flatMap((s) => s.passos.map((p) => p.mensagem)),
  ];

  it.each(textos)("%s", (texto) => {
    expect(afirmaFatoSemFonte(texto)).toBe(false);
    expect(texto).not.toMatch(
      /condições de pagamento|tenho sim|já reservo|horários? separados?|pré-reservado|horário sugerido|^sim, trabalhamos/i
    );
  });
});

describe("afirmaDisponibilidade", () => {
  it.each([
    "Temos horários disponíveis essa semana",
    "Temos horários essa semana",
    "Tenho horários",
    "ainda temos vagas",
    "Corre que são as últimas vagas!",
    "abrimos alguns horários de avaliação",
    "Estamos com agenda aberta essa semana",
    "A agenda está quase cheia",
    "Há poucas vagas para novembro",
    "As vagas estão acabando",
    "Horários disponíveis essa semana!",
    // Pergunta depois da afirmação não apaga a afirmação.
    "Tenho horários essa semana — prefere manhã ou tarde?",
    "Temos vaga amanhã, quer marcar?",
    "Temos vaga amanhã - quer marcar?",
    // Pergunta retórica continua afirmando.
    "Que tal aproveitar que ainda temos vagas?",
  ])("sinaliza a afirmação: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(true);
  });

  it.each([
    "Quer que eu veja um horário?",
    "Prefere manhã ou tarde?",
    "vou verificar se temos horário",
    "Vou verificar se temos horário amanhã e já te falo.",
    "se tiver vaga, te aviso",
    "Se tivermos horário, te aviso",
    "que horário você tem disponível?",
    "Me fala que horário você tem disponível.",
    "Tem horário hoje?",
    "Sei que sua agenda está cheia",
    "Tenho certeza que o horário certo vai aparecer",
    "Vou olhar a agenda e te retorno",
    "O resultado varia de pessoa para pessoa.",
    "",
  ])("não sinaliza pergunta ou condicional: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(false);
  });

  it.each([
    // Emoji ou palavra entre a afirmação e a interrogação.
    "Temos horários disponíveis essa semana 😊 Quer que eu reserve?",
    "Temos horários disponíveis essa semana ✨ Prefere manhã ou tarde?",
    "Temos horários essa semana 💕 quer agendar?",
    "Temos horários disponíveis essa semana e posso reservar pra você?",
    "Temos horários essa semana né?",
    "Temos vagas sim viu?",
    "Temos horários ok?",
    "Quer vir amanhã porque temos vaga?",
    // Verificação, condição ou "você" antes não apagam a afirmação.
    "Acabei de ver aqui e temos horário amanhã.",
    "Acabei de verificar e temos vagas amanhã.",
    "Acabei de consultar a agenda e temos horário às 15h.",
    "Acabei de ver os horários disponíveis hoje.",
    "Posso confirmar que temos horário amanhã.",
    "Quero confirmar que temos vagas essa semana.",
    "Não se preocupe que temos horário amanhã.",
    "Só pra você saber que temos vagas essa semana.",
    "Pra você temos horário amanhã.",
    "Pra vc tenho um horário amanhã.",
    "Se quiser temos horários essa semana.",
    "Quando quiser temos horários.",
    "Caso queira temos vaga amanhã.",
    "Pode vir quando quiser que temos horários essa semana",
    "Vejo se tem encaixe e temos vagas sexta também.",
    "Vou verificar a agenda, temos horários amanhã.",
    "A gente tem horário amanhã.",
    // Paráfrases: substantivo.
    "Temos disponibilidade essa semana.",
    "Tenho disponibilidade amanhã.",
    "Há disponibilidade para esta semana.",
    "Há disponibilidade na sexta",
    "Temos agenda essa semana.",
    "Tenho agenda essa semana",
    "Abrimos agenda para novembro.",
    "Temos datas disponíveis.",
    "Tenho um espaço na agenda amanhã.",
    // Número.
    "Temos 2 vagas essa semana.",
    "Temos 3 vagas essa semana",
    "Temos duas vagas essa semana.",
    "Tenho três horários amanhã.",
    "Tenho dois horários amanhã",
    "Restam 3 vagas.",
    "Ainda dá tempo, só restam 2 vagas",
    // Registro informal e singular.
    "Tô com horário livre amanhã.",
    "Tô com vaga essa semana.",
    "Tamo com vaga hoje.",
    "Última vaga da semana!",
    "Último horário do dia!",
    "Sobrou uma vaga.",
    "Sobrou um horário amanhã",
    "Resta uma vaga.",
    // Outros verbos.
    "Consigo te encaixar amanhã.",
    "Consigo te encaixar amanhã às 15h",
    "Posso te encaixar hoje às 15h.",
    "Conseguimos te atender ainda essa semana.",
    "Separei um horário pra você amanhã.",
    "Reservei um horário pra você.",
    "Já reservei um horário pra você.",
    "Consegui uma vaga pra você.",
    "Surgiu uma vaga amanhã.",
    "Apareceu um horário na sexta.",
    "Vagou um horário hoje.",
    "Acabamos de abrir horários.",
    "Teremos horários na próxima semana.",
    "Vai ter vaga amanhã.",
    "Abrimos sábado",
    // Registro formal.
    "Possuímos horários essa semana.",
    "Dispomos de horários essa semana.",
    "Contamos com horários essa semana.",
    // "disponível" sem data obrigatória.
    "Horários disponíveis pra essa semana!",
    "Horários disponíveis para esta semana!",
    "Horários disponíveis na sexta.",
    "Vagas disponíveis!",
    // Agenda da clínica.
    "Nossa agenda está bem cheia.",
    "Agenda dessa semana quase cheia.",
    "Agenda de novembro está aberta.",
    "A agenda dessa semana está aberta.",
    "Agenda está lotando.",
    "A agenda costuma fechar rápido",
    "Os horários costumam sair rápido",
    "Os horários de sábado costumam sair rápido",
    "Os horários de dezembro estão acabando",
    "As vagas da próxima semana estão acabando",
    // Oferta sem a palavra horário.
    "Tenho terça às 15h ou quinta às 10h.",
    "Tenho sexta às 15h ou sábado às 10h, qual prefere?",
  ])("sinaliza a paráfrase: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(true);
  });

  it.each([
    // Verificação, que é o que o prompt pede.
    "Vou conferir os horários disponíveis essa semana.",
    "Vou olhar os horários disponíveis essa semana e já te falo.",
    "Deixa eu conferir os horários abertos pra você.",
    "Vou dar uma olhada nos horários disponíveis hoje.",
    "Já te digo quais horários estão abertos.",
    "Vou checar a agenda, e te passo os horários disponíveis essa semana.",
    "Vou verificar, com calma, os horários disponíveis hoje.",
    "Vou consultar a agenda: te passo os horários abertos em seguida.",
    "Vou verificar com a Dra. Ana os horários disponíveis essa semana e te aviso.",
    "Claro que pode 😊 Vou conferir os horários disponíveis essa semana e já te falo!",
    "Vou ver qual dia tem horário pra você.",
    "Vou ver se consigo te encaixar amanhã.",
    "se tiver vaga disponível, te aviso",
    // Agenda e compromisso da cliente.
    "Entendo, agenda cheia é complicado mesmo!",
    "Entendo! Agenda cheia é complicado mesmo.",
    "Sei como é, com a agenda cheia fica difícil.",
    "Pra quem tem agenda cheia, a avaliação é rapidinha.",
    "Entendo que a agenda tá cheia, sem problema.",
    "Sei como é, a agenda anda cheia mesmo!",
    "Pra quem tem horários corridos, a avaliação é rapidinha.",
    "Muita gente tem horários apertados, por isso a avaliação é rápida.",
    "Você já tem horário marcado, certo?",
    "Sei que você não tem horários fixos.",
    "A senhora tem horário de preferência, pode me dizer?",
    "A avaliação tem horário marcado, então não tem espera.",
    // Vocabulário novo sem oferta de agenda.
    "Tenho disponibilidade pra te ajudar com o que precisar.",
    "Posso te atender melhor se me contar seu objetivo.",
    "Dá pra encaixar na sua rotina sem dificuldade.",
    "Temos segunda opção de tratamento na avaliação.",
  ])("não sinaliza verificação nem assunto da cliente: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(false);
  });

  it("a oração seguinte não herda a verificação quando o verbo é da clínica", () => {
    expect(afirmaDisponibilidade("Vou verificar, mas temos horários amanhã.")).toBe(true);
  });

  describe("exceções: fato que veio da clínica", () => {
    it("aceita a afirmação que repete o CTA preferido", () => {
      const cta = "aproveitar a agenda aberta essa semana";
      expect(afirmaDisponibilidade("Nossa agenda aberta essa semana é pra você!", [cta])).toBe(false);
    });

    it("aceita o que a profissional escreveu ao reescrever", () => {
      const texto = "Oi! Temos horários na sexta à tarde, quer marcar?";
      expect(afirmaDisponibilidade(texto, ["temos horários na sexta à tarde"])).toBe(false);
      expect(afirmaDisponibilidade("Sexta à tarde tenho vaga!", ["tenho vaga sexta à tarde"])).toBe(false);
    });

    it("não aceita dia ou hora que a fonte não trouxe", () => {
      const fonte = "temos horários na sexta";
      expect(afirmaDisponibilidade("Temos horários amanhã", [fonte])).toBe(true);
      expect(afirmaDisponibilidade("Temos horários sexta às 14h", [fonte])).toBe(true);
    });

    it("fonte que não afirma nada não libera a afirmação", () => {
      const ctaSemFato = "ver os horários da agenda";
      expect(afirmaDisponibilidade("Temos horários", [ctaSemFato])).toBe(true);
      expect(afirmaDisponibilidade("Quer ver os horários da agenda?", [ctaSemFato])).toBe(false);
      expect(afirmaDisponibilidade("Temos horários", [undefined, ""])).toBe(true);
    });

    it.each([
      ["Temos vaga na sexta! Quer vir?", "ela perguntou se temos vaga na sexta"],
      ["Temos horários pra você!", "Oi, vou ver se temos horários pra você e te falo"],
      ["Temos vagas essa semana.", "Infelizmente não temos vagas essa semana"],
      ["Temos horários amanhã.", "Não temos horários amanhã, só semana que vem"],
      ["Tem horário amanhã sim!", "Cliente quer saber se tem horário amanhã"],
      ["Temos vaga sexta.", "Temos vaga sexta?"],
    ])("fonte que pergunta, hesita ou nega não libera: %s", (texto, fonte) => {
      expect(afirmaDisponibilidade(texto, [fonte])).toBe(true);
    });

    it.each([
      // Data como substring da fonte.
      ["Temos horário às 4h.", "Temos horário às 14h"],
      ["Temos horários dia 5.", "Temos horários dia 15"],
      ["Temos horário de manhã.", "Temos horários amanhã"],
      ["Temos horário esse mês.", "Temos vagas no mesmo dia"],
      ["Temos horário às 14:30.", "Temos horário às 14:00"],
      ["Temos horários essa semana.", "Temos horários semana que vem"],
      // Data em outra oração da frase.
      ["Temos horários: sexta às 15h ou sábado às 9h.", "Temos horários"],
      ["Temos horários, amanhã às 15h.", "Temos horários"],
      ["Temos horários — amanhã às 15h!", "Temos horários"],
      // Datas que antes não eram lidas.
      ["Temos horários em dezembro.", "Temos horários disponíveis"],
      ["Temos horários no feriado.", "Temos horários disponíveis"],
      ["Temos horários ao meio-dia.", "Temos horários disponíveis"],
      // Número novo.
      ["Temos 2 vagas sexta.", "Temos vagas sexta"],
      // Oferta simples não libera escassez.
      ["Últimas vagas, corre!", "Temos horários"],
      ["Vagas limitadas!", "Temos horários"],
      ["Nossa agenda está quase cheia.", "Temos horários"],
    ])("não aceita o que a fonte não trouxe: %s", (texto, fonte) => {
      expect(afirmaDisponibilidade(texto, [fonte])).toBe(true);
    });

    it.each([
      ["Temos horários sexta às 15h.", "Sexta às 15h tá livre"],
      ["Temos horários sexta às 15h.", "Horário livre sexta às 15h"],
      ["Temos vaga sexta.", "Tenho disponibilidade na sexta"],
      ["Temos vaga às 14h.", "Temos horário às 14:00"],
      ["Boa tarde, temos horários na sexta!", "temos horários na sexta"],
      ["Temos horários na sexta, prefere manhã ou tarde?", "temos horários na sexta"],
      ["Últimas vagas sexta!", "Últimas vagas na sexta"],
      ["Temos vagas sexta.", "Últimas vagas na sexta"],
    ])("aceita o fato real da profissional: %s", (texto, fonte) => {
      expect(afirmaDisponibilidade(texto, [fonte])).toBe(false);
    });
  });

  describe("afirmaCondicao", () => {
    it.each([
      "Temos condições de pagamento pra facilitar.",
      "Parcelamos em até 12x sem juros!",
      "Isso, parcelamos em 12x sem juros!",
      "Temos parcelamento em até 12x.",
      "Temos promoção de botox esse mês.",
      "Consigo 10% de desconto pra você.",
      "Essa semana temos 20% de desconto.",
      "A avaliação é gratuita!",
      "A avaliação é grátis.",
    ])("sinaliza: %s", (texto) => {
      expect(afirmaCondicao(texto)).toBe(true);
      expect(reprovaGeracao(texto)).toBe(true);
    });

    it.each([
      "Vou confirmar as formas de pagamento e te falo.",
      "Vou verificar se temos desconto.",
      "Vou confirmar se parcelamos em até 12x.",
      "Tem desconto?",
      "A avaliação é gratuita?",
      "Temos condições de te ajudar com isso na avaliação.",
    ])("não sinaliza: %s", (texto) => {
      expect(afirmaCondicao(texto)).toBe(false);
    });

    it("aceita a fonte só no mesmo assunto e com o mesmo número", () => {
      const cta = "parcelamos em até 12x";
      expect(afirmaCondicao("Parcelamos em 12x!", [cta])).toBe(false);
      expect(afirmaCondicao("Parcelamos em 6x!", [cta])).toBe(true);
      expect(afirmaCondicao("Temos promoção!", [cta])).toBe(true);
    });
  });

  it("reprovaGeracao soma denylist e disponibilidade", () => {
    expect(reprovaGeracao("Tem resultado garantido")).toBe(true);
    expect(reprovaGeracao("Temos horários essa semana")).toBe(true);
    expect(reprovaGeracao("Temos horários essa semana", ["temos horários essa semana"])).toBe(false);
    expect(reprovaGeracao("Quer que eu veja um horário?")).toBe(false);
  });

  it("o aviso de reescrita não afirma disponibilidade", () => {
    expect(afirmaDisponibilidade(AVISO_FATOS)).toBe(false);
  });
});

describe("Auditor continua aceitando a agenda da própria clínica", () => {
  const texto = "Temos horários essa semana, últimas vagas e agenda aberta!";

  it("a checagem de disponibilidade não entra na denylist", () => {
    expect(denylistHits(texto)).toEqual([]);
    expect(violaCompliance(texto)).toBe(false);
    expect(DENYLIST_RULES).toHaveLength(11);
  });

  it("o prompt do Auditor não recebe a regra e mantém a intenção do texto", () => {
    expect(SYSTEM_AUDITORIA).not.toContain("NÃO INVENTE FATOS");
    expect(SYSTEM_AUDITORIA).toContain("manter a INTENÇÃO");
    expect(buildAuditoriaUser({ texto })).toContain(texto);
  });
});
