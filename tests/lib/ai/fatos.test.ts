import { describe, it, expect } from "vitest";
import {
  afirmaCondicao,
  afirmaDisponibilidade,
  afirmaFatoSemFonte,
  buildGeradorUser,
  buildRefineUser,
  pedidoDeReescrita,
  reprovaGeracao,
  trechoContinua,
  AVISO_FATOS,
  REGRA_FATOS,
  SYSTEM_GERADOR,
  SYSTEM_REFINE,
} from "@/lib/ai/prompts";
import { situacoes } from "@/data/situacoes";
import type { GerarInput } from "@/lib/types";

describe("resposta que só confirma a pergunta da cliente", () => {
  const curtas = [
    "Tem sim, linda! Prefere de manhã ou à tarde?",
    "Temos sim! Prefere manhã ou tarde? 😊",
    "Tenho sim 😊",
    "Sim, temos!",
    "Claro que tem!",
    "Consigo sim!",
    "Dá sim!",
    "Pode sim!",
    "Fazemos sim!",
    "Aceitamos sim!",
    "É gratuita sim!",
    "Temos, sim!",
    "Oi, linda! Tem sim!",
    "Claro! Prefere manhã ou tarde?",
    "Com certeza! Me diz qual dia.",
  ];

  it.each(curtas)("reprova com a pergunta da cliente: %s", (texto) => {
    expect(reprovaGeracao(texto, [], { mensagemCliente: "Tem horário hoje?" })).toBe(true);
    expect(
      reprovaGeracao(texto, [], { mensagemCliente: "Se eu fechar hoje você faz um desconto?" })
    ).toBe(true);
  });

  it.each(curtas)("sem pergunta sobre fato, passa: %s", (texto) => {
    expect(reprovaGeracao(texto)).toBe(false);
    expect(reprovaGeracao(texto, [], { mensagemCliente: "Dói muito?" })).toBe(false);
  });

  it("a situação vale mesmo sem vocabulário na mensagem", () => {
    const cliente = { mensagemCliente: "Faz por menos?", situacao: "desconto" };
    expect(reprovaGeracao("Faço sim!", [], cliente)).toBe(true);
    expect(reprovaGeracao("Claro!", [], cliente)).toBe(true);
  });

  it.each([
    "Claro! Vou verificar a agenda e já te falo.",
    "Sim, vou confirmar e te aviso 😊",
    "Claro que pode 😊 Vou conferir e já te falo!",
  ])("verificar não é confirmar: %s", (texto) => {
    expect(reprovaGeracao(texto, [], { mensagemCliente: "Tem horário hoje?" })).toBe(false);
  });

  it("confirmação forte não vira verificação", () => {
    const cliente = { mensagemCliente: "Tem horário hoje?" };
    expect(reprovaGeracao("Tem sim! Vou verificar qual é o melhor.", [], cliente)).toBe(true);
  });

  it("quem só pede para agendar não perguntou nada", () => {
    const cliente = { mensagemCliente: "Quero agendar uma avaliação", situacao: "agendar" };
    expect(reprovaGeracao("Claro! Prefere manhã ou tarde?", [], cliente)).toBe(false);
    expect(reprovaGeracao("Tem sim!", [], cliente)).toBe(true);
  });
});

describe("dia e hora específicos", () => {
  it.each([
    "Tenho amanhã às 15h",
    "Temos amanhã às 15h",
    "Tenho hoje às 15h",
    "Tem sexta às 15h",
    "Tem amanhã às 15h",
    "Hoje tem às 15h",
    "Tenho dia 15",
    "Temos dia 20 às 14h",
    "Tenho às 15",
    "Tenho 15h",
    "Tenho 9h ou 14h",
    "Consigo amanhã às 15h",
    "Pode vir amanhã às 15h",
    "Te espero amanhã às 15h!",
    "Vem amanhã às 15h",
    "Pode vir sexta às 10h",
    "Amanhã às 14h ou quinta às 10h, qual fica melhor pra você?",
    "Tenho amanhã às 14h ou quinta às 10h, tudo bem?",
    "Temos amanhã",
    "Consigo hoje",
    "Estamos abertos no sábado.",
    "Funcionamos até as 20h.",
    // Pergunta que oferece vaga inventada.
    "Prefere amanhã às 15h ou sexta às 10h?",
    "Quer vir amanhã às 15h?",
    "Sexta às 15h fica bom?",
    "Posso reservar o horário das 15h pra você?",
    "Quer aproveitar a vaga de amanhã?",
  ])("reprova: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(true);
  });

  it.each([
    "Vou verificar se tenho sexta às 15h e já te falo.",
    "Vou ver sexta às 15h pra você.",
    "Se tiver às 15h, te aviso",
    "Você vê o resultado em 24h.",
    "Evite sol por 24h.",
    "Nas primeiras 48h, siga as orientações.",
    "São as 3 sessões combinadas.",
    "Prefere manhã ou tarde?",
  ])("não reprova: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(false);
  });

  it("a hora que veio da fonte passa, e a pergunta com ela também", () => {
    const fonte = "tenho horário quinta às 15h";
    expect(afirmaDisponibilidade("Tenho quinta às 15h, pode ser?", [fonte])).toBe(false);
    expect(afirmaDisponibilidade("Quinta às 15h fica bom?", [fonte])).toBe(false);
    expect(afirmaDisponibilidade("Quinta às 16h fica bom?", [fonte])).toBe(true);
  });
});

