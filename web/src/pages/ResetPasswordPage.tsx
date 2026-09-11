import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import wordmark from "../assets/wordmark.png";
import { auth } from "../firebase/config";

type Status = "checking" | "form" | "success" | "error";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (searchParams.get("mode") !== "resetPassword" || !oobCode) {
      setStatus("error");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((verifiedEmail) => {
        setEmail(verifiedEmail);
        setStatus("form");
      })
      .catch(() => setStatus("error"));
  }, [oobCode, searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!oobCode) return;
    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
    } catch {
      setError(t("auth.resetPassword.error"));
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

          {status === "checking" && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("auth.resetPassword.checking")}</p>
          )}

          {status === "form" && (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.resetPassword.heading")}
              </h1>
              {email && (
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  {t("auth.resetPassword.forEmail")} <strong>{email}</strong>
                </p>
              )}

              {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#5fac5e] px-4 py-3 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
                >
                  {t("auth.resetPassword.submit")}
                </button>
              </form>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.resetPassword.successTitle")}
              </h1>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                {t("auth.resetPassword.successBody")}
              </p>
              <Link to="/login" className="inline-block rounded-full bg-[#5fac5e] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]">
                {t("auth.login")}
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.resetPassword.errorTitle")}
              </h1>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                {t("auth.resetPassword.errorBody")}
              </p>
              <Link to="/passwort-vergessen" className="inline-block rounded-full bg-[#5fac5e] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]">
                {t("auth.forgotPassword.heading")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
