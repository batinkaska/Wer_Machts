import { useTranslation } from "react-i18next";

export function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.terms")}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">1. Geltungsbereich</h2>
        <p>
          Diese Nutzungsbedingungen regeln die Nutzung von Wer Macht, einer Plattform, auf der
          Nutzer Aufträge ausschreiben und Angebote für Dienstleistungen abgeben können.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">2. Registrierung und Konto</h2>
        <p>
          Jeder Nutzer kann auf Wer Macht sowohl Aufträge veröffentlichen als auch Angebote für
          Aufträge anderer Nutzer abgeben. Für die Registrierung sind wahrheitsgemäße Angaben zu
          machen. Du bist für die Sicherheit deines Kontos und deines Passworts selbst
          verantwortlich.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">3. Inhalte der Nutzer</h2>
        <p>
          Für die Inhalte einer Anzeige, eines Angebots oder einer Nachricht ist der jeweilige
          Nutzer selbst verantwortlich. Rechtswidrige, irreführende oder beleidigende Inhalte sind
          nicht gestattet und können gemeldet werden.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">4. Vermittlerrolle</h2>
        <p>
          Wer Macht stellt lediglich die Plattform zur Vermittlung zwischen Auftraggebern und
          Anbietern bereit. Verträge über die Erbringung einer Dienstleistung kommen ausschließlich
          zwischen den Nutzern selbst zustande.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">5. Kontolöschung</h2>
        <p>
          Du kannst dein Konto jederzeit über die Einstellungen endgültig löschen. Mit der
          Löschung werden deine Profildaten entfernt; bereits veröffentlichte Anzeigen, Angebote
          und Nachrichten können aus technischen Gründen bestehen bleiben.
        </p>
      </section>
    </div>
  );
}
