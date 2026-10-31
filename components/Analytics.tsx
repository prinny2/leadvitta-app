"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { publicGa4MeasurementId } from "@/lib/config";

// Meta Pixel: só carrega quando há um ID REAL configurado via env
// (NEXT_PUBLIC_META_PIXEL_ID). Sem fallback fixo.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

// GA4 agora vem do config (sem fallback mágico).
// Defina NEXT_PUBLIC_GA4_ID no Vercel para ativar analytics.
// Precisa ser o ID *público*: GA4_MEASUREMENT_ID é server-only, então existe no
// SSR mas some no bundle do browser. Usar aquele aqui fazia a tag renderizar com
// um ID e hidratar com outro — dois gtag.js e page_view duplicado.
const GA4_ID = publicGa4MeasurementId;

// Google Ads: as conversões agora entram pelo vínculo GA4/Google Ads.

function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  // PageView a cada mudança de rota (App Router não recarrega a página).
  useEffect(() => {
    if (!pathname) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // O pageview inicial é disparado no script base, quando o gtag/fbq já existe.
    // Guardamos a URL em vez de um booleano porque o Strict Mode reexecuta este
    // efeito no mesmo mount — com booleano a segunda execução disparava um
    // page_view extra na carga inicial.
    if (lastTrackedUrl.current === null) {
      lastTrackedUrl.current = url;
      return;
    }
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;

    if (typeof window !== "undefined" && (window as any).gtag && GA4_ID) {
      (window as any).gtag("config", GA4_ID, { page_path: url });
    }
    if (typeof window !== "undefined" && (window as any).fbq && META_PIXEL_ID) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  return (
    <>
      {/* A tag base do GA4 fica no <head> (Ga4HeadTag em app/layout.tsx);
          aqui só os page_views das navegações seguintes. */}
      {/* Meta Pixel — só carrega se houver Pixel ID */}
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Suspense é obrigatório p/ usar useSearchParams (Next 15) */}
      <Suspense fallback={null}>
        <AnalyticsContent />
      </Suspense>
    </>
  );
}

export function getGaClientId() {
  if (typeof document === "undefined") return undefined;
  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith("_ga="));
  const value = cookie?.split("=")[1];
  const parts = value?.split(".");
  if (!parts || parts.length < 4) return undefined;
  return `${parts[2]}.${parts[3]}`;
}

// Helper p/ disparar eventos customizados do client (mapeia p/ eventos padrão do Meta).
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window === "undefined") return;

  // Analytics nunca pode quebrar o clique: se gtag/fbq lançarem (bloqueador de
  // anúncios, script adulterado), o CTA segue navegando normalmente.
  try {
    if ((window as any).gtag && GA4_ID) {
      (window as any).gtag("event", eventName, params);
    }

    if ((window as any).fbq && META_PIXEL_ID) {
      const standardEvents: Record<string, string> = {
        sign_up: "Lead",
        checkout_click: "InitiateCheckout",
        purchase: "Purchase",
        contact_whatsapp: "Contact",
      };
      const metaEvent = standardEvents[eventName] || eventName;
      (window as any).fbq("track", metaEvent, params);
    }
  } catch {
    // Falha de analytics é silenciosa por design.
  }
};

/**
 * Snippet oficial do Google (gtag.js) renderizado no servidor dentro do
 * <head>, como o GA4 pede na instalação — assim a tag aparece no HTML e o
 * "testar instalação" do Google a encontra. Só existe com NEXT_PUBLIC_GA4_ID.
 */
export function Ga4HeadTag() {
  if (!GA4_ID) return null;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`,
        }}
      />
    </>
  );
}
