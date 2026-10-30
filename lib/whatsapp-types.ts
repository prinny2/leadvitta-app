// Contrato compartilhado pelos provedores WhatsApp.
// A lógica de negócio (receber → guardar → responder manualmente) não conhece
// o provedor — fala só com esta interface.

export type WhatsAppResult = { ok: boolean; status: number; data: unknown };

export type WhatsAppSendOptions = {
  from?: string;
  channelApiKey?: string;
  instanceId?: string;
  token?: string;
  clientToken?: string;
};

/** Mensagem recebida, já normalizada (independe do formato do provedor). */
export type InboundMessage = {
  /** Número de quem enviou (a cliente). Sem prefixo, ex.: "5591985156690". */
  from: string;
  /** Número que recebeu (a clínica). Sem prefixo, ex.: "14155238886". */
  to: string;
  /** Texto da mensagem. */
  text: string;
  /** Id da mensagem no provedor (para deduplicar/rastrear). */
  providerMessageId?: string;
  /** Nome de exibição do contato, quando o provedor envia. */
  contactName?: string;
};

export interface WhatsAppProvider {
  readonly name: "zapi" | "meta-cloud";

  /** True quando há credenciais suficientes para operar. */
  isConfigured(): boolean;

  /** Valida a autenticidade do webhook (assinatura/token). */
  validateWebhook(req: Request, rawBody: string): Promise<boolean>;

  /** Retorna o desafio assinado pelo provedor durante o handshake GET, se houver. */
  webhookChallenge?(req: Request): string | null;

  /** Converte o payload bruto do webhook do provedor numa ou mais mensagens. */
  parseInbound(rawBody: string, req: Request): InboundMessage | InboundMessage[] | null;

  /**
   * Envia uma mensagem de texto.
   * @param to   número da cliente (E.164, com ou sem prefixo "whatsapp:")
   * @param body texto
   * @param opts reservado (compatibilidade)
   */
  sendText(
    to: string,
    body: string,
    opts?: WhatsAppSendOptions
  ): Promise<WhatsAppResult>;

  sendImage(
    to: string,
    imageUrl: string,
    caption?: string,
    opts?: WhatsAppSendOptions
  ): Promise<WhatsAppResult>;

  sendButtons(
    to: string,
    body: string,
    buttons: Array<{ id: string; label: string }>,
    opts?: WhatsAppSendOptions
  ): Promise<WhatsAppResult>;
}
