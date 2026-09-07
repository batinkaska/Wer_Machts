import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import wordmark from "../assets/wordmark.png";
import { useAuth } from "../contexts/AuthContext";

export function AccountActivationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    firebaseUser,
    loading,
    needsProfile,
    needsActivation,
    emailVerified,
    resendVerificationEmail,
    refreshEmailVerified,
    logout,
  } = useAuth();

  const [resendState, setResendState] = useState<"idle" | "sent">("idle");
  const [refreshing, setRefreshing] = useState(false);

  if (loading) return null;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (needsProfile) return <Navigate to="/register" replace />;
  if (!needsActivation) return <Navigate to="/" replace />;

  async function handleResend() {
    await resendVerificationEmail();
    setResendState("sent");
    setTimeout(() => setResendState("idle"), 15000);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refreshEmailVerified();
    setRefreshing(false);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-1.5 bg-[#5fac5e]" />
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            <img src={logo} alt="" className="h-10 w-10 rounded-md" />
            <img src={wordmark} alt="Wer Macht" className="h-10 w-auto" />
          </div>

          <div className="mb-6 rounded-md bg-lime-300 px-4 py-3 text-center font-semibold text-gray-900 dark:bg-lime-500/20 dark:text-lime-100">
            {t("auth.activation.bannerTitle")}
          </div>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t("auth.activation.emailSentBefore")}{" "}
              <strong className="text-gray-900 dark:text-gray-100">{firebaseUser.email}</strong>{" "}
              {t("auth.activation.emailSentAfter")}
            </p>
            <p>{t("auth.activation.phoneNote")}</p>
          </div>

          {emailVerified ? (
            <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              ✓ {t("auth.activation.emailVerifiedBadge")}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {t("auth.activation.noEmailHeading")}
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>{t("auth.activation.checkSpam")}</li>
                  <li>{t("auth.activation.checkInbox")}</li>
                  <li>{t("auth.activation.checkExisting")}</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleResend}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  {resendState === "sent" ? t("auth.activation.resendSent") : t("auth.activation.resend")}
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="rounded bg-[#5fac5e] px-4 py-2 text-sm text-white hover:bg-[#4d9a4c] disabled:opacity-50"
                >
                  {t("auth.activation.confirmRefresh")}
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={handleLogout}
              className="text-purple-700 hover:underline dark:text-purple-400"
            >
              {t("nav.logout")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
