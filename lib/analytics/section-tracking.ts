/**
 * Alcance e tempo por seção (LP e onboarding) — lógica pura, sem DOM.
 *
 * O componente components/section-tracker.tsx traduz o IntersectionObserver em
 * chamadas a `setQualifies` / `setPageVisible` / `flush`; aqui ficam as regras,
 * testáveis com timers falsos (tests/lib/section-tracking.test.ts).
 *
 * Eventos (só GA4, nunca Meta Pixel — ver docs/analytics/secoes.md):
 * - `section_view` { content_type, content_id }: no máximo 1 por seção por
 *   montagem, depois de 1 s seguido de visibilidade "de verdade".
 * - `section_time` { content_type, content_id, value, transport_type }: segundos
 *   acumulados de visibilidade, enviados quando a página some ou desmonta.
 */

/** Atributo que marca uma seção medida: `data-track-section="<id>"`. */
export const SECTION_ATTR = "data-track-section";

/** Tempo contínuo de visibilidade até contar como "viu a seção". */
export const SECTION_VIEW_DELAY_MS = 1000;

/** Teto de segundos por envio (aba esquecida aberta não distorce a média). */
export const SECTION_TIME_CAP_S = 600;

export type SectionEventName = "section_view" | "section_time";

export type SectionEventParams = {
  content_type: string;
  content_id: string;
  value?: number;
  transport_type?: "beacon";
};

export type SendSectionEvent = (
  eventName: SectionEventName,
  params: SectionEventParams
) => void;

/**
 * A seção conta como vista quando a parte visível cobre pelo menos
 * min(50% da altura da seção, 40% da altura da tela). O mínimo cobre os dois
 * casos: seção curta precisa aparecer pela metade; seção mais alta que a tela
 * só precisa ocupar boa parte dela.
 */
export function isMeaningfullyVisible(
  visibleHeight: number,
  sectionHeight: number,
  viewportHeight: number
): boolean {
  if (!(visibleHeight > 0) || !(sectionHeight > 0) || !(viewportHeight > 0)) {
    return false;
  }
  return visibleHeight >= Math.min(sectionHeight * 0.5, viewportHeight * 0.4);
}

/** Milissegundos → segundos inteiros do evento, com o teto aplicado. */
export function sectionTimeSeconds(ms: number): number {
  if (!(ms > 0)) return 0;
  return Math.min(Math.round(ms / 1000), SECTION_TIME_CAP_S);
}

type SectionState = {
  qualifies: boolean;
  /** Início do trecho atual contando tempo (seção visível + aba visível). */
  since: number | null;
  /** Tempo acumulado ainda não enviado. */
  pendingMs: number;
  viewed: boolean;
  viewTimer: ReturnType<typeof setTimeout> | null;
};

export type SectionTracker = {
  /** A seção passou a cumprir (ou deixou de cumprir) a regra de visibilidade. */
  setQualifies: (contentId: string, qualifies: boolean) => void;
  /** `document.visibilityState === "visible"`. Aba escondida não conta tempo. */
  setPageVisible: (visible: boolean) => void;
  /** Envia 1 `section_time` por seção com valor ≥ 1 e zera o acumulado. */
  flush: () => void;
  /** Envia o que falta e desliga (desmontagem / troca de rota). */
  dispose: () => void;
};

export function createSectionTracker(options: {
  contentType: string;
  send: SendSectionEvent;
  /** Relógio em ms; padrão performance.now() (monotônico). */
  now?: () => number;
  pageVisible?: boolean;
}): SectionTracker {
  const { contentType, send } = options;
  const now = options.now ?? (() => performance.now());
  const sections = new Map<string, SectionState>();
  let pageVisible = options.pageVisible ?? true;
  let disposed = false;

  function stateOf(id: string): SectionState {
    let state = sections.get(id);
    if (!state) {
      state = { qualifies: false, since: null, pendingMs: 0, viewed: false, viewTimer: null };
      sections.set(id, state);
    }
    return state;
  }

  function startCounting(id: string, state: SectionState) {
    if (state.since !== null) return;
    state.since = now();
    if (state.viewed || state.viewTimer) return;
    state.viewTimer = setTimeout(() => {
      state.viewTimer = null;
      if (disposed || state.viewed || state.since === null) return;
      state.viewed = true;
      send("section_view", { content_type: contentType, content_id: id });
    }, SECTION_VIEW_DELAY_MS);
  }

  function stopCounting(state: SectionState) {
    if (state.viewTimer) {
      clearTimeout(state.viewTimer);
      state.viewTimer = null;
    }
    if (state.since === null) return;
    state.pendingMs += Math.max(0, now() - state.since);
    state.since = null;
  }

  function flush() {
    if (disposed) return;
    const at = now();
    sections.forEach((state, id) => {
      if (state.since !== null) {
        state.pendingMs += Math.max(0, at - state.since);
        state.since = at;
      }
      const value = sectionTimeSeconds(state.pendingMs);
      // Menos de meio segundo fica guardado para o próximo envio.
      if (value < 1) return;
      state.pendingMs = 0;
      send("section_time", {
        content_type: contentType,
        content_id: id,
        value,
        transport_type: "beacon",
      });
    });
  }

  return {
    setQualifies(id, qualifies) {
      if (disposed) return;
      const state = stateOf(id);
      if (state.qualifies === qualifies) return;
      state.qualifies = qualifies;
      if (!pageVisible) return;
      if (qualifies) startCounting(id, state);
      else stopCounting(state);
    },
    setPageVisible(visible) {
      if (disposed || pageVisible === visible) return;
      pageVisible = visible;
      sections.forEach((state, id) => {
        if (!state.qualifies) return;
        if (visible) startCounting(id, state);
        else stopCounting(state);
      });
    },
    flush,
    dispose() {
      if (disposed) return;
      sections.forEach(stopCounting);
      flush();
      disposed = true;
    },
  };
}
