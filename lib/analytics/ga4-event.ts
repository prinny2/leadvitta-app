import { publicGa4MeasurementId } from "@/lib/config";

type Gtag = (...args: unknown[]) => void;

/**
 * Evento só para o GA4 — nunca para o Meta Pixel (o `trackEvent` de
 * components/Analytics manda para os dois). Para eventos de medição interna,
 * como as seções da LP, que poluiriam a otimização dos anúncios e a cota de
 * eventos personalizados do Pixel.
 *
 * Sem NEXT_PUBLIC_GA4_ID ou sem `window.gtag` (modo demo, bloqueador) não faz
 * nada; e, como o resto do analytics, nunca quebra a página.
 */
export function trackGa4Event(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !publicGa4MeasurementId) return;
  try {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag !== "function") return;
    // send_to garante o destino mesmo se outra tag (ex.: Google Ads) entrar
    // no gtag depois; não vira parâmetro do evento.
    gtag("event", eventName, { ...params, send_to: publicGa4MeasurementId });
  } catch {
    // Falha de analytics é silenciosa por design.
  }
}