describe("agendamento que nunca aconteceu", () => {
  it.each([
    "Já reservei seu horário",
    "Reservei sua vaga",
    "Já separei seu horário",
    "Já guardei sua vaga",
    "Reservei o horário das 15h",
    "Já reservo pra você",
    "Fica reservado",
    "Já agendei você",
    "Agendei você pra sexta",
    "Marquei você amanhã às 15h",
    "Sua avaliação está marcada",
    "Horário confirmado",
    "Tenho um horário marcado pra você amanhã às 15h",
    "Você tem horário amanhã às 15h comigo!",
    "Você tem um horário reservado amanhã",
    "Sua avaliação está confirmada para sexta às 15h",
    "Combinado, linda! Fica agendado sexta às 15h.",
    "Pronto, já marquei sua avaliação para sexta às 15h!",
    "Já te coloco na agenda de sexta, tá?",
    "Ficou agendado para amanhã às 14h, tá?",
    "Já agendei você para amanhã às 10h.",
    "Marquei sua avaliação para quinta às 16h.",
  ])("reprova: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(true);
  });

  it.each([
    "Quer que eu deixe marcado?",
    "Sua avaliação está marcada?",
    "Vou confirmar se sua avaliação está marcada.",
    "Você já tem horário marcado, certo?",
    "A avaliação tem horário marcado, então não tem espera.",
  ])("não reprova: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(false);
  });

  it("fonte de oferta simples não libera reserva", () => {
    const fonte = "Temos horários amanhã";
    expect(afirmaDisponibilidade("Reservei um horário amanhã", [fonte])).toBe(true);
    expect(afirmaDisponibilidade("Separei uma vaga pra você", ["Temos horários"])).toBe(true);
    expect(afirmaDisponibilidade("Reservei sexta pra você", ["Reservei sexta pra você"])).toBe(false);
  });
});

describe("voz \"a gente\"", () => {
  it.each([
    "A gente consegue te encaixar amanhã",
    "A gente consegue te atender amanhã",
    "A gente consegue um horário pra você",
    "A gente tá com vaga sexta",
    "A gente está com vaga",
    "A gente atende sábado",
    "A gente abre sábado",
    "A clínica tá com vaga essa semana",
    "A Dra. tá com horário amanhã",
    "A gente parcela em 3x",
    "A gente faz desconto",
    "A gente dá desconto",
    "A gente faz parcelamento",
    "A gente consegue um desconto",
    "A gente aceita cartão",
  ])("reprova: %s", (texto) => {
    expect(afirmaFatoSemFonte(texto)).toBe(true);
  });

  it("não acusa o registro normal das respostas", () => {
    expect(afirmaFatoSemFonte("A gente sempre tenta facilitar pra você")).toBe(false);
    expect(afirmaFatoSemFonte("A gente avalia primeiro e te orienta.")).toBe(false);
  });
});

