import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import wordmark from "../assets/wordmark.png";
import { useAuth } from "../contexts/AuthContext";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError(t("auth.forgotPassword.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-1.5 bg-[#5fac5e]" />
        <div className="p-6 text-center sm:p-8">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <img src={logo} alt="" className="h-12 w-12 rounded-md" />
            <img src={wordmark} alt="Wer Macht" className="h-12 w-auto" />
          </Link>

          <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t("auth.forgotPassword.heading")}
          </h1>

          {sent ? (
            <>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                {t("auth.forgotPassword.successBody")}
              </p>
              <Link to="/login" className="inline-block rounded-full bg-[#5fac5e] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]">
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </>
          ) : (
            <>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                {t("auth.forgotPassword.description")}
              </p>

              {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <input
                  type="email"
                  required
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#5fac5e] px-4 py-3 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
                >
                  {t("auth.forgotPassword.submit")}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <Link to="/login" className="text-purple-700 hover:underline">
                  {t("auth.forgotPassword.backToLogin")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
