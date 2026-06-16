export type Theme = "dark" | "light";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("lb_theme") as Theme) ?? "dark";
}

export function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("light-theme", "dark-theme");
  html.classList.add(theme === "light" ? "light-theme" : "dark-theme");
  localStorage.setItem("lb_theme", theme);
}
