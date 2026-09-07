import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { RTL_LANGUAGES } from "./index";

export function LanguageSync() {
  const { i18n } = useTranslation();
  const { appUser } = useAuth();

  useEffect(() => {
    if (appUser?.language && appUser.language !== i18n.language) {
      i18n.changeLanguage(appUser.language);
      localStorage.setItem("language", appUser.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser?.language]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = (RTL_LANGUAGES as readonly string[]).includes(i18n.language)
      ? "rtl"
      : "ltr";
  }, [i18n.language]);

  return null;
}
