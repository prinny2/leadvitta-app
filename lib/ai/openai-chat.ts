// Parâmetros de chat.completions que cada modelo da OpenAI aceita.
// gpt-4o-mini aceita temperature e max_completion_tokens.
// gpt-6-luna rejeita max_tokens e qualquer temperature diferente do padrão.

export function openaiChatParams(model: string, maxTokens: number): {
  model: string;
  max_completion_tokens: number;
  temperature?: number;
} {
  const params: {
    model: string;
    max_completion_tokens: number;
    temperature?: number;
  } = {
    model,
    max_completion_tokens: maxTokens,
  };
  if (!model.startsWith("gpt-6")) {
    params.temperature = 0.7;
  }
  return params;
}
