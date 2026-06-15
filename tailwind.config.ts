import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Creme quente — fundos (hero, cards)
        nude: {
          50: "#FBF9F3",
          100: "#F5F0E4",
          200: "#EBE3D2",
          300: "#DDD2BC",
        },
        // Verde-escuro LeadBellus — marca, fundos premium
        brand: {
          50: "#EEF6F3",
          100: "#D5EBE3",
          200: "#A8D4C4",
          300: "#6BB59A",
          400: "#3D8F72",
          500: "#0E3A30",
          600: "#0C3229",
          700: "#0A2A22",
          800: "#082219",
          900: "#051A15",
          dark: "#0E3A30",
        },
        // Dourado — CTAs, destaques, conversão
        gold: {
          50: "#FDF8ED",
          100: "#F9EDD4",
          200: "#F0D9A8",
          300: "#E5C47B",
          400: "#D4AD5A",
          500: "#CDA347",
          600: "#B8860B",
          700: "#9A6F09",
        },
        // Champagne — texto em fundo escuro
        lavender: {
          50: "#FAF7F2",
          100: "#F3EDE3",
          200: "#E8DCC8",
          300: "#D9C9AD",
          400: "#C4B08E",
          500: "#A89572",
          600: "#8A7A5E",
          700: "#6B6049",
        },
        // Coral — gancho de dor / perda
        pain: {
          50: "#FEF2F0",
          100: "#FDE4DF",
          200: "#FAC4BA",
          300: "#F49A88",
          400: "#E86F58",
          500: "#D94F3A",
          600: "#B83D2B",
        },
        ink: "#0E3A30",
        muted: "#5C6B66",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "Cambria", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(14, 58, 48, 0.14)",
        card: "0 2px 16px -6px rgba(14, 58, 48, 0.08)",
        cta: "0 8px 28px -6px rgba(205, 163, 71, 0.45)",
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
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        float: "float 7s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out infinite 0.6s",
      },
    },
  },
  plugins: [],
} satisfies Config;