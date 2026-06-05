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
        // Fundo creme / ivory (token "nude")
        nude: {
          50: "#fbf9f3",
          100: "#f5f0e4",
          200: "#ebe3cf",
          300: "#ddd1b4",
        },
        // Verde-escuro — cor primária da marca LeadBellus (token "brand")
        brand: {
          50: "#f0f6f4",
          100: "#dcebe6",
          200: "#b6d2c9",
          300: "#82b0a4",
          400: "#4f8d7e",
          500: "#2a6f5e",
          600: "#1c5a4b",
          700: "#14463a",
          800: "#0e3a30",
          900: "#0b2a23",
        },
        // Dourado — cor de acento (token "lavender")
        lavender: {
          50: "#faf4e6",
          100: "#f3e7c8",
          200: "#e7cf94",
          300: "#dab863",
          400: "#cda347",
          500: "#bd9239",
          600: "#9c7730",
          700: "#7c5e28",
        },
        ink: "#133127",
        muted: "#6f7d76",
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
        soft: "0 4px 24px -8px rgba(14, 58, 48, 0.22)",
        card: "0 2px 16px -6px rgba(19, 49, 39, 0.10)",
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