describe("promessas de pagamento e condição", () => {
  it.each([
    "Dá pra parcelar",
    "Dá pra parcelar no cartão",
    "Pode parcelar sim!",
    "Você pode parcelar no cartão",
    "Trabalhamos com parcelamento",
    "Aceitamos cartão",
    "Aceitamos Pix",
    "Dá pra dividir em 3x",
    "até 12x",
    "em 12x no cartão",
    "Faço em 3x",
    "em até 10 vezes",
    "10% de desconto",
    "Posso fazer um desconto",
    "Posso te dar um desconto",
    "Consigo fazer um desconto",
    "Faço um preço especial",
    "Desconto no pix",
    "Estamos em promoção",
    "Tá em promoção",
    "Promoção válida até sexta",
    "Temos formas de pagamento",
    "Facilitamos o pagamento",
    "Condições especiais",
    "Não cobramos a avaliação",
    "A avaliação não tem custo",
    "O retorno é gratuito",
    "Pode parcelar em 10x no cartão.",
    "Dá sim, pode parcelar!",
    "Dá pra dividir em até 6 vezes.",
    "Você ganha 10% de desconto no Pix.",
    "Essa semana está com 20% de desconto.",
    "A primeira avaliação é cortesia.",
    // Sempre inventado no gerar: o perfil não tem preço.
    "A avaliação é R$ 150.",
    "O botox fica a partir de R$ 900.",
    "O valor é R$ 900.",
    "Temos 10 anos de experiência.",
    "Já atendemos mais de 5 mil clientes.",
    "O efeito dura 6 meses.",
  ])("reprova: %s", (texto) => {
    expect(afirmaCondicao(texto)).toBe(true);
  });

  it.each([
    "Vou confirmar se dá pra parcelar.",
    "Vou confirmar se aceitamos cartão.",
    "Vou ver se consigo fazer um desconto.",
    "Use 2x ao dia.",
    "São 2 vezes por semana.",
    "Vou confirmar as formas de pagamento.",
  ])("não reprova: %s", (texto) => {
    expect(afirmaCondicao(texto)).toBe(false);
  });

  it("marcas e orientação clínica ficam só na regra do prompt", () => {
    expect(afirmaCondicao("Usamos toxina Allergan.")).toBe(false);
    expect(afirmaCondicao("Evite sol por 7 dias depois do procedimento.")).toBe(false);
    expect(REGRA_FATOS).toContain("marcas");
    expect(REGRA_FATOS).toContain("orientação clínica");
  });
});

describe("escassez e urgência", () => {
  it.each([
    "Garanta sua vaga",
    "Garanta já seu horário",
    "Corre pra garantir sua vaga",
    "Sua vaga está garantida",
    "Horário garantido",
    "Não perca sua vaga",
    "Estamos com a agenda cheia",
    "Estamos com a agenda lotada",
    "Temos a agenda cheia",
    "Estamos lotadas essa semana",
    "Agenda lotada!",
    "A agenda lota rápido",
    "A agenda enche rápido",
    "Os horários acabam rápido",
    "Os horários voam",
    "As vagas estão voando",
    "As vagas esgotam rápido",
    "Enquanto houver vagas",
    "Essa semana está quase lotada",
    "A agenda tá tranquila",
    "As vagas tão acabando!",
  ])("reprova: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(true);
  });
});

describe("ressalva não vira brecha", () => {
  it.each([
    "Para o seu caso temos horário amanhã!",
    "No seu caso temos vaga amanhã.",
    "Nesse caso temos vaga amanhã",
    "Pro seu caso parcelamos em 3x",
    "Vou verificar mas temos horários amanhã.",
    "Vou ver mas temos vaga sim",
    "Vou olhar porque temos vaga",
    "Deixa eu ver aqui temos vaga sim",
    "Veja só temos vagas amanhã!",
    "Posso confirmar q temos horário amanhã.",
    "Vejo q temos vaga amanhã",
    "Dei uma olhada aqui temos vaga",
    "Sei que é corrido, mas a agenda está lotando",
    "Entendo sua pressa, a agenda está quase cheia",
  ])("reprova: %s", (texto) => {
    expect(afirmaFatoSemFonte(texto)).toBe(true);
  });
});

describe("formas de horário e vaga", () => {
  it.each([
    "Temos opções de horário essa semana",
    "Temos algumas opções de horário",
    "Temos outros horários",
    "Temos muitos horários",
    "Temos esse horário",
    "Temos o horário das 15h",
    "Consigo um horário pra você",
    "Conseguimos um horário pra você",
    "Tenho uma vaguinha amanhã",
    "Temos um horarinho",
    "Consigo um encaixezinho",
    "Tenho hr amanhã",
    "Temos hrs livres",
    "Tenho vg amanhã",
    "Tô c/ vaga",
    "Temos *vagas* essa semana",
    "Temos, sim, horários essa semana",
    "Horários? Temos!",
    "Vaga eu tenho",
  ])("reprova: %s", (texto) => {
    expect(afirmaDisponibilidade(texto)).toBe(true);
  });
});

