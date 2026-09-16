import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import wordmark from "../../assets/wordmark.png";
import { InstagramIcon } from "../icons";
import { reopenCookieBanner } from "../../lib/cookieConsent";

export function Footer() {
  const { t } = useTranslation();

  const linkClass = "hover:text-gray-700 hover:underline dark:hover:text-gray-300";

  return (
    <footer className="border-t border-gray-200 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <img src={logo} alt="" className="h-5 w-5 rounded" />
          <img src={wordmark} alt="Wer Macht" className="h-5 w-auto" />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © 2026 Wer Macht, betrieben von Batin Kaska. Alle Rechte vorbehalten.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          <Link to="/impressum" className={linkClass}>
            {t("legal.impressum")}
          </Link>
          <Link to="/datenschutz" className={linkClass}>
            {t("legal.privacy")}
          </Link>
          <Link to="/agb" className={linkClass}>
            {t("legal.agb")}
          </Link>
          <Link to="/kontakt" className={linkClass}>
            {t("contact.pageTitle")}
          </Link>
          <button type="button" onClick={reopenCookieBanner} className={linkClass}>
            {t("cookies.footerLink")}
          </button>
          <a
            href="https://www.instagram.com/wermacht.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={linkClass}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
