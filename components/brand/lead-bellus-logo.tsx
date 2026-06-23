// LeadBellus — marca da campanha (Navy / Gold / Fraunces).
// Recriação fiel do handoff "Google ads campaign logos" / _export.dc.html.
// Símbolo = balão de conversa + chama; wordmark = Fraunces 600.
// NÃO substitui a marca atual do app (components/logo.tsx / app/icon.svg);
// é o pacote de identidade da campanha, reproduzível em vetor.

export const LB_BRAND = {
  gold: "#C9A060",
  navyInk: "#07101e",
  navyGradient: "linear-gradient(160deg,#0a1526,#06101c)",
  light: "#FBF8F2",
  lightText: "#F4EFE6",
} as const;

export type LeadBellusVariant = "navy" | "light";

// Geometria verbatim do _export.dc.html (viewBox 0 0 120 120).
const MARK_BUBBLE =
  "M30 26 H88 a14 14 0 0 1 14 14 V72 a14 14 0 0 1 -14 14 H56 L40 104 V86 H30 a14 14 0 0 1 -14 -14 V40 a14 14 0 0 1 14 -14 Z";
const MARK_FLAME = "M59 42 C71 56 71 68 59 78 C47 68 47 56 59 42 Z";

/** Símbolo isolado. Em fundo navy o traço é dourado; em fundo claro o traço é navy e a chama dourada. */
export function LeadBellusSymbol({
  size = 40,
  variant = "navy",
  className,
  title = "LeadBellus",
}: {
  size?: number;
  variant?: LeadBellusVariant;
  className?: string;
  title?: string;
}) {
  const stroke = variant === "navy" ? LB_BRAND.gold : LB_BRAND.navyInk;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
      style={{ display: "block" }}
    >
      <path
        d={MARK_BUBBLE}
        fill="none"
        stroke={stroke}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path d={MARK_FLAME} fill={LB_BRAND.gold} />
    </svg>
  );
}

/** Wordmark "LeadBellus" em Fraunces 600. Carregue a fonte (public/brand/fonts/Fraunces.ttf ou Google Fonts) para bater com os PNGs. */
export function LeadBellusWordmark({
  size = 28,
  variant = "navy",
  className,
}: {
  size?: number;
  variant?: LeadBellusVariant;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: variant === "navy" ? LB_BRAND.lightText : LB_BRAND.navyInk,
      }}
    >
      LeadBellus
    </span>
  );
}

/** Lockup completo (símbolo + wordmark). `stack` empilha na vertical (proporção do logo 1:1). */
export function LeadBellusLogo({
  variant = "navy",
  symbolSize = 40,
  wordSize = 28,
  stack = false,
  className,
}: {
  variant?: LeadBellusVariant;
  symbolSize?: number;
  wordSize?: number;
  stack?: boolean;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: stack ? "column" : "row",
        alignItems: "center",
        gap: stack ? symbolSize * 0.18 : symbolSize * 0.32,
      }}
    >
      <LeadBellusSymbol size={symbolSize} variant={variant} />
      <LeadBellusWordmark size={wordSize} variant={variant} />
    </span>
  );
}

/** Ícone de app / favicon: símbolo dourado sobre tile navy arredondado (raio ≈22%, igual ao export 512/48). */
export function LeadBellusAppIcon({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.222,
        background: LB_BRAND.navyGradient,
      }}
    >
      <LeadBellusSymbol size={size * 0.586} variant="navy" />
    </span>
  );
}