describe("fonte negada, hesitante ou relatada", () => {
  it.each([
    "Ñ temos vaga sexta, só sábado",
    "N temos vaga sexta, só sábado",
    "Num temos vaga sexta",
    "Nunca temos vaga sexta",
    "Nem temos vaga sexta",
    "Acho que temos vaga sexta, mas preciso confirmar",
    "Acredito que temos vaga sexta, vou confirmar",
    "Temos vaga sexta, mas preciso confirmar",
    "Ela disse que temos vaga sexta",
    "Ela acha que temos vaga sexta",
  ])("não libera a afirmação: %s", (fonte) => {
    expect(afirmaFatoSemFonte("Temos vaga sexta!", [fonte])).toBe(true);
  });

  it.each([
    ["Fazemos 12x sem juros sim!", "ela viu no Instagram 12x sem juros"],
    ["Fazemos 12x sem juros sim!", "Cliente pediu 12x sem juros"],
    ["Fazemos 12x sem juros sim!", "Cliente quer 12x sem juros"],
    ["A avaliação é gratuita!", "Ela achou que a avaliação é gratuita"],
  ])("relato da cliente não libera: %s", (texto, fonte) => {
    expect(afirmaFatoSemFonte(texto, [fonte])).toBe(true);
  });
});

describe("data inventada fora da frase da afirmação", () => {
  it.each([
    ["Temos horários essa semana! Terça às 10h ou quinta às 15h, qual fica melhor?", "Oi, temos horários essa semana, quer marcar?"],
    ["Temos horários! Sexta às 15h ou sábado às 9h.", "Temos horários"],
    ["Temos horários. Sexta às 15h ou sábado às 9h?", "Temos horários"],
    ["Temos horários 😊 Sexta às 15h?", "Temos horários"],
    ["Agenda aberta! Sexta às 15h.", "Agenda aberta essa semana"],
    ["Temos horários! Sexta ou sábado.", "Temos horários"],
    ["Temos horários. Sexta?", "Temos horários"],
  ])("reprova: %s", (texto, fonte) => {
    expect(afirmaDisponibilidade(texto, [fonte])).toBe(true);
  });

  it("o período perguntado depois não é data nova", () => {
    const fonte = "Temos horários na sexta";
    expect(afirmaDisponibilidade("Temos horários na sexta. Prefere manhã ou tarde?", [fonte])).toBe(false);
  });

  it("data em outra frase só pesa quando o texto afirma agenda", () => {
    expect(afirmaCondicao("Parcelamos em 12x. Quer vir sexta?", ["Parcelamos em 12x"])).toBe(false);
  });
});

describe("a exceção compara o fato, não só a regra", () => {
  it.each([
    ["Parcelamos em até 12x sem juros!", "Oi, parcelamos em até 12x no cartão"],
    ["Sem juros!", "Parcelamos em até 12x"],
    ["A consulta é gratuita", "A avaliação é gratuita"],
    ["A sessão é gratuita", "A avaliação é gratuita"],
    ["Temos condição especial", "Temos condições de pagamento"],
    ["Temos promoção de preenchimento", "Temos promoção de botox"],
    ["Temos desconto", "Se fechar pacote temos desconto"],
    ["Temos desconto", "Se fechar pacote, temos desconto"],
  ])("reprova: %s", (texto, fonte) => {
    expect(afirmaCondicao(texto, [fonte])).toBe(true);
  });

  it.each([
    ["Temos três horários amanhã", "Temos horários amanhã"],
    ["Só tenho um horário amanhã", "Temos horários amanhã"],
  ])("numeral e 'só' são dado novo: %s", (texto, fonte) => {
    expect(afirmaDisponibilidade(texto, [fonte])).toBe(true);
  });

  it.each([
    ["Temos promoção de botox!", "Temos promoção de botox esse mês"],
    ["Temos duas vagas sexta", "Temos 2 vagas sexta"],
    ["Parcelamos em até 12x sem juros!", "Parcelamos em até 12x sem juros"],
    ["Temos vaga sexta, se quiser!", "Se quiser temos vaga sexta"],
  ])("aceita o mesmo fato: %s", (texto, fonte) => {
    expect(afirmaFatoSemFonte(texto, [fonte])).toBe(false);
  });
});

describe("disponibilidade da própria cliente", () => {
  it.each([
    "Me diz um horário disponível pra você e eu verifico a agenda.",
    "Vou te passar os horários disponíveis assim que eu conferir.",
    "Quando você tiver um horário livre, me chama que eu vejo a agenda 💕",
    "Me diz quais horários estão livres pra você.",
    "Me fala os horários livres da sua semana.",
    "Me passa seus horários disponíveis.",
    "Me manda suas datas disponíveis.",
    "Nos seus horários livres, me chama.",
    "Se você tiver um horário livre, me chama.",
    "Quando vc tiver um horário livre, me chama.",
    "Pensa num horário livre na sua semana e me diz.",
    "Muitas clientes têm agenda corrida, por isso a avaliação é rápida.",
    "Todo mundo tem agenda cheia.",
    "Pra você que tem agenda cheia, a avaliação é rápida.",
    "Se a agenda está cheia, a gente vê depois.",
  ])("não reprova: %s", (texto) => {
    expect(afirmaFatoSemFonte(texto)).toBe(false);
  });

  it("oferta da clínica continua reprovada", () => {
    expect(afirmaDisponibilidade("Temos um horário disponível pra você")).toBe(true);
    expect(afirmaDisponibilidade("Horário disponível pra você amanhã")).toBe(true);
  });
});

