import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import logo from "../assets/logo.png";
import wordmark from "../assets/wordmark.png";
import { EyeIcon, EyeOffIcon, GoogleIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { friendlyErrorMessage } from "../lib/friendlyError";
import type { AccountType } from "../types/user";

export function RegisterPage() {
  const { t } = useTranslation();
  const {
    firebaseUser,
    appUser,
    loading,
    needsProfile,
    needsActivation,
    registerWithEmail,
    loginWithGoogle,
    completeProfile,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (firebaseUser && appUser) {
    return needsActivation ? <Navigate to="/konto-aktivieren" replace /> : <Navigate to="/" replace />;
  }

  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = firebaseUser ?? (await registerWithEmail(email, password));
      await completeProfile({ displayName, accountType: accountType as AccountType, marketingOptIn }, user);
      // No explicit navigate() here — the `firebaseUser && appUser` guard above
      // redirects declaratively once the profile is set. An explicit navigate("/")
      // here can fire late (after the user has already clicked elsewhere) and yank
      // them back to the homepage.
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "auth.registerFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "auth.loginFailed"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-1.5 bg-[#5fac5e]" />
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            <img src={logo} alt="" className="h-12 w-12 rounded-md" />
            <img src={wordmark} alt="Wer Macht" className="h-12 w-auto" />
          </div>

          <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {needsProfile ? t("auth.completeProfile") : t("auth.registerHeading")}
          </h1>

          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            {!firebaseUser && (
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.credentialsHeading")}
              </h2>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium cursor-pointer ${
                  accountType === "private"
                    ? "border-[#5fac5e] bg-green-50 text-[#4d9a4c] dark:bg-green-950"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  required
                  value="private"
                  checked={accountType === "private"}
                  onChange={() => setAccountType("private")}
                  className="h-4 w-4 accent-[#5fac5e]"
                />
                {t("auth.accountTypePrivate")}
              </label>
              <label
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium cursor-pointer ${
                  accountType === "business"
                    ? "border-[#5fac5e] bg-green-50 text-[#4d9a4c] dark:bg-green-950"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  required
                  value="business"
                  checked={accountType === "business"}
                  onChange={() => setAccountType("business")}
                  className="h-4 w-4 accent-[#5fac5e]"
                />
                {t("auth.accountTypeBusiness")}
              </label>
            </div>
            <input
              required
              placeholder={t("auth.namePlaceholder")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            {!firebaseUser && (
              <>
                <input
                  type="email"
                  required
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 pr-10 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
                    aria-label={t("auth.passwordPlaceholder")}
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </>
            )}

            <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#5fac5e]"
              />
              <span>
                {t("auth.acceptTermsBefore")}{" "}
                <Link to="/nutzungsbedingungen" target="_blank" className="text-[#5fac5e] underline">
                  {t("legal.terms")}
                </Link>{" "}
                {t("auth.acceptTermsMiddle")}{" "}
                <Link to="/datenschutz" target="_blank" className="text-[#5fac5e] underline">
                  {t("legal.privacy")}
                </Link>{" "}
                {t("auth.acceptTermsAfter")}
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#5fac5e]"
              />
              {t("adForm.marketingOptIn")}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#5fac5e] px-4 py-3 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
            >
              {needsProfile ? t("auth.completeProfile") : t("auth.registerCta")}
            </button>

            {!firebaseUser && (
              <>
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                  {t("common.or")}
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="flex w-full items-center justify-center gap-3 rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <GoogleIcon className="h-5 w-5" />
                  {t("auth.continueWithGoogleAlt")}
                </button>
              </>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {t("adForm.legalBefore")}{" "}
              <Link to="/nutzungsbedingungen" target="_blank" className="text-[#5fac5e] underline">
                {t("legal.terms")}
              </Link>
              {t("adForm.legalMiddle")}{" "}
              <Link to="/datenschutz" target="_blank" className="text-[#5fac5e] underline">
                {t("legal.privacy")}
              </Link>
              {t("adForm.legalAfter")}
            </p>
          </form>

          {!firebaseUser && (
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link to="/login" className="text-purple-700 hover:underline">
                {t("nav.login")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
