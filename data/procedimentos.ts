// Os procedimentos com a "inteligência" de cada um (Módulo 4).
// Esses dados são injetados no prompt para deixar as respostas específicas.

export type Procedimento = {
  id: string;
  label: string;
  duvidas: string[];
  objecoes: string[];
  medos: string[];
  beneficios: string[];
  cuidados: string[];
  conducao: string;
};

export const procedimentos: Procedimento[] = [
  {
    id: "botox",
    label: "Botox (toxina botulínica)",
    duvidas: ["Quanto tempo dura", "Quantos pontos preciso", "Fica natural?"],
    objecoes: ["Acho caro", "Tenho medo de ficar com cara congelada"],
    medos: [
      "Ficar artificial",
      "Dor da aplicação",
      "Não poder fazer expressão",
    ],
    beneficios: [
      "Suaviza linhas de expressão",
      "Previne marcas mais profundas",
      "Resultado natural quando bem indicado",
    ],
    cuidados: [
      "Evitar deitar logo após",
      "Não massagear a região",
      "Avaliação prévia",
    ],
    conducao:
      "A quantidade de pontos depende da avaliação da musculatura e do objetivo (suavizar testa, pés de galinha ou prevenir). Conduzir para avaliação.",
  },
  {
    id: "preenchimento_labial",
    label: "Preenchimento labial",
    duvidas: ["Fica natural?", "Quanto dura", "Incha muito?"],
    objecoes: ["Medo de ficar exagerado", "Acho caro"],
    medos: ["Ficar artificial / 'boca de pato'", "Dor", "Assimetria"],
    beneficios: [
      "Mais volume, contorno ou hidratação conforme o objetivo",
      "Resultado natural quando respeitada a anatomia",
    ],
    cuidados: [
      "Edema nos primeiros dias é comum",
      "Evitar calor intenso",
      "Seguir orientações pós",
    ],
    conducao:
      "Não tem valor único: depende da anatomia, da quantidade de produto e do objetivo (volume x contorno x hidratação). Perguntar o objetivo e levar à avaliação.",
  },
  {
    id: "preenchimento_facial",
    label: "Preenchimento facial",
    duvidas: ["Para que serve", "Onde pode aplicar", "Dura quanto"],
    objecoes: ["Tenho receio de mudar muito o rosto", "Valor"],
    medos: ["Exagero", "Ficar com aspecto 'inchado'"],
    beneficios: ["Repõe volume", "Suaviza sulcos", "Harmoniza contornos"],
    cuidados: ["Avaliação das áreas", "Edema inicial", "Acompanhamento"],
    conducao:
      "As áreas e a quantidade dependem da avaliação do rosto como um todo. Conduzir para avaliação para um plano individual.",
  },
  {
    id: "harmonizacao_facial",
    label: "Harmonização facial",
    duvidas: ["O que inclui", "Quantas sessões", "Fica natural?"],
    objecoes: ["Medo de ficar com 'cara de harmonização'", "Investimento"],
    medos: ["Perder a naturalidade", "Resultado exagerado"],
    beneficios: ["Equilíbrio e proporção do rosto", "Plano personalizado"],
    cuidados: ["Planejamento por avaliação", "Resultados graduais"],
    conducao:
      "Harmonização é um conjunto de procedimentos definidos por avaliação — não um pacote único. Conduzir para avaliação para montar o plano.",
  },
  {
    id: "limpeza_de_pele",
    label: "Limpeza de pele",
    duvidas: ["Dói?", "De quanto em quanto tempo", "Fica vermelha?"],
    objecoes: ["Acho que faço em casa", "Preço"],
    medos: ["Dor da extração", "Vermelhidão depois"],
    beneficios: [
      "Pele mais limpa e renovada",
      "Ajuda no controle de cravos/oleosidade",
    ],
    cuidados: ["Usar protetor solar", "Evitar sol intenso depois"],
    conducao:
      "Frequência ideal depende do tipo de pele. Conduzir para avaliação para indicar o protocolo certo.",
  },
  {
    id: "depilacao_laser",
    label: "Depilação a laser",
    duvidas: ["Quantas sessões", "Dói?", "Serve para minha pele/pelo?"],
    objecoes: ["Acho caro", "Será que funciona em mim?"],
    medos: ["Dor", "Queimadura", "Não funcionar"],
    beneficios: ["Redução progressiva dos pelos", "Praticidade a longo prazo"],
    cuidados: ["Evitar sol antes/depois", "Não depilar com cera entre sessões"],
    conducao:
      "Número de sessões varia conforme pele, pelo e região. Conduzir para avaliação para estimar o protocolo.",
  },
  {
    id: "peeling",
    label: "Peeling",
    duvidas: ["Descasca muito?", "Quantas sessões", "Posso trabalhar depois?"],
    objecoes: ["Medo de descamar na frente dos outros", "Valor"],
    medos: ["Descamação visível", "Vermelhidão", "Manchar"],
    beneficios: ["Renovação da pele", "Ajuda em textura, manchas e viço"],
    cuidados: ["Protetor solar rigoroso", "Evitar sol", "Seguir o pós"],
    conducao:
      "Tipo e intensidade dependem do objetivo e do tipo de pele. Conduzir para avaliação.",
  },
  {
    id: "bioestimulador",
    label: "Bioestimulador de colágeno",
    duvidas: ["Como age", "Quando vejo resultado", "Quantas sessões"],
    objecoes: ["Demora para aparecer", "Investimento"],
    medos: ["Não ver resultado", "Nódulos"],
    beneficios: [
      "Estimula colágeno gradualmente",
      "Melhora firmeza e qualidade da pele",
    ],
    cuidados: ["Massagem conforme orientação", "Resultados progressivos"],
    conducao:
      "O resultado é gradual e o número de sessões depende da avaliação. Conduzir para avaliação para alinhar expectativa.",
  },
  {
    id: "microagulhamento",
    label: "Microagulhamento",
    duvidas: ["Dói?", "Quantas sessões", "Para que serve"],
    objecoes: ["Medo de agulha", "Preço"],
    medos: ["Dor", "Vermelhidão", "Marcas"],
    beneficios: [
      "Estimula renovação da pele",
      "Ajuda em textura, poros e cicatrizes",
    ],
    cuidados: ["Protetor solar", "Evitar sol", "Pele pode ficar sensível"],
    conducao:
      "Indicação e número de sessões dependem do objetivo e da pele. Conduzir para avaliação.",
  },
  {
    id: "enzimas",
    label: "Enzimas (intradermoterapia)",
    duvidas: ["Para gordura localizada?", "Quantas sessões", "Dói?"],
    objecoes: ["Será que funciona?", "Valor"],
    medos: ["Dor", "Hematomas", "Não funcionar"],
    beneficios: [
      "Auxilia no contorno corporal",
      "Complementa hábitos saudáveis",
    ],
    cuidados: ["Hematomas podem ocorrer", "Seguir orientações"],
    conducao:
      "É um auxílio que depende de avaliação e de hábitos; não é solução milagrosa. Conduzir para avaliação para indicar com segurança.",
  },
  {
    id: "drenagem",
    label: "Drenagem linfática",
    duvidas: ["Para que serve", "Quantas sessões", "Emagrece?"],
    objecoes: ["Acho que não preciso", "Preço"],
    medos: ["Não sentir diferença"],
    beneficios: ["Reduz retenção e inchaço", "Sensação de leveza e bem-estar"],
    cuidados: ["Hidratação", "Indicada conforme o caso"],
    conducao:
      "Ajuda no inchaço/retenção e é ótima no pós-operatório, mas não substitui emagrecimento. Conduzir para avaliação.",
  },
  {
    id: "pos_operatorio",
    label: "Pós-operatório",
    duvidas: ["Quando começar", "Quantas sessões", "Quais cuidados"],
    objecoes: ["Meu cirurgião não falou nada", "Valor"],
    medos: ["Atrapalhar a cirurgia", "Fibrose"],
    beneficios: ["Acelera recuperação", "Ajuda a reduzir inchaço e fibrose"],
    cuidados: ["Liberação do cirurgião", "Protocolo individual"],
    conducao:
      "Cada pós é único e depende da cirurgia e da liberação médica. Conduzir para avaliação para montar o protocolo.",
  },
  {
    id: "emagrecimento",
    label: "Emagrecimento estético",
    duvidas: ["Quanto perco?", "Quantas sessões", "Funciona sem dieta?"],
    objecoes: ["Já tentei de tudo", "Valor"],
    medos: ["Não funcionar", "Efeito sanfona"],
    beneficios: [
      "Auxilia no contorno e na medida",
      "Complementa hábitos saudáveis",
    ],
    cuidados: ["Não promete números", "Depende de hábitos e avaliação"],
    conducao:
      "Procedimentos estéticos são auxílio e dependem de hábitos; nunca prometa quilos. Conduzir para avaliação para um plano realista.",
  },
  {
    id: "melasma",
    label: "Tratamento para melasma",
    duvidas: ["Some de vez?", "Quantas sessões", "Pode voltar?"],
    objecoes: ["Já tentei e voltou", "Investimento"],
    medos: ["Não melhorar", "Piorar a mancha"],
    beneficios: ["Ajuda a clarear e controlar", "Protocolo contínuo de manejo"],
    cuidados: ["Protetor solar é essencial", "Controle, não 'cura'"],
    conducao:
      "Melasma se controla, não se 'cura' — exige manejo contínuo e fotoproteção. Nunca prometa cura. Conduzir para avaliação.",
  },
  {
    id: "acne",
    label: "Tratamento para acne",
    duvidas: ["Em quanto tempo melhora", "Quantas sessões", "Deixa marca?"],
    objecoes: ["Já usei de tudo", "Valor"],
    medos: ["Não melhorar", "Marcas/cicatrizes"],
    beneficios: ["Ajuda no controle da acne", "Melhora aspecto e textura"],
    cuidados: ["Protocolo individual", "Constância", "Fotoproteção"],
    conducao:
      "Resultado depende do grau e da constância; casos clínicos podem precisar de dermatologista. Conduzir para avaliação.",
  },
  {
    id: "skinbooster",
    label: "Skinbooster",
    duvidas: ["Para que serve", "Quantas sessões", "É preenchimento?"],
    objecoes: ["Confundo com preenchimento", "Preço"],
    medos: ["Não ver diferença", "Pápulas"],
    beneficios: [
      "Hidratação profunda da pele",
      "Mais viço e qualidade da pele",
    ],
    cuidados: ["Pequenas pápulas iniciais", "Resultados progressivos"],
    conducao:
      "Hidrata e melhora a qualidade da pele (não dá volume como o preenchimento). Conduzir para avaliação.",
  },
  {
    id: "criolipolise",
    label: "Criolipólise",
    duvidas: ["Quantas sessões", "Dói?", "Some a barriga?"],
    objecoes: ["Será que funciona?", "Acho caro"],
    medos: ["Não ver resultado", "Sentir muito frio/dor", "Flacidez depois"],
    beneficios: [
      "Auxilia na redução de gordura localizada",
      "Sem cortes e sem afastamento",
      "Complementa hábitos saudáveis",
    ],
    cuidados: [
      "Indicada conforme avaliação da área",
      "Resultados graduais",
      "Não substitui emagrecimento",
    ],
    conducao:
      "É um auxílio para gordura localizada que depende de avaliação da área e de hábitos; não é emagrecimento nem solução milagrosa. Nunca prometa medidas. Conduzir para avaliação.",
  },
  {
    id: "radiofrequencia",
    label: "Radiofrequência",
    duvidas: ["Para que serve", "Quantas sessões", "Dói?"],
    objecoes: ["Será que firma mesmo?", "Preço"],
    medos: ["Não ver diferença", "Calor / queimadura"],
    beneficios: [
      "Estimula colágeno e ajuda na firmeza da pele",
      "Sensação de pele mais tonificada",
      "Resultados graduais",
    ],
    cuidados: ["Hidratação", "Protetor solar", "Protocolo conforme avaliação"],
    conducao:
      "Atua na flacidez e na firmeza de forma gradual; o número de sessões depende da avaliação da pele. Conduzir para avaliação para alinhar expectativa.",
  },
  {
    id: "micropigmentacao_sobrancelhas",
    label: "Micropigmentação de sobrancelhas",
    duvidas: ["Fica natural?", "Quanto tempo dura", "Dói?"],
    objecoes: ["Medo de ficar artificial", "E se eu não gostar do formato?"],
    medos: ["Ficar marcada / artificial", "Cor errada", "Assimetria"],
    beneficios: [
      "Sobrancelhas mais definidas e simétricas",
      "Praticidade no dia a dia",
      "Formato desenhado conforme o rosto",
    ],
    cuidados: [
      "Evitar sol e piscina na cicatrização",
      "Seguir o pós",
      "Retoque conforme orientação",
    ],
    conducao:
      "O formato e a cor são definidos por avaliação do rosto e do tom de pele, e a duração varia por pessoa. Conduzir para avaliação para desenhar o melhor formato.",
  },
];

export const procedimentoPorId = (id: string) =>
  procedimentos.find((p) => p.id === id);

/** Lista de rótulos para selects simples. */
export const procedimentosLabels = procedimentos.map((p) => p.label);
