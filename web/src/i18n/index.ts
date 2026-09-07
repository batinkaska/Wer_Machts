import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import tr from "./locales/tr.json";

export const SUPPORTED_LANGUAGES = ["de", "en", "ru", "tr", "ar"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];
export const RTL_LANGUAGES: readonly LanguageCode[] = ["ar"];

function isSupported(code: string | null | undefined): code is LanguageCode {
  return !!code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

function detectInitialLanguage(): LanguageCode {
  const stored = localStorage.getItem("language");
  if (isSupported(stored)) return stored;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  if (isSupported(browser)) return browser;
  return "de";
}

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    ru: { translation: ru },
    tr: { translation: tr },
    ar: { translation: ar },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "de",
  interpolation: { escapeValue: false },
});

export default i18n;
