import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CookieConsentPanel } from "../components/cookies/CookieConsentPanel";
import { getCookieConsent, setCookieConsent } from "../lib/cookieConsent";

export function PrivacySettingsPage() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<{ analytics: boolean; marketing: boolean }>({
    analytics: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getCookieConsent();
    if (current) setDraft({ analytics: current.analytics, marketing: current.marketing });
  }, []);

  function handleSave() {
    setCookieConsent(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.privacySettings")}</h1>

      <p>{t("cookies.settingsIntro")}</p>

      <div className="rounded-lg border border-gray-200 px-4 dark:border-gray-700">
        <CookieConsentPanel analytics={draft.analytics} marketing={draft.marketing} onChange={setDraft} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-[#5fac5e] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
        >
          {t("cookies.saveSelection")}
        </button>
        {saved && (
          <span className="text-sm font-medium text-[#4d9a4c]">{t("cookies.savedConfirmation")}</span>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{t("cookies.settingsNote")}</p>
    </div>
  );
}
