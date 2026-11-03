// Sugestões editáveis de acompanhamento, não são orientação clínica.
export type EtapaProtocoloRetorno = { dia: number; objetivo: string };

export const protocolosRetorno: Record<string, EtapaProtocoloRetorno[]> = {
  botox: [{ dia: 14, objetivo: "Perguntar como ficou e se ficou alguma dúvida" }],
  preenchimento_labial: [
    { dia: 7, objetivo: "Perguntar como está se sentindo e se surgiu alguma dúvida" },
    { dia: 21, objetivo: "Perguntar como está se sentindo e se surgiu alguma dúvida" },
  ],
  preenchimento_facial: [
    { dia: 7, objetivo: "Perguntar como está se sentindo e se surgiu alguma dúvida" },
    { dia: 21, objetivo: "Perguntar como está se sentindo e se surgiu alguma dúvida" },
  ],
  harmonizacao_facial: [{ dia: 30, objetivo: "Perguntar como está e pedir foto de evolução para acompanhamento (com autorização)" }],
  bioestimulador: [{ dia: 45, objetivo: "Perguntar como está se sentindo e se surgiu alguma dúvida" }],
  skinbooster: [{ dia: 30, objetivo: "Perguntar como está se sentindo e se surgiu alguma dúvida" }],
};

export const objetivosRetorno = (procedimento: string, dias: number[]) =>
  dias.map((dia) => protocolosRetorno[procedimento]?.find((etapa) => etapa.dia === dia)?.objetivo ?? "Perguntar como está se sentindo e se surgiu alguma dúvida");
