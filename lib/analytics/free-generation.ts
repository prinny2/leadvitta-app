export type FreeGenerationSource =
  | "gerador"
  | "conversa"
  | "onboarding"
  | "landing_demo";

export type GenerationResponse = {
  ok: boolean;
  mock?: boolean;
  respostas?: Record<string, unknown> | null;
};

export function trackFreeGeneration(
  source: FreeGenerationSource,
  response: GenerationResponse,
  track: (eventName: string, params: Record<string, unknown>) => void
) {
  const hasReplies = Object.values(response.respostas ?? {}).some(
    (reply) => typeof reply === "string" && reply.trim().length > 0
  );
  if (!response.ok || !hasReplies) return;

  track("free_generation", { source, mock: response.mock === true });
}
