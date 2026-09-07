import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { applyTheme, detectInitialThemePreference } from "./index";

export function ThemeSync() {
  const { appUser } = useAuth();

  useEffect(() => {
    if (appUser?.theme) {
      localStorage.setItem("theme", appUser.theme);
      applyTheme(appUser.theme);
    }
  }, [appUser?.theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      if (detectInitialThemePreference() === "system") {
        applyTheme("system");
      }
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return null;
}
