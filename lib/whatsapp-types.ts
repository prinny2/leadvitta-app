// Contrato comum dos provedores de WhatsApp (Twilio hoje, 360dialog amanhã).
// A lógica de negócio (receber → pontuar → guardar → responder) não conhece o
// provedor — fala só com esta interface. Trocar de provedor = trocar a impl.

export type WhatsAppResult = { ok: boolean; status: number; data: unknown };

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
  readonly name: "twilio" | "dialog360" | "zapi";

  /** True quando há credenciais suficientes para operar. */
  isConfigured(): boolean;

  /** Valida a autenticidade do webhook (assinatura/token). */
  validateWebhook(req: Request, rawBody: string): Promise<boolean>;

  /** Converte o payload bruto do webhook do provedor numa InboundMessage. */
  parseInbound(rawBody: string, req: Request): InboundMessage | null;

  /**
   * Envia uma mensagem de texto.
   * @param to   número da cliente (E.164, com ou sem prefixo "whatsapp:")
   * @param body texto
   * @param opts roteamento por clínica (ex.: chave/canal do 360dialog)
   */
  sendText(
    to: string,
    body: string,
    opts?: { from?: string; channelApiKey?: string }
  ): Promise<WhatsAppResult>;

  sendImage(
    to: string,
    imageUrl: string,
    caption?: string,
    opts?: { from?: string; channelApiKey?: string }
  ): Promise<WhatsAppResult>;

  sendButtons(
    to: string,
    body: string,
    buttons: Array<{ id: string; label: string }>,
    opts?: { from?: string; channelApiKey?: string }
  ): Promise<WhatsAppResult>;
}
