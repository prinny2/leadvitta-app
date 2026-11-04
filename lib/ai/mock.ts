// Respostas de exemplo (modo demonstração — quando não há provedor de IA).
// Mesmo sem IA real, seguem a fórmula e respeitam o "como chamar" do DNA.

import { procedimentoPorId } from "@/data/procedimentos";
import type {
  GerarInput,
  FollowUpInput,
  RefineInput,
  RespostaTripla,
} from "@/lib/types";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function procLabel(id: string): string {
  return procedimentoPorId(id)?.label?.toLowerCase() ?? "o procedimento";
}

/** Abertura conforme o DNA da clínica (como chamar a cliente). */
function abertura(clinica: GerarInput["clinica"], nome?: string): string {
  const n = nome?.trim();
  const c = clinica?.como_chamar;
  if (c === "amor") return n ? `Oi, ${n}, amor!` : "Oi, amor!";
  if (c === "nome") return n ? `Oi, ${n}!` : "Oi, tudo bem?";
  if (c === "nenhum") return n ? `Oi, ${n}!` : "Oi, tudo bem?";
  return n ? `Oi, ${n}!` : "Oi, linda!"; // 'linda' (padrão)
}

const SITUACOES_POS = ["pos_atendimento", "pedir_avaliacao"];
const SITUACOES_AGENDA = ["agendar", "desmarcou"];

/**
 * Texto seguro sem preço: última defesa quando a IA é reprovada duas vezes, e base
 * do demo em agenda e pós-atendimento. Só pergunta, nunca afirma fato da clínica.
 */
export function mockNeutro(
  input: Pick<GerarInput, "clinica" | "nomeCliente" | "situacao">
): RespostaTripla {
  const ola = abertura(input.clinica, input.nomeCliente);
  if (SITUACOES_POS.includes(input.situacao)) {
    return {
      curta: `${ola} Como você está se sentindo? Qualquer dúvida, pode me chamar 💛`,
      consultiva: `${ola} Quero saber como foi a sua experiência. Ficou alguma dúvida? Se algo te incomodar, me conta que eu falo com a profissional.`,
      persuasiva: `${ola} Obrigada pela confiança 💕 Me conta como você está?`,
    };
  }
  return {
    curta: `${ola} 😊 Me conta um pouquinho mais pra eu te orientar do jeito certo?`,
    consultiva: `${ola} Cada caso é único, por isso quero entender melhor o que você precisa. O que é mais importante pra você agora?`,
    persuasiva: `${ola} Quer que eu veja um horário pra você? Prefere manhã ou tarde? 💕`,
  };
}

export function mockGerador(input: GerarInput): RespostaTripla {
  if ([...SITUACOES_POS, ...SITUACOES_AGENDA].includes(input.situacao)) {
    return mockNeutro(input);
  }
  const ola = abertura(input.clinica, input.nomeCliente);
  const p = procLabel(input.procedimento);

  return {
    curta: `${ola} 😊 O valor ${p === "o procedimento" ? "do procedimento" : `de ${p}`} varia conforme o seu objetivo e a avaliação. Antes de te passar certinho, me conta: o que você gostaria de melhorar?`,
    consultiva: `${ola} Te explico sim 😊 ${capitalize(
      p
    )} não tem valor único pra todos os casos, porque depende da avaliação e do resultado que você deseja. Você busca algo mais natural ou um resultado mais marcante?`,
    persuasiva: `${ola} Pra te orientar com segurança, o ideal é uma avaliação rápida — assim indicamos o melhor caminho pra você e explicamos tudo, inclusive o valor. Quer que eu veja os horários dessa semana? 💕`,
  };
}

