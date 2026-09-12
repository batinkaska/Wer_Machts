import { httpsCallable } from "firebase/functions";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { functions } from "../firebase/config";
import { friendlyErrorMessage } from "../lib/friendlyError";

const sendContactMessageFn = httpsCallable(functions, "sendContactMessage");

export function ContactPage() {
  const { t } = useTranslation();
  const { appUser, firebaseUser } = useAuth();

  const [name, setName] = useState(appUser?.displayName ?? "");
  const [email, setEmail] = useState(firebaseUser?.email ?? "");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — must stay empty
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendContactMessageFn({
        name,
        email,
        subject: t(`contact.subjectOptions.${subject}`),
        message,
        website,
      });
      setSent(true);
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "contact.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("contact.pageTitle")}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("contact.intro")}</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t("contact.directEmailBefore")}{" "}
          <a href="mailto:info@wermacht.app" className="font-medium text-[#5fac5e] underline">
            info@wermacht.app
          </a>{" "}
          {t("contact.directEmailAfter")}
        </p>
      </div>

      {sent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
          ✓ {t("contact.successMessage")}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("contact.nameLabel")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("contact.namePlaceholder")}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("contact.emailLabel")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("contact.subjectLabel")}
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="general">{t("contact.subjectOptions.general")}</option>
              <option value="complaint">{t("contact.subjectOptions.complaint")}</option>
              <option value="technical">{t("contact.subjectOptions.technical")}</option>
              <option value="other">{t("contact.subjectOptions.other")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("contact.messageLabel")}
            </label>
            <textarea
              required
              minLength={5}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("contact.messagePlaceholder")}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Honeypot field: hidden from real users via CSS, invisible to screen readers. */}
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#5fac5e] px-4 py-3 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
          >
            {submitting ? t("contact.sending") : t("contact.submit")}
          </button>
        </form>
      )}
    </div>
  );
}
