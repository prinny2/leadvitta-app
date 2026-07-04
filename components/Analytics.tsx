"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { ga4MeasurementId } from "@/lib/config";

// Meta Pixel: só carrega quando há um ID REAL configurado via env
// (NEXT_PUBLIC_META_PIXEL_ID). Sem fallback fixo.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

// GA4 agora vem do config (sem fallback mágico).
// Defina NEXT_PUBLIC_GA4_ID no Vercel para ativar analytics.
const GA4_ID = ga4MeasurementId;

// Google Ads: as conversões agora entram pelo vínculo GA4/Google Ads.

function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didHandleInitialRender = useRef(false);

  // PageView a cada mudança de rota (App Router não recarrega a página).
  useEffect(() => {
    if (!pathname) return;
    const isInitialRender = !didHandleInitialRender.current;
    didHandleInitialRender.current = true;

    // O pageview inicial é disparado no script base, quando o gtag/fbq já existe.
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
      {/* Google Analytics 4 — só carrega se GA4 estiver configurado via env */}
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
