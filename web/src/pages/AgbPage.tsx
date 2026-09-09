import { useTranslation } from "react-i18next";

export function AgbPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.agb")}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 1 Geltungsbereich und Vertragsgegenstand
        </h2>
        <p>
          (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform
          "Wer macht" (nachfolgend "Plattform" genannt), betrieben durch [Dein Name / Firmenname
          einfügen], [Deine Adresse einfügen], [Deine E-Mail-Adresse einfügen] (nachfolgend
          "Betreiber" genannt).
        </p>
        <p>
          (2) Die Plattform bietet Nutzern (sowohl privaten als auch gewerblichen) die Möglichkeit,
          Dienstleistungen anzubieten (Inserate) oder Dienstleister für Aufträge zu suchen
          (Gesuche).
        </p>
        <p>
          (3) Der Betreiber stellt lediglich die technische Infrastruktur zur Verfügung und wird
          selbst nicht Vertragspartner der zwischen den Nutzern geschlossenen Verträge.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 2 Registrierung und Nutzerkonto
        </h2>
        <p>
          (1) Die Nutzung der Plattform setzt eine Registrierung voraus. Jeder Nutzer darf nur ein
          Profil anlegen.
        </p>
        <p>(2) Die Nutzer sind verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen.</p>
        <p>
          (3) Nutzer müssen bei der Registrierung angeben, ob sie die Plattform als privater
          (Privat) oder gewerblicher (Gewerblich) Nutzer verwenden. Gewerbliche Nutzer sind
          verpflichtet, die gesetzlichen Vorgaben (z. B. Impressumspflicht) in ihrem Profil
          selbstständig zu erfüllen.
        </p>
        <p>
          (4) Der Betreiber behält sich das Recht vor, Nutzerkonten bei Verstößen gegen diese AGB,
          insbesondere bei der Erstellung von Fake-Profilen oder dem Versuch, das interne
          Zahlungssystem zu umgehen, ohne vorherige Ankündigung dauerhaft zu sperren oder zu
          löschen.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 3 Vertragsschluss zwischen Nutzern
        </h2>
        <p>
          (1) Der rechtlich bindende Vertrag über eine Dienstleistung kommt ausschließlich zwischen
          dem Dienstleister und dem Auftraggeber zustande.
        </p>
        <p>
          (2) Der Vertragsschluss erfolgt, sobald der Auftraggeber ein Angebot des Dienstleisters
          über die Plattform verbindlich annimmt und den Button "Kabul Et und Bezahlen" (bzw.
          "Zahlungpflichtig bestellen") klickt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 4 Widerrufsrecht und Pflichten gewerblicher Nutzer
        </h2>
        <p>
          (1) Schließt ein privater Nutzer (Verbraucher im Sinne des § 13 BGB) einen Vertrag mit
          einem gewerblichen Nutzer (Unternehmer im Sinne des § 14 BGB), steht dem Verbraucher
          grundsätzlich ein gesetzliches Widerrufsrecht zu.
        </p>
        <p>
          (2) Es obliegt ausschließlich dem gewerblichen Nutzer, den Verbraucher rechtmäßig über
          sein Widerrufsrecht zu belehren und eigene Allgemeine Geschäftsbedingungen (AGB)
          bereitzustellen. Die Plattform übernimmt hierfür keine Haftung.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 5 Gebühren, Premium-Pakete und Freiwillige Provision
        </h2>
        <p>
          (1) Die grundlegende Nutzung der Plattform (Registrierung, Inserate erstellen, Angebote
          abgeben) ist für private und gewerbliche Nutzer kostenlos.
        </p>
        <p>
          (2) Premium-Pakete: Nutzer können ein kostenpflichtiges Premium-Paket (PRO) erwerben.
          Dieses beinhaltet erweiterte Funktionen (z. B. unbegrenzte Inserate, unbegrenzte Gebote,
          Top-Platzierung). Der erste Monat ist kostenlos. Danach wandelt sich das Paket in ein
          kostenpflichtiges Abonnement (monatlich, halbjährlich oder jährlich), welches jederzeit
          zum Ende der Laufzeit kündbar ist.
        </p>
        <p>
          (3) Freiwillige Plattform-Gebühr: Bei der Zahlungsabwicklung eines erfolgreich
          vermittelten Auftrags haben die Nutzer die Möglichkeit, der Plattform eine freiwillige
          Gebühr (z. B. 0 %, 5 % oder 10 % der Auftragssumme) als Unterstützung ("Trinkgeld")
          zukommen zu lassen.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 6 Zahlungsabwicklung und Treuhand-System (Escrow)
        </h2>
        <p>
          (1) Die Zahlungsabwicklung erfolgt über einen lizenzierten externen
          Zahlungsdienstleister (z. B. Stripe).
        </p>
        <p>
          (2) Sobald der Auftraggeber ein Angebot annimmt, wird der vereinbarte Betrag im Voraus
          eingezogen und sicher auf einem Treuhandkonto verwahrt.
        </p>
        <p>
          (3) Nach Bestätigung der erfolgreichen Ausführung der Dienstleistung durch den
          Auftraggeber wird der Betrag (abzüglich einer eventuellen freiwilligen
          Plattform-Gebühr) automatisch an den Dienstleister ausgezahlt.
        </p>
        <p>(4) Stornierungen und Konfliktlösung:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Wird ein Auftrag vor Arbeitsbeginn im beiderseitigen Einvernehmen storniert, erhält
            der Auftraggeber den vollen Betrag zurück.
          </li>
          <li>
            Entsteht nach Arbeitsbeginn ein Konflikt (z. B. wegen mangelhafter Ausführung), wird
            das Geld im Treuhandkonto eingefroren. Die Auszahlung erfolgt erst, wenn sich die
            Parteien nachweislich geeinigt haben oder eine rechtskräftige
            behördliche/gerichtliche Entscheidung vorliegt. Die Plattform agiert hierbei nicht
            als rechtlicher Schlichter.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">§ 7 Haftungsbeschränkung</h2>
        <p>
          (1) Der Betreiber haftet nur für Schäden, die auf einer vorsätzlichen oder grob
          fahrlässigen Pflichtverletzung beruhen.
        </p>
        <p>
          (2) Der Betreiber übernimmt keine Gewährleistung für die Richtigkeit der von Nutzern
          gemachten Angaben, die Qualität der erbrachten Dienstleistungen oder die
          Zahlungsfähigkeit der Nutzer.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">§ 8 Schlussbestimmungen</h2>
        <p>(1) Es gilt das Recht der Bundesrepublik Deutschland.</p>
        <p>
          (2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
          Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </section>
    </div>
  );
}
