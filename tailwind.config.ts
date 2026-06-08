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
        // Escala de cinzas suaves para fundo (token "nude")
        nude: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
        },
        // Preto Dramático — cor primária da marca LeadBellus (token "brand")
        brand: {
          50: "#E9ECEF",
          100: "#DEE2E6",
          200: "#CED4DA",
          300: "#ADB5BD",
          400: "#6C757D",
          500: "#212529", // Core Black
          600: "#1A1D21",
          700: "#121417",
          800: "#0A0B0D",
          900: "#000000",
          dark: "#0A0B0D", // alias para fundo escuro (bg-brand-dark)
        },
        // Cinza Médio — cor de acento/contorno (token "lavender")
        lavender: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#CED4DA",
          300: "#ADB5BD",
          400: "#6C757D",
          500: "#495057",
          600: "#343A40",
          700: "#212529",
        },
        ink: "#212529",
        muted: "#6C757D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Fraunces", "Georgia", "Cambria", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(0, 0, 0, 0.12)",
        card: "0 2px 16px -6px rgba(0, 0, 0, 0.08)",
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
