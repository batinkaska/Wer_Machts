import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export function AgbPage() {
  const { t } = useTranslation();
  const { hash } = useLocation();

  // Deep links like /agb#widerruf-pro (from the Pro checkout consent) — the SPA
  // renders after the browser's own anchor jump, so scroll explicitly.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.agb")}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 1 Geltungsbereich und Vertragsgegenstand
        </h2>
        <p>
          (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform
          "Wer macht" (nachfolgend "Plattform" genannt), betrieben durch Batin Kaska, Görgen Str.
          4, 56068 Koblenz, info@wermacht.app (nachfolgend "Betreiber" genannt).
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
          (2) Pro-Mitgliedschaft: Ohne Pro-Mitgliedschaft können Nutzer bis zu drei aktive Inserate
          gleichzeitig veröffentlichen. Nutzer können eine kostenpflichtige Pro-Mitgliedschaft
          („Wer Macht Pro“) abschließen. Diese umfasst: eine unbegrenzte Anzahl aktiver Inserate,
          die Möglichkeit, jeweils ein eigenes Inserat hervorzuheben (bevorzugte Platzierung auf der
          Startseite und in den Suchergebnissen), sowie ein „Pro“-Abzeichen im Profil und an den
          Inseraten.
        </p>
        <p>
          (3) Preise und Laufzeit: Die Pro-Mitgliedschaft kostet 9,99 € pro Monat (monatliche
          Laufzeit), 49,99 € pro sechs Monate (halbjährliche Laufzeit) oder 89,99 € pro Jahr
          (jährliche Laufzeit). Für Nutzer, die noch keine Pro-Mitgliedschaft hatten, sind die
          ersten 30 Tage kostenlos; die erste Zahlung wird erst nach Ablauf dieses Testzeitraums
          fällig. Die Mitgliedschaft verlängert sich jeweils automatisch um die gewählte Laufzeit,
          sofern sie nicht vor Ablauf gekündigt wird. Die Abrechnung erfolgt über den
          Zahlungsdienstleister Stripe.
        </p>
        <p>
          (4) Kündigung: Die Pro-Mitgliedschaft kann jederzeit zum Ende der laufenden Laufzeit bzw.
          des Testzeitraums gekündigt werden — entweder in den Einstellungen unter
          „Pro-Mitgliedschaft verwalten“ oder ohne Anmeldung über die Schaltfläche{" "}
          <a href="/vertraege-kuendigen" className="text-[#5fac5e] underline">
            „Verträge hier kündigen“
          </a>{" "}
          am Ende jeder Seite. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt
          unberührt.
        </p>
        <p>
          (5) Freiwillige Plattform-Gebühr: Bei der Zahlungsabwicklung eines erfolgreich
          vermittelten Auftrags haben die Nutzer die Möglichkeit, der Plattform eine freiwillige
          Gebühr (z. B. 0 %, 5 % oder 10 % der Auftragssumme) als Unterstützung ("Trinkgeld")
          zukommen zu lassen.
        </p>
      </section>

      <section id="widerruf-pro" className="scroll-mt-20 space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 5a Widerrufsbelehrung für die Pro-Mitgliedschaft
        </h2>
        <p>
          Die folgende Belehrung gilt für Verbraucher (§ 13 BGB), die eine Pro-Mitgliedschaft
          abschließen.
        </p>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Widerrufsrecht</h3>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
          widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Batin Kaska, Görgen Str. 4, 56068
          Koblenz, Telefon: +49 178 2487624, E-Mail: info@wermacht.app) mittels einer eindeutigen
          Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren
          Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten
          stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur
          Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
          Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Folgen des Widerrufs</h3>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
          erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
          zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
          eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei
          der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
          ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
          Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen,
          so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem
          Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses
          Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum
          Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht. Während des
          kostenlosen Testzeitraums fallen keine Kosten an.
        </p>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Muster-Widerrufsformular</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und
          senden Sie es zurück.)
        </p>
        <div className="rounded border border-gray-200 p-3 dark:border-gray-700">
          <p>
            An: Batin Kaska, Görgen Str. 4, 56068 Koblenz, E-Mail: info@wermacht.app
          </p>
          <p className="mt-2">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die
            Erbringung der folgenden Dienstleistung: Wer Macht Pro-Mitgliedschaft
          </p>
          <p className="mt-2">Bestellt am (*)</p>
          <p>Name des/der Verbraucher(s)</p>
          <p>Anschrift des/der Verbraucher(s)</p>
          <p>E-Mail-Adresse des Nutzerkontos</p>
          <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
          <p>Datum</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">(*) Unzutreffendes streichen.</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          § 6 Zahlungsabwicklung
        </h2>
        <p>
          (1) Die Kartenzahlung erfolgt über einen lizenzierten externen Zahlungsdienstleister
          (z. B. Stripe). Der Betreiber ist Vertragspartner dieses Zahlungsdienstleisters; die
          Zahlung des Auftraggebers geht zunächst auf ein Konto des Betreibers ein.
        </p>
        <p>
          (2) Sobald der Auftraggeber ein Angebot annimmt und per Karte bezahlt, wird der
          vereinbarte Betrag im Voraus eingezogen und vom Betreiber bis zur Bestätigung der
          erfolgreichen Ausführung zurückgehalten.
        </p>
        <p>
          (3) Nach Bestätigung der erfolgreichen Ausführung der Dienstleistung durch den
          Auftraggeber überweist der Betreiber den Betrag (abzüglich einer eventuellen
          freiwilligen Plattform-Gebühr) innerhalb einer angemessenen Frist per Banküberweisung
          an den Dienstleister.
        </p>
        <p>
          (4) Bei Kartenzahlung wird dem Auftraggeber zusätzlich zum Auftragsbetrag eine
          geschätzte Zahlungsabwicklungsgebühr in Rechnung gestellt, die die anfallenden Gebühren
          des externen Zahlungsdienstleisters abdeckt. Diese Gebühr wird vor Abschluss der Zahlung
          transparent angezeigt. Der Dienstleister erhält stets den vollen im Inserat angegebenen
          Betrag; die Zahlungsabwicklungsgebühr verbleibt beim Betreiber.
        </p>
        <p>(5) Stornierungen und Konfliktlösung:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Wird ein Auftrag vor Arbeitsbeginn im beiderseitigen Einvernehmen storniert, erhält
            der Auftraggeber den vollen Betrag zurück.
          </li>
          <li>
            Entsteht nach Arbeitsbeginn ein Konflikt (z. B. wegen mangelhafter Ausführung), hält
            der Betreiber die Auszahlung zurück. Die Auszahlung erfolgt erst, wenn sich die
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
