"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent } from "@/components/Analytics";

type TrackLinkProps = ComponentProps<typeof Link> & {
  /** Nome do evento (GA4 + Meta Pixel via trackEvent). */
  event: string;
  /** Identifica qual CTA disparou (hero, demo, cta_final…). */
  source?: string;
};

/** Link que registra o clique no analytics antes de navegar. */
export function TrackLink({ event, source, onClick, ...props }: TrackLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(event, source ? { source } : undefined);
        onClick?.(e);
      }}
    />
  );
}