describe("frases de verificação", () => {
  it.each([
    "Verificamos os horários disponíveis e te falamos.",
    "A gente verifica os horários disponíveis e te fala.",
    "A gente vê um horário disponível pra você.",
    "A gente confirma os horários disponíveis.",
    "Vou te passar os horários disponíveis.",
    "Vou te enviar os horários disponíveis.",
    "Vou buscar um horário disponível pra você.",
    "Vou procurar um horário livre pra você.",
    "Vou dar uma conferida nos horários disponíveis.",
    "Vou perguntar quais horários estão disponíveis.",
    "Assim que eu tiver os horários disponíveis, te passo.",
    "Te retorno com os horários disponíveis.",
    "Vou te mandar os horários disponíveis.",
    "Já te mando os horários disponíveis.",
  ])("não reprova: %s", (texto) => {
    expect(afirmaFatoSemFonte(texto)).toBe(false);
  });
});

describe("resposta honesta que diz não saber", () => {
  it.each([
    "Sobre o parcelamento em até 10x, vou confirmar pra você.",
    "Sobre os 12x sem juros que você viu, vou verificar.",
    "Sem juros eu não sei, vou confirmar.",
    "Ainda não sei se é sem juros.",
    "Não sei se a avaliação é gratuita, vou confirmar.",
    "Ainda não sei se a agenda está aberta, vou verificar.",
    "Você perguntou se a avaliação é gratuita, vou confirmar.",
    "Você perguntou se os horários estão abertos.",
    "Ainda não tenho horário confirmado, vou verificar.",
    "Por enquanto não tenho horários confirmados, vou olhar a agenda.",
    "Temos horário amanhã? Vou verificar pra você!",
  ])("não reprova: %s", (texto) => {
    expect(afirmaFatoSemFonte(texto)).toBe(false);
  });

  it("dizer que não tem vaga, sem fonte, também é fato inventado", () => {
    expect(afirmaDisponibilidade("Não temos vaga amanhã")).toBe(true);
    expect(afirmaDisponibilidade("Não temos vaga amanhã", ["Não temos vaga amanhã, só sexta"])).toBe(false);
  });

  it("afirmar e prometer verificar depois continua reprovado", () => {
    expect(afirmaDisponibilidade("Temos horário amanhã, vou verificar qual.")).toBe(true);
  });
});

describe("fonte legítima em outra forma", () => {
  it.each([
    ["Temos horários dia 15 de novembro", "Temos horários dia 15/11"],
    ["Temos horários sexta", "Temos horários sex"],
    ["Temos horários às 3 da tarde", "Temos horários às 15h"],
    ["Tenho horário quinta à tarde", "tenho horário quinta às 15h"],
    ["Temos horários sexta e sábado", "Temos horários sexta. Temos horários sábado"],
    ["Temos vagas", "Temos vagas não perca"],
  ])("aceita: %s", (texto, fonte) => {
    expect(afirmaDisponibilidade(texto, [fonte])).toBe(false);
  });
});

