import type { Config } from "tailwindcss";

// Paleta navy + gold da identidade LeadBellus (PR #34 / eager-goldberg).
// lib/design-system/tokens.ts). Para mudar a paleta, sombras, tipografia ou
// movimento, edite os tokens — não este arquivo.
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy — identidade LeadBellus
        navy: {
          950: "#040912",
          900: "#07101e", // body bg — deeper
          800: "#0b1424", // sidebar
          700: "#0f1b2f", // cards
          600: "#131f35", // elevated cards
          500: "#1a2840", // borders
          400: "#243450",
          300: "#304565",
          200: "#3f5878",
          100: "#5a7a9a", // muted text
          50: "#8aacc8",
        },
        // Mantém brand como alias navy para compatibilidade
        brand: {
          50: "#060F1C",
          100: "#0A1628",
          200: "#111F38",
          300: "#162540",
          400: "#1E3050",
          500: "#0A1628", // sidebar bg, botões primários
          600: "#060F1C",
          700: "#040C16",
          800: "#020A12",
          900: "#010608",
          dark: "#0A1628",
        },
        // Dourado — CTAs, destaques, conversão
        gold: {
          50: "#FDF6E8",
          100: "#F9EAC8",
          200: "#F0D090",
          300: "#E4B85A",
          400: "#D4A84A",
          500: "#C9A060", // dourado principal
          600: "#B8860B",
          700: "#9A6F09",
        },
        // Champagne — texto em fundo escuro
        champagne: {
          100: "#F0E6D3",
          200: "#E8D5B7",
          300: "#D4C4A0", // texto principal
          400: "#BEA882",
          500: "#A08860",
        },
        // Legado lavender → agora champagne
        lavender: {
          50: "#F0E6D3",
          100: "#E8D5B7",
          200: "#D4C4A0",
          300: "#D4C4A0",
          400: "#BEA882",
          500: "#A08860",
          600: "#8A7860",
          700: "#6B6049",
        },
        // Dor / urgência
        pain: {
          50: "#FEF2F0",
          100: "#FDE4DF",
          200: "#FAC4BA",
          300: "#F49A88",
          400: "#E86F58",
          500: "#D94F3A",
          600: "#B83D2B",
        },
        // Semântica
        ink: "#D4C4A0", // texto principal (champagne)
        muted: "#6B8CAE", // texto secundário (navy-100)
        surface: "#0D1B30", // cards
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["var(--font-fraunces)", "Georgia", "Cambria", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(0, 0, 0, 0.5)",
        card: "0 2px 16px -6px rgba(0, 0, 0, 0.4)",
        cta: "0 8px 28px -6px rgba(201, 160, 96, 0.45)",
        glow: "0 0 40px -10px rgba(201, 160, 96, 0.3)",
        "navy-lg": "0 8px 32px -8px rgba(3, 8, 16, 0.8)",
      },
      backgroundImage: {
        "gold-shimmer":
          "linear-gradient(135deg, #D4A84A 0%, #C9A060 45%, #B8860B 100%)",
        "navy-card": "linear-gradient(135deg, #0f1b2f 0%, #131f35 100%)",
        "navy-deep": "linear-gradient(180deg, #07101e 0%, #040912 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        float: "float 7s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out infinite 0.6s",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
