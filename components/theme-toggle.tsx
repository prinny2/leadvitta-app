"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105"
      style={{
        background: "rgba(201,160,96,0.1)",
        border: "1px solid rgba(201,160,96,0.25)",
        color: "#C9A060",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
