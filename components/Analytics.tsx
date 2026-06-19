"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

// ID do Meta Pixel também é público (aparece no HTML). O default evita deploy
// sem Pixel quando a env pública não foi assada no build da Vercel.
const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "917448661312985";
// ID de medição GA4 é PÚBLICO (aparece no HTML de qualquer site). O default garante
// que o analytics carregue mesmo sem a env var na Vercel; se a env existir, ela vence.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-223KR63TS8";

function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didHandleInitialRender = useRef(false);

  // PageView a cada mudança de rota (App Router não recarrega a página)
  useEffect(() => {
    if (!pathname) return;
    const isInitialRender = !didHandleInitialRender.current;
    didHandleInitialRender.current = true;

    // O pageview inicial e disparado no script base, quando o gtag/fbq ja existe.
    if (isInitialRender) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

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
      {/* Google Analytics 4 — só carrega se houver Measurement ID */}
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', {
                page_path: window.location.pathname + window.location.search
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel — só carrega se houver Pixel ID (gancho p/ quando o Eduardo subir os ads) */}
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

// Helper p/ disparar eventos customizados do client (mapeia p/ eventos padrão do Meta)
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window === "undefined") return;

  if ((window as any).gtag && GA4_ID) {
    (window as any).gtag("event", eventName, params);
  }

  if ((window as any).fbq && META_PIXEL_ID) {
    const standardEvents: Record<string, string> = {
      sign_up: "Lead",
      initiate_checkout: "InitiateCheckout",
      purchase: "Purchase",
    };
    const metaEvent = standardEvents[eventName] || eventName;
    (window as any).fbq("track", metaEvent, params);
  }
};
