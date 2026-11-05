import { useTranslation } from "react-i18next";

export function ImpressumPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.impressum")}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Angaben gemäß § 5 DDG</h2>
        <p>
          Batin Kaska
          <br />
          Görgen Str. 4
          <br />
          56068 Koblenz
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Kontakt</h2>
        <p>
          Telefon: +49 178 2487624
          <br />
          E-Mail: <a href="mailto:info@wermacht.app" className="text-[#5fac5e] underline">info@wermacht.app</a>
        </p>
      </section>

      {/*
        Hidden on purpose: no USt-IdNr has been issued yet, and § 5 DDG only
        requires this line once one exists. Remove this comment wrapper and fill
        in the real number as soon as it is issued.

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          [DE ile başlayan vergi numaran]
        </p>
      </section>
      */}

      {/* The EU Online Dispute Resolution (ODR) platform was shut down on
          20 July 2025, so the former "EU-Streitschlichtung" link section is gone. */}

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Verbraucher­streit­beilegung/Universal­schlichtungs­stelle
        </h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </div>
  );
}
