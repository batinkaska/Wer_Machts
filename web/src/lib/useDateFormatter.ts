import { useTranslation } from "react-i18next";
import { formatDate, formatMessageTime } from "./formatDate";

const LOCALE_MAP: Record<string, string> = {
  de: "de-DE",
  en: "en-US",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar-SA",
};

export function useDateFormatter() {
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] ?? "de-DE";
  return {
    formatDate: (ts: Parameters<typeof formatDate>[0]) => formatDate(ts, locale),
    formatMessageTime: (ts: Parameters<typeof formatMessageTime>[0]) =>
      formatMessageTime(ts, locale, t("common.today"), t("common.yesterday")),
  };
}
