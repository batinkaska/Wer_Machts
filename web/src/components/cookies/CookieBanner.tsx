import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getCookieConsent, onReopenCookieBanner, setCookieConsent } from "../../lib/cookieConsent";
import { CookieConsentPanel } from "./CookieConsentPanel";

export function CookieBanner() {
  const { t } = useTranslation();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<{ analytics: boolean; marketing: boolean }>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);

    return onReopenCookieBanner(() => {
      const current = getCookieConsent();
      setDraft({ analytics: current?.analytics ?? false, marketing: current?.marketing ?? false });
      setExpanded(true);
      setVisible(true);
    });
  }, []);

  function save(consent: { analytics: boolean; marketing: boolean }) {
    setCookieConsent(consent);
    setVisible(false);
    setExpanded(false);
  }

  // The privacy-settings page already offers the same controls inline — showing
  // the floating banner on top of it there would just be a redundant, tiring popup.
  if (!visible || location.pathname === "/datenschutzeinstellungen") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("cookies.description")}{" "}
          <Link to="/datenschutz" target="_blank" className="font-medium text-[#5fac5e] underline">
            {t("cookies.privacyLink")}
          </Link>
        </p>

        {expanded && (
          <div className="mt-3 border-t border-gray-100 dark:border-gray-800">
            <CookieConsentPanel
              analytics={draft.analytics}
              marketing={draft.marketing}
              onChange={setDraft}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="rounded-full bg-[#5fac5e] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
          >
            {t("cookies.acceptAll")}
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            {t("cookies.rejectAll")}
          </button>
          {expanded ? (
            <button
              type="button"
              onClick={() => save(draft)}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              {t("cookies.saveSelection")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              {t("cookies.customize")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
