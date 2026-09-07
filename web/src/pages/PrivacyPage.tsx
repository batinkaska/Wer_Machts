import { useTranslation } from "react-i18next";

export function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.privacy")}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Plattform ist der Betreiber von
          Wer Macht. Bei Fragen zum Datenschutz kannst du uns über die in deinem Konto hinterlegte
          Kontaktmöglichkeit erreichen.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">2. Welche Daten wir verarbeiten</h2>
        <p>
          Bei der Registrierung speichern wir deinen Namen, deine E-Mail-Adresse und optional
          Angaben wie Telefonnummer, Ort oder Lieferadresse, die du selbst in deinem Profil oder
          in den Einstellungen hinterlegst. Inserierst du einen Auftrag, speichern wir die
          Angaben, die du in der Anzeige machst (z. B. Kategorie, Beschreibung, Fotos, Standort).
          Nachrichten, die du über die Plattform an andere Nutzer sendest, werden gespeichert,
          damit die Konversation nachvollziehbar bleibt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">3. Wofür wir deine Daten nutzen</h2>
        <p>
          Deine Daten werden ausschließlich genutzt, um die Funktionen von Wer Macht bereitzustellen:
          Anzeigen zu veröffentlichen, Angebote abzugeben, Profile darzustellen und Nachrichten
          zwischen Nutzern zu ermöglichen. Eine Weitergabe an Dritte zu Werbezwecken findet nicht
          statt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">4. Speicherung und Hosting</h2>
        <p>
          Deine Daten werden über Google Firebase (Authentifizierung, Datenbank und
          Dateispeicher) gespeichert und verarbeitet.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">5. Deine Rechte</h2>
        <p>
          Du kannst deine Profildaten jederzeit in den Einstellungen einsehen und ändern. Du
          kannst dein Nutzerkonto und die damit verbundenen Daten jederzeit über die
          Einstellungen endgültig löschen lassen.
        </p>
      </section>
    </div>
  );
}
