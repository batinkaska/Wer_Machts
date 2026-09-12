import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.png";
import wordmark from "../../assets/wordmark.png";
import { reopenCookieBanner } from "../../lib/cookieConsent";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="flex flex-col items-center justify-center gap-2 border-t border-gray-200 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <img src={logo} alt="" className="h-5 w-5 rounded" />
        <img src={wordmark} alt="Wer Macht" className="h-5 w-auto" />
        <span>— MVP</span>
      </div>
      <button type="button" onClick={reopenCookieBanner} className="text-xs underline hover:text-gray-700 dark:hover:text-gray-300">
        {t("cookies.footerLink")}
      </button>
    </footer>
  );
}
