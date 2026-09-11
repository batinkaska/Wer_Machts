import { applyActionCode } from "firebase/auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import wordmark from "../assets/wordmark.png";
import { auth } from "../firebase/config";

type Status = "checking" | "success" | "error";

export function EmailActionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    if ((mode !== "verifyEmail" && mode !== "verifyAndChangeEmail") || !oobCode) {
      setStatus("error");
      return;
    }
    applyActionCode(auth, oobCode)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-1.5 bg-[#5fac5e]" />
        <div className="p-6 text-center sm:p-8">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <img src={logo} alt="" className="h-10 w-10 rounded-md" />
            <img src={wordmark} alt="Wer Macht" className="h-10 w-auto" />
          </Link>

          {status === "checking" && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("emailAction.verifying")}</p>
          )}

          {status === "success" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("emailAction.successTitle")}
              </h1>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{t("emailAction.successBody")}</p>
              <Link
                to="/"
                className="inline-block rounded-full bg-[#5fac5e] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
              >
                {t("emailAction.continueButton")}
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("emailAction.errorTitle")}
              </h1>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{t("emailAction.errorBody")}</p>
              <Link
                to="/konto-aktivieren"
                className="inline-block rounded-full bg-[#5fac5e] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
              >
                {t("emailAction.requestNewLink")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
