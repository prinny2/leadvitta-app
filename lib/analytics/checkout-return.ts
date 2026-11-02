// Purchase do Meta Pixel na volta do Stripe Checkout.
//
// O purchase do GA4 sai do webhook (Measurement Protocol). O Pixel não tem
// esse caminho: a compra é registrada no browser, com o valor cobrado de fato
// (já com cupom), consultado em /api/stripe/session.

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

// Eventos do Meta disparados antes do script do Pixel (afterInteractive) rodar
// ficam aqui; o bootstrap do Pixel esvazia a fila logo depois do init.
export const META_PENDING_KEY = "__lbMetaPending";

type TrackFn = (eventName: string, params?: Record<string, any>) => void;

// Entrega um evento ao Pixel; se o script ainda não inicializou, enfileira para
// o bootstrap enviar. Sem Pixel configurado, não faz nada.
function trackMeta(
  event: string,
  params: Record<string, any>,
  options?: Record<string, any>
) {
  if (!META_PIXEL_ID) return;
  const w = window as any;
  if (w.fbq) {
    w.fbq("track", event, params, options);
    return;
  }
  (w[META_PENDING_KEY] ||= []).push([event, params, options]);
}

const checkoutReturnsInFlight = new Set<string>();

// Volta do Stripe Checkout com sucesso. Registra `checkout_returned` via
// `track` (o purchase do GA4 vem do webhook) e, se a sessão foi paga, o
// Purchase do Meta com o valor cobrado (já com cupom). Só marca a sessão como registrada depois que o
// evento foi entregue ao Pixel ou à fila; se a consulta falhar, a próxima
// visita tenta de novo.
export async function recordCheckoutReturn(
  sessionId: string | null,
  track: TrackFn
) {
  if (typeof window === "undefined") return;
  const key = `lb_checkout_returned_${sessionId ?? "sem_sessao"}`;
  if (checkoutReturnsInFlight.has(key)) return;
  try {
    if (window.localStorage.getItem(key)) return;
  } catch {
    // localStorage indisponível: segue sem deduplicação entre visitas.
  }
  checkoutReturnsInFlight.add(key);

  try {
    if (sessionId && META_PIXEL_ID) {
      const res = await fetch("/api/stripe/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        paid?: boolean;
        value?: number;
        currency?: string;
        plan?: string;
      };
      if (data.paid && typeof data.value === "number") {
        trackMeta(
          "Purchase",
          { value: data.value, currency: data.currency || "BRL", content_name: data.plan },
          { eventID: `purchase_${sessionId}` }
        );
      }
    }

    track("checkout_returned", { stripe_session_id: sessionId });
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // Sem localStorage não há como lembrar entre visitas.
    }
  } catch {
    // Falha de rede: não marca, para tentar de novo na próxima visita.
  } finally {
    checkoutReturnsInFlight.delete(key);
  }
}
