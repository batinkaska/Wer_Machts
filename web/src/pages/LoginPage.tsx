import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import wordmark from "../assets/wordmark.png";
import { GoogleIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { friendlyErrorMessage } from "../lib/friendlyError";

export function LoginPage() {
  const { t } = useTranslation();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      navigate("/");
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "auth.loginFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      const raw =
        err && typeof err === "object"
          ? JSON.stringify(err, Object.getOwnPropertyNames(err))
          : String(err);
      setError(`${friendlyErrorMessage(err, t, "auth.loginFailed")} [DEBUG: ${raw}]`);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-1.5 bg-[#5fac5e]" />
        <div className="p-6 sm:p-8">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <img src={logo} alt="" className="h-12 w-12 rounded-md" />
            <img src={wordmark} alt="Wer Macht" className="h-12 w-auto" />
          </Link>

          <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t("auth.login")}
          </h1>

          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="password"
              required
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <div className="text-right">
              <Link to="/passwort-vergessen" className="text-sm text-purple-700 hover:underline">
                {t("auth.forgotPasswordLink")}
              </Link>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#5fac5e] px-4 py-3 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
            >
              {t("auth.login")}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            {t("common.or")}
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <GoogleIcon className="h-5 w-5" />
            {t("auth.continueWithGoogle")}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t("auth.noAccountYet")}{" "}
            <Link to="/register" className="text-purple-700 hover:underline">
              {t("nav.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
