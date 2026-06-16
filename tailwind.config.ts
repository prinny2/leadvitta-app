import type { Config } from "tailwindcss";
import { tokens } from "./lib/design-system/tokens";

// O tema vem dos design tokens (fonte única de verdade em
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
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      keyframes: tokens.keyframes,
      animation: tokens.animation,
    },
  },
  plugins: [],
} satisfies Config;
