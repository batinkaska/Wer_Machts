import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { GoogleIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";

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
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
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
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("auth.login")}</h1>
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
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-purple-700 px-4 py-2 text-white hover:bg-purple-800 disabled:opacity-50"
        >
          {t("auth.login")}
        </button>
      </form>
      <button
        type="button"
        onClick={handleGoogle}
        className="mt-3 flex w-full items-center justify-center gap-3 rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
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
  );
}