export function mockRefine(input: RefineInput): string {
  const ola = abertura(input.clinica, input.nomeCliente);
  const p = procLabel(input.procedimento);
  switch (input.variante) {
    case "curta":
      return `${ola} 😊 Posso te explicar certinho sobre ${p}! Pra eu te orientar do jeito certo, me conta rapidinho: qual é o seu maior objetivo com esse procedimento?`;
    case "consultiva":
      return `${ola} Adorei seu interesse 💕 ${capitalize(
        p
      )} é bem individual: o melhor caminho depende da sua avaliação e do que você deseja alcançar. Posso te explicar as opções e como funciona a avaliação?`;
    case "persuasiva":
    default:
      return `${ola} Quer que eu veja um horário de avaliação pra você? Assim eu te oriento com segurança e vejo o melhor pra você. Prefere manhã ou tarde? ✨`;
  }
}

export function mockFollowup(input: FollowUpInput): string[] {
  const ola = abertura(input.clinica, input.nomeCliente);
  const p = procLabel(input.procedimento);
  // Retorno pós-procedimento: é acompanhamento, não retomada de venda.
  if (input.gatilho === "retorno_procedimento") {
    const pedeFoto = /foto/i.test(input.contexto);
    return [
      `${ola} Passando pra saber como você está depois do ${p} 💛 Ficou alguma dúvida ou alguma coisa te incomodando? Pode me falar.`,
      pedeFoto
        ? `${ola} Já faz um tempinho do seu ${p} e eu queria acompanhar sua evolução. Se puder, me manda uma foto de frente com luz natural? É só para o seu acompanhamento aqui na clínica, não usamos em divulgação sem a sua autorização por escrito.`
        : `${ola} Como você está se sentindo depois do ${p}? Quero saber como foi a sua experiência e se surgiu alguma dúvida nesses dias. Qualquer coisa, fala comigo por aqui.`,
      `${ola} Tô por aqui pra acompanhar você 😊 Se algo te deixar em dúvida, me chama que eu converso com a profissional e te respondo. Como você está?`,
    ];
  }
  return [
    `${ola} Passando pra saber se ficou alguma dúvida sobre ${p} 😊 É super normal querer entender melhor antes de decidir. Posso te ajudar com alguma informação?`,
    `${ola} Vi que você teve interesse em ${p} e queria saber se ainda faz sentido pra você. Quer que eu veja um horário de avaliação pra você?`,
    `${ola} Tô por aqui se quiser retomar quando for melhor pra você 💕 Se preferir, me diz o melhor dia e eu vejo um horário pra avaliarmos com calma. O que acha?`,
  ];
}

/**
 * Reescrita segura determinística: troca os termos proibidos por equivalentes
 * compliant. Base do Auditor de Compliance no modo demo (sem IA) e última linha
 * de defesa quando a reescrita da IA ainda vier com algum termo proibido.
 */
const SOFTEN_RULES: { re: RegExp; repl: string }[] = [
  { re: /resultados?\s+(?:\S+\s+)?garantid\w*/gi, repl: "resultado que varia de pessoa para pessoa" },
  { re: /100\s*%\s*seguro/gi, repl: "feito com segurança" },
  { re: /sem\s+(nenhum\s+)?risco(\s+nenhum)?/gi, repl: "com os devidos cuidados" },
  { re: /vai\s+ficar\s+perfeit\w*/gi, repl: "pode melhorar bastante" },
  { re: /elimina\w*\s+(a\s+)?gordura\s+definitiv\w*/gi, repl: "ajuda a reduzir a gordura localizada" },
  { re: /emagrec\w*\s+\d+\s*(quilos|kg)/gi, repl: "auxilia no emagrecimento" },
  { re: /cura\w*\s+(o\s+|do\s+)?melasma/gi, repl: "ajuda a controlar o melasma" },
  { re: /rejuvenesc\w*\s+\d+\s*anos/gi, repl: "deixa o aspecto mais jovem e descansado" },
  { re: /\bgaranto\b/gi, repl: "busco" },
  { re: /\bcusta\s+R\$\s*[\d.,]+/gi, repl: "tem o valor definido na avaliação" },
  { re: /\b(fica|sai)\s+(por\s+|em\s+)?R\$\s*[\d.,]+/gi, repl: "tem o valor definido na avaliação" },
];

export function softenText(texto: string): string {
  let out = texto;
  for (const { re, repl } of SOFTEN_RULES) {
    out = out.replace(re, repl);
  }
  return out;
}
