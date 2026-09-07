import { useTranslation } from "react-i18next";

export function PrivacySettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.privacySettings")}</h1>
      <p>
        Wer Macht verwendet aktuell keine Drittanbieter-Tools zur Reichweitenmessung oder
        Analyse deines Nutzungsverhaltens und setzt keine Werbe- oder Tracking-Cookies ein. Es
        gibt daher derzeit keine Einwilligungen zu verwalten.
      </p>
      <p>
        Für den Betrieb der Plattform notwendige technische Daten (z. B. deine Anmeldesitzung)
        werden ausschließlich über Google Firebase verarbeitet — Details dazu findest du in der{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">Datenschutzerklärung</span>.
      </p>
      <p>
        Sollten in Zukunft Analyse- oder Messwerkzeuge hinzukommen, wirst du hier die Möglichkeit
        haben, dieser Nutzung zuzustimmen oder sie abzulehnen.
      </p>
    </div>
  );
}