describe("texto dos prompts", () => {
  it("o pedido de reescrita só pede horário em agenda ou venda", () => {
    const fato = pedidoDeReescrita("x", true, "agendar");
    expect(fato).toContain(AVISO_FATOS);
    expect(pedidoDeReescrita("x", false, "agendar")).toBe("\n\nATENÇÃO: x Responda só com o JSON.");
    for (const pos of ["pos_atendimento", "pedir_avaliacao", "retorno_procedimento"]) {
      for (const inventou of [true, false]) {
        const pedido = pedidoDeReescrita("x", inventou, pos);
        expect(pedido).toMatch(/não peça horário/i);
        expect(pedido).not.toContain("veja um horário");
      }
    }
  });

  it("a regra proíbe dizer que marcou, e 'Quer agendar' não manda confirmar", () => {
    expect(REGRA_FATOS).toContain("Nunca diga que marcou, reservou, confirmou ou garantiu horário");
    const diretriz = situacoes.find((s) => s.id === "agendar")?.diretriz;
    expect(diretriz).toContain("Confirmar qual procedimento ela quer");
    expect(diretriz).not.toContain("procedimento/avaliação");
  });

  it("os procedimentos do perfil chegam à IA", () => {
    const base: GerarInput = {
      modo: "gerar",
      procedimento: "",
      situacao: "",
      tom: "",
      objetivo: "",
      mensagemCliente: "Vocês fazem preenchimento labial?",
    };
    const clinica = { procedimentos: ["botox", "Peeling"] };
    expect(buildGeradorUser({ ...base, clinica })).toContain(
      "Procedimentos oferecidos: Botox (toxina botulínica), Peeling."
    );
    expect(buildGeradorUser(base)).not.toContain("Procedimentos oferecidos");
    expect(buildGeradorUser({ ...base, clinica: { procedimentos: [] } })).not.toContain(
      "Procedimentos oferecidos"
    );
    expect(REGRA_FATOS).toContain("procedimentos oferecidos");
  });

  it("agenda informada pela profissional não é proibida pelas outras linhas", () => {
    expect(SYSTEM_GERADOR).toContain(
      "pergunte em vez de afirmar, salvo fato informado pela profissional ou pelo CTA"
    );
    expect(SYSTEM_GERADOR).toContain(
      "sem afirmar disponibilidade, salvo fato informado pela profissional ou pelo CTA"
    );
    expect(SYSTEM_GERADOR).toContain('"Como conduzir", quando informado');
  });

  it("Melhorar segue a mesma brevidade do gerador", () => {
    expect(SYSTEM_REFINE).toContain("máximo ~70 palavras");
    expect(SYSTEM_REFINE).toContain("nunca mais longa que a resposta atual");
    const out = buildRefineUser({
      variante: "curta",
      respostaAtual: "x",
      procedimento: "",
      situacao: "",
      tom: "",
      objetivo: "agendamento rápido e breve",
      mensagemCliente: "x",
    });
    expect(out).toContain("PRIORIDADE ESPECIAL");
  });
});

