import { useTranslation } from "react-i18next";

export function ImpressumPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("legal.impressum")}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Angaben gemäß § 5 TMG</h2>
        <p>
          Batin Kaska
          <br />
          [Sokak Adı ve Kapı Numaran]
          <br />
          56068 Koblenz
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Kontakt</h2>
        <p>
          Telefon: [Telefon Numaran, örn: +49 152 ...]
          <br />
          E-Mail: <a href="mailto:info@wermacht.app" className="text-[#5fac5e] underline">info@wermacht.app</a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          [DE ile başlayan vergi numaran]
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5fac5e] underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          .
          <br />
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
      </section>

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
