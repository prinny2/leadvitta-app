export type ComoChamar = "linda" | "amor" | "nome" | "nenhum";

export type Clinica = {
  nome_clinica: string;
  cidade: string;
  whatsapp: string;
  tom_padrao: string;
  procedimentos: string[];
  /** 0 = bem íntimo, 100 = formal. */
  formalidade: number;
  /** Como chamar a cliente. */
  como_chamar: ComoChamar;
  /** CTA padrão da clínica (texto). */
  cta_preferido: string;
  /** Chave do canal de WhatsApp (Z-API). Gravada só pelo servidor. */
  whatsapp_channel_key?: string;
  /** Já concluiu o onboarding (DNA da Clínica). */
  onboarded: boolean;
};

export const clinicaVazia: Clinica = {
  nome_clinica: "",
  cidade: "",
  whatsapp: "",
  tom_padrao: "acolhedor",
  procedimentos: [],
  formalidade: 40,
  como_chamar: "linda",
  cta_preferido: "marcar uma avaliação",
  onboarded: false,
};

/** As três variantes geradas (chaves técnicas; exibidas como Suave/Consultiva/Fechamento). */
export type RespostaTripla = {
  curta: string;
  consultiva: string;
  persuasiva: string;
};

export type Variante = "curta" | "consultiva" | "persuasiva";

export type TipoHistorico = "gerador" | "follow_up" | "reescrever";

export type HistoricoItem = {
  id: string;
  tipo: TipoHistorico;
  contexto: Record<string, unknown>;
  respostas: string[];
  created_at: string;
  favorito?: boolean;
  intent?: string;
  sentiment?: string;
  score?: number;
};

export type GerarInput = {
  modo: "gerar" | "reescrever";
  procedimento: string;
  situacao: string;
  tom: string;
  objetivo: string;
  perfilCliente?: string;
  oQueMelhorar?: string[];
  nomeCliente?: string;
  mensagemCliente: string;
  clinica?: Partial<Clinica>;
};

/** Entrada para "Melhorar essa resposta" (refina uma variante). */
export type RefineInput = {
  variante: Variante;
  respostaAtual: string;
  procedimento: string;
  situacao: string;
  tom: string;
  objetivo: string;
  perfilCliente?: string;
  nomeCliente?: string;
  mensagemCliente: string;
  clinica?: Partial<Clinica>;
};

export type FollowUpInput = {
  /** Há quanto tempo sumiu (gatilho de tempo). */
  gatilho: string;
  /** Contexto da conversa (o que aconteceu antes). */
  contexto: string;
  /** Detalhe livre opcional. */
  detalhe?: string;
  procedimento: string;
  tom: string;
  nomeCliente?: string;
  clinica?: Partial<Clinica>;
};

// ---------------- Inbox / Conversas (Fase 1) ----------------

/** Prioridade do lead (derivada do score). */
export type Prioridade = "quente" | "morno" | "frio";

/** Uma mensagem dentro de uma conversa. */
export type MensagemConversa = {
  id: string;
  /** "in" = a cliente mandou; "out" = a clínica respondeu. */
  direcao: "in" | "out";
  texto: string;
  /** ISO. */
  em: string;
};

/** Conversa = um cliente conversando com uma clínica (1 por número). */
export type Conversa = {
  id: string;
  /** uid da clínica dona (isolamento multi-clínica). */
  clinica_id: string;
  cliente_numero: string;
  cliente_nome?: string;
  ultima_mensagem: string;
  /** ISO. */
  ultima_atividade: string;
  prioridade: Prioridade;
  score?: number;
  intent?: string;
  sentiment?: string;
  /** Há mensagem da cliente que a clínica ainda não viu/respondeu. */
  nao_lida: boolean;
  arquivada?: boolean;
  /** ISO. */
  created_at: string;
};