describe("revisão do PR #191", () => {
  const sextaESabado = ["Temos horário sexta às 15h. Temos horário sábado às 9h."];

  it.each([
    "Hoje fiz botox e ficou vermelho, é normal?",
    "Fiz botox na sexta. Isso é normal?",
    "Fiz às 15h, é normal?",
  ])("perguntar se é normal não vira pergunta de agenda: %s", (mensagemCliente) => {
    expect(
      reprovaGeracao("Claro! Cada caso precisa ser avaliado individualmente.", [], {
        mensagemCliente,
      })
    ).toBe(false);
  });

  it.each([
    "Tem horário hoje?",
    "Sexta às 15h?",
    "Sexta às 15h, pode ser?",
    "Sexta às 15h, tudo bem?",
    "Quero sexta. Pode ser?",
    "Sábado às 10h fica bom?",
    "Amanhã tem?",
    "Pode ser sábado?",
    "Vocês atendem domingo?",
    "Vocês fazem botox no sábado?",
    "Vocês funcionam no sábado de manhã?",
    "Daria pra ir sexta às 15h?",
    "Consigo ir amanhã de manhã?",
    "Você consegue me atender? Só posso na sexta.",
    "Fiz botox sexta, pode ser sábado?",
    "Vocês fazem maquiagem no sábado?",
    "Vocês atendem normal amanhã?",
    "Posso ir hoje depois da academia?",
    "Fiz a avaliação e quero voltar sexta, pode ser?",
    "Ficou marcado pra sexta, né?",
    "Vocês atendem sábado? Isso é normal?",
    "Vocês atendem sábado? Fiquei com um hematoma do preenchimento.",
    "Tô inchada, vocês atendem amanhã?",
    "Hoje tem atendimento? Tô ardendo.",
    "Posso ir aí sábado pra ver esse hematoma?",
  ])("confirmar pergunta de agenda segue reprovado: %s", (mensagemCliente) => {
    expect(reprovaGeracao("Claro! Te espero.", [], { mensagemCliente })).toBe(true);
  });

  it("em retorno, pedido de horário segue sendo agenda", () => {
    expect(
      reprovaGeracao("Claro! Te espero.", [], {
        mensagemCliente: "Pode ser sexta às 15h?",
        situacao: "retorno_procedimento",
      })
    ).toBe(true);
  });

  it.each([
    ["Entendi que você só pode às 15h. Vou verificar a agenda e te aviso.", "Só posso às 15h"],
    ["Entendi, você só pode às 15h. Vou verificar.", "Só posso às 15h"],
    ["Entendi que você só pode às 15h. Vou verificar.", "Só posso às 15h, tem horário?"],
    ["Entendi que você só pode sexta às 15h. Vou ver a agenda.", "Só posso sexta às 15h"],
    ["Anotado, você só pode antes das 10h. Vou verificar.", "Só posso antes das 10h"],
  ])("aceita repetir o que a cliente disse antes de verificar: %s", (texto, mensagemCliente) => {
    expect(reprovaGeracao(texto, [], { mensagemCliente })).toBe(false);
  });

  it.each([
    "Você prefere às 15h?",
    "Temos às 15h.",
    "Temos horário às 15h.",
    "Entendi que você só pode às 16h.",
    "Entendi que você só pode às 15h na sexta.",
    "Entendi que você só pode às 15h, te espero!",
    "Às 15h fica bom?",
    "Você pode vir às 15h.",
    "Você pode vir sexta às 15h.",
    "Você pode às 15h, te espero!",
    "Sim, você pode às 15h!",
    "Como você disse, te espero às 15h.",
    "Perfeito! Você prefere às 15h, então te aguardo!",
    "Entendi que você só pode às 15h.",
    "Entendi que você só pode às 15h. Pode vir!",
    "Entendi que você só pode às 15h. Te espero!",
    "Anotado, você só pode às 15h. Combinado!",
    "Fechado! Entendi que você só pode às 15h.",
  ])("a hora da cliente não vira agenda da clínica: %s", (texto) => {
    expect(reprovaGeracao(texto, [], { mensagemCliente: "Só posso às 15h" })).toBe(true);
  });

  it.each([
    ["Entendi, você só pode às 15h.", "Posso ir às 15h?"],
    ["Anotado, você pode vir às 15h.", "Posso vir às 15h?"],
    ["Anotado, você consegue encaixe às 15h.", "Consigo encaixe às 15h?"],
  ])("responder a pergunta dela não é repetir o que ela disse: %s", (texto, mensagemCliente) => {
    expect(reprovaGeracao(texto, [], { mensagemCliente })).toBe(true);
  });

  it.each([
    "Temos horário sexta às 9h.",
    "Temos horário às 9h na sexta.",
    "Às 9h na sexta fica bom?",
    "Sexta às 9h fica bom?",
  ])("não mistura dia e hora de ofertas diferentes: %s", (texto) => {
    expect(afirmaDisponibilidade(texto, sextaESabado)).toBe(true);
  });

  it.each([
    ["Temos horário sexta às 15h.", sextaESabado],
    ["Sexta às 15h fica bom?", sextaESabado],
    ["Temos horário às 15h na sexta.", sextaESabado],
    ["Temos horário sexta às 15h ou sábado às 9h.", sextaESabado],
    ["Temos horário sexta às 15h.", ["Atendemos sexta e sábado às 15h."]],
    ["Sábado às 15h fica bom?", ["Atendemos sexta e sábado às 15h."]],
    ["Temos horário às 9h no sábado.", ["Temos horário às 15h na sexta e às 9h no sábado."]],
    ["Temos horário às 15h ou às 17h.", ["Temos horário às 15h. Temos horário às 17h."]],
    ["Temos horário sexta às 10h e às 15h.", ["Temos horário sexta às 10h. Temos horário sexta às 15h."]],
    ["Sua avaliação é sexta às 15h.", ["Avaliação na sexta. Horário: 15h."]],
    ["Sábado às 8h fica bom?", ["Atendemos aos sábados. Abrimos às 8h."]],
    ["Terça às 9h fica bom?", ["Atendemos de segunda a sexta, das 9h às 18h."]],
    ["Sua avaliação é sexta às 15h, e a sessão dura 30 minutos.", ["Avaliação sexta às 15h. A sessão dura 30 minutos."]],
    ["Funcionamos das 9h às 18h.", ["Funcionamos das 9h às 18h, se tiver dúvidas é só chamar."]],
    ["Lembrando do seu retorno sexta às 15h.", ["Retorno marcado para sexta às 15h, ela pediu para lembrar."]],
    ["Temos horário amanhã às 14h. Posso confirmar?", ["Temos horário amanhã às 14h, posso confirmar?"]],
    ["Olá, Ana! Sexta às 15h fica bom pra você?", ["Oi Ana, sexta às 15h fica bom pra você?"]],
    ["Prefere sexta de manhã ou sábado às 15h?", ["Temos sexta de manhã. Temos sábado às 15h."]],
    ["Se sexta não der, sábado às 9h fica bom?", sextaESabado],
    ["Sexta às 12h fica bom?", ["Segunda a sexta das 9h às 18h. Sábado das 9h às 12h."]],
    ["Sua avaliação é sexta às 15h.", ["Sua avaliação é sexta às 15h e não precisa de jejum."]],
    ["Sexta às 15h fica bom?", ["Temos sexta às 15h mas não sábado."]],
    ["Sexta às 15h fica bom?", ["Vou verificar o sábado, mas sexta às 15h está confirmada."]],
    ["Sua avaliação é sexta às 15h.", ["Sua avaliação é sexta às 15h e vou confirmar o sábado."]],
    ["Funcionamos das 9h às 18h.", ["Se tiver dúvidas, funcionamos das 9h às 18h."]],
    ["Sua avaliação é sexta às 15h.", ["Lembre-se da sua avaliação sexta às 15h."]],
  ])("oferta que a fonte traz segue valendo: %s", (texto, fontes) => {
    expect(reprovaGeracao(texto, fontes)).toBe(false);
  });

  it.each([
    "Vou verificar se tenho sexta às 15h.",
    "Ela perguntou se temos sexta às 15h.",
    "Acho que temos sexta às 15h.",
  ])("hora de fonte não confirmada não libera oferta: %s", (fonte) => {
    expect(afirmaDisponibilidade("Sexta às 15h fica bom?", [fonte])).toBe(true);
  });

  it.each([
    ["Aceitamos Pix.", ["Aceitamos cartão."]],
    ["Aceitamos Pix e boleto.", ["Aceitamos Pix."]],
  ])("forma de pagamento fora da fonte não passa: %s", (texto, fontes) => {
    expect(afirmaCondicao(texto, fontes)).toBe(true);
  });

  it.each([
    ["Aceitamos cartões.", ["Aceitamos cartão."]],
    ["Aceitamos cartão e Pix.", ["Aceitamos cartão e Pix."]],
    ["Aceitamos cartão e Pix.", ["Aceitamos cartão. Aceitamos Pix."]],
    ["Aceitamos cartão de crédito e débito.", ["Aceitamos crédito e débito."]],
    ["Parcelamos em até 12x no cartão.", ["Parcelamos em até 12x no cartão de crédito."]],
    ["Parcelamos em até 12x no cartão.", ["Parcelamos em até 12x. Aceitamos cartão."]],
    ["Aceitamos Pix mas não cartão.", ["Aceitamos Pix. Não aceitamos cartão."]],
    ["Aceitamos cartão.", ["Aceitamos cartão mas não parcelamos."]],
  ])("forma de pagamento da fonte passa: %s", (texto, fontes) => {
    expect(afirmaCondicao(texto, fontes)).toBe(false);
  });

  it("forma de pagamento citada em outra frase da fonte não barra a agenda", () => {
    expect(
      reprovaGeracao("Atendemos de segunda a sexta, e aceitamos Pix e cartão.", [
        "Atendemos de segunda a sexta. Aceitamos Pix e cartão.",
      ])
    ).toBe(false);
  });

  it("palavra dinheiro não é forma de pagamento", () => {
    expect(
      reprovaGeracao("Temos promoção de botox e você economiza dinheiro.", [
        "Temos promoção de botox.",
      ])
    ).toBe(false);
  });

  it("procedimento da promoção segue preso ao fato da regra", () => {
    expect(
      reprovaGeracao("Temos desconto no botox.", [
        "Temos desconto no preenchimento. A promoção de botox acabou.",
      ])
    ).toBe(true);
  });

  it.each([
    ["seu melasma é leve", "Olá, Ana! Seu melasma é leve."],
    ["Oi, Ana, seu melasma é leve.", "Olá, Ana, seu melasma é leve."],
    ["Seu melasma é leve.", "Olá, Ana! Seu melasma é leve 😊"],
    ["Seu rosto fica impecável na hora!", "Olá! Seu rosto fica impecável na hora."],
    ["Emagreça rápido, sem dor", "Olá, Ana! Emagreça rápido, sem dor."],
  ])("trecho apontado continua mesmo com outra pontuação: %s", (trecho, texto) => {
    expect(trechoContinua(trecho, texto)).toBe(true);
  });

  it.each([
    ["R$ 900", "O botox é a partir de R$ 900, e o valor final depende da avaliação."],
    ["resultado", "O resultado varia de pessoa para pessoa."],
    ["R$ 1.500", "O botox é a partir de R$ 1.500, e o valor final depende da avaliação."],
    ["cura", "Ajuda quem procura suavizar rugas."],
    ["", "Olá!"],
    ["Agende sua avaliação, resultado 100% garantido", "Agende sua avaliação e entenda o que é possível."],
  ])("palavra solta ou parte segura não prova o risco: %s", (trecho, texto) => {
    expect(trechoContinua(trecho, texto)).toBe(false);
  });

  it.each([
    "O Botox pode durar de 3 a 6 meses.",
    "O efeito dura entre 4 e 6 meses.",
    "Costuma durar cerca de 6 meses.",
    "A duração do Botox pode variar entre 3 a 6 meses.",
    "O resultado aparece em 2 a 3 semanas.",
  ])("duração sem fonte reprova: %s", (texto) => {
    expect(afirmaCondicao(texto)).toBe(true);
  });
});
