export type ThemePreference = "light" | "dark" | "system";

function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function detectInitialThemePreference(): ThemePreference {
  const stored = localStorage.getItem("theme");
  return isThemePreference(stored) ? stored : "system";
}

export function prefersDarkSystemTheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  return preference === "system" ? (prefersDarkSystemTheme() ? "dark" : "light") : preference;
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
