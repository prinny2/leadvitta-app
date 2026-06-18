export type Theme = "dark" | "light";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem("lb_theme");
    return v === "light" || v === "dark" ? v : "dark";
  } catch {
    // localStorage indisponível (ex.: Safari private, quotas) — usa o padrão.
    return "dark";
  }
}

export function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("light-theme", "dark-theme");
  html.classList.add(theme === "light" ? "light-theme" : "dark-theme");
  try {
    localStorage.setItem("lb_theme", theme);
  } catch {
    // localStorage indisponível — só aplica a classe, sem persistir.
  }
}
