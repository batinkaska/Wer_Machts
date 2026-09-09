import { useTranslation } from "react-i18next";

export function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.privacy")}</h1>

      <p>
        Wir freuen uns über deinen Besuch auf unserer Plattform "Wer macht". Der Schutz deiner
        personenbezogenen Daten ist uns ein wichtiges Anliegen. Im Folgenden informieren wir dich
        darüber, welche Daten wir erheben, wie wir sie nutzen und welche Rechte dir nach der
        Datenschutz-Grundverordnung (DSGVO) zustehen.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          1. Verantwortlicher für die Datenverarbeitung
        </h2>
        <p>Verantwortlicher im Sinne der DSGVO und anderer nationaler Datenschutzgesetze ist:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name/Firma: [Dein Name / Firmenname einfügen]</li>
          <li>Adresse: [Deine Adresse einfügen]</li>
          <li>E-Mail: [Deine E-Mail-Adresse einfügen, z. B. wermachtsupport@gmail.com]</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          2. Erhebung und Speicherung personenbezogener Daten
        </h2>
        <p>Wenn du unsere Plattform nutzt oder ein Konto erstellst, erheben wir folgende Daten:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Registrierungsdaten: E-Mail-Adresse, Passwort, Profilname sowie deine Telefonnummer
            zur zweistufigen Verifizierung und Spam-Prävention.
          </li>
          <li>
            Profildaten: Für gewerbliche Nutzer erheben wir gesetzlich vorgeschriebene Daten wie
            Firmenname, Anschrift, Steuernummer und das Impressum.
          </li>
          <li>
            Transaktionsdaten: Informationen zu erstellten Inseraten, Angeboten, angenommenen
            Aufträgen und Nachrichten zwischen Nutzern.
          </li>
        </ul>
        <p>
          Rechtsgrundlage: Die Verarbeitung erfolgt zur Erfüllung eines Vertrags oder
          vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Erfüllung rechtlicher
          Verpflichtungen für gewerbliche Nutzer (Art. 6 Abs. 1 lit. c DSGVO).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          3. Weitergabe von Daten an Drittanbieter
        </h2>
        <p>
          Um unsere Plattform sicher und zuverlässig zu betreiben, nutzen wir ausgewählte
          Dienstleister, die Daten in unserem Auftrag verarbeiten:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Hosting (Vercel): Unsere Website wird bei Vercel Inc. gehostet. Beim Aufruf der Seite
            werden technisch notwendige Daten (z. B. IP-Adresse, Browser-Typ, Zeitpunkt des
            Zugriffs) in Server-Logfiles gespeichert, um die Sicherheit der Plattform zu
            gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).
          </li>
          <li>
            Backend &amp; Authentifizierung (Firebase): Für die Datenbank, die Nutzerverwaltung und
            den SMS-Versand zur Verifizierung nutzen wir Firebase (ein Dienst der Google Ireland
            Limited). Deine Daten (wie E-Mail und Telefonnummer) werden verschlüsselt gespeichert
            und verarbeitet.
          </li>
          <li>
            Zahlungsabwicklung (Stripe): Zahlungen und das Treuhand-System (Escrow) werden über
            Stripe Payments Europe, Ltd. abgewickelt. Wenn du eine Zahlung tätigst, werden
            zahlungsrelevante Daten direkt an Stripe übermittelt. Die Rechtsgrundlage hierfür ist
            die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          4. Cookies und Analyse-Tools
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Technisch notwendige Cookies: Wir setzen Cookies und ähnliche Technologien ein, die
            für den sicheren Betrieb der Plattform (z. B. Login-Status, Sicherheitstoken) zwingend
            erforderlich sind. Diese können nicht deaktiviert werden. Die Rechtsgrundlage ist
            unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).
          </li>
          <li>
            Google Analytics &amp; Marketing: Wir nutzen Google Analytics und ähnliche
            Tracking-Tools zur Optimierung unserer Plattform und für Werbezwecke nur dann, wenn du
            uns beim ersten Besuch über unser Cookie-Banner deine ausdrückliche Einwilligung (Art.
            6 Abs. 1 lit. a DSGVO) erteilt hast. Du kannst diese Einwilligung jederzeit in deinen
            Kontoeinstellungen widerrufen.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          5. Kontaktaufnahme und Kundenservice
        </h2>
        <p>
          Wenn du uns über unser Kontaktformular oder direkt per E-Mail an
          wermachtsupport@gmail.com kontaktierst, speichern wir deine Angaben (z. B. Name,
          E-Mail-Adresse, Inhalt der Nachricht) ausschließlich zur Bearbeitung deiner Anfrage. Die
          Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. b bzw. f DSGVO.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          6. Deine Rechte (Betroffenenrechte)
        </h2>
        <p>Nach der DSGVO hast du folgende Rechte hinsichtlich deiner personenbezogenen Daten:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Recht auf Auskunft: Du kannst jederzeit eine Bestätigung verlangen, ob und welche
            Daten wir von dir verarbeiten.
          </li>
          <li>
            Recht auf Berichtigung und Löschung: Du kannst unrichtige Daten korrigieren oder dein
            Profil und die damit verbundenen Daten löschen lassen, sofern keine gesetzlichen
            Aufbewahrungsfristen (z. B. Steuergesetze) entgegenstehen.
          </li>
          <li>
            Recht auf Einschränkung und Datenübertragbarkeit: Du hast das Recht, die Verarbeitung
            einzuschränken und deine Daten in einem maschinenlesbaren Format zu erhalten.
          </li>
          <li>
            Beschwerderecht: Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu
            beschweren, wenn du der Ansicht bist, dass die Verarbeitung deiner Daten gegen das
            Datenschutzrecht verstößt.
          </li>
        </ul>
        <p>
          Für alle Anliegen rund um den Datenschutz kannst du dich jederzeit an unsere oben
          genannte Kontaktadresse wenden.
        </p>
      </section>
    </div>
  );
}
