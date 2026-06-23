"use client";

import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { trackEvent } from "@/components/Analytics";

type LandingCtaVariant = "primary" | "secondary" | "dark";

const VARIANT_CLASSNAME: Record<LandingCtaVariant, string> = {
  primary: "landing-cta landing-cta-primary",
  secondary: "landing-cta landing-cta-secondary",
  dark: "landing-cta landing-cta-dark",
};

type LandingCtaLinkProps = {
  href: string;
  source: string;
  children: ReactNode;
  variant?: LandingCtaVariant;
  className?: string;
  style?: CSSProperties;
};

export function LandingCtaLink({
  href,
  source,
  children,
  variant = "primary",
  className = "",
  style,
}: LandingCtaLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(VARIANT_CLASSNAME[variant], className)}
      style={style}
      onClick={() => {
        trackEvent("landing_cta_click", { source, href });
      }}
    >
      {children}
    </Link>
  );
}
