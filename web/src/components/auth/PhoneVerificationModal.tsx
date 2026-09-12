import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { type ConfirmationResult, RecaptchaVerifier, linkWithPhoneNumber } from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase/config";
import { friendlyErrorMessage } from "../../lib/friendlyError";

interface PhoneVerificationModalProps {
  reasonText: string;
  onClose: () => void;
  onVerified: () => void;
}

export function PhoneVerificationModal({ reasonText, onClose, onVerified }: PhoneVerificationModalProps) {
  const { t } = useTranslation();
  const { updateProfile } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verified, setVerified] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirmingCode, setConfirmingCode] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));
  const containerId = `phone-verify-recaptcha-${instanceIdRef.current}-${attempt}`;

  // Defense in depth: whenever the modal unmounts (cancelled or verified), make sure
  // any live recaptcha widget is torn down instead of lingering in Google's own
  // internal registry, which is not cleaned up just by React removing the DOM node.
  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  function getRecaptcha() {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setPhoneError(null);
    setSendingCode(true);
    try {
      const verifier = getRecaptcha();
      const result = await linkWithPhoneNumber(auth.currentUser!, phone, verifier);
      setConfirmationResult(result);
    } catch (err) {
      setPhoneError(friendlyErrorMessage(err, t, "phoneVerify.phoneFailed"));
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      // Bump the attempt counter so the next try renders into a brand-new container
      // with a brand-new id — sidesteps "reCAPTCHA has already been rendered in this
      // element", which Google's own widget registry can throw even when React has
      // already replaced the underlying DOM node.
      setAttempt((n) => n + 1);
    } finally {
      setSendingCode(false);
    }
  }

  async function handleConfirmCode(e: FormEvent) {
    e.preventDefault();
    if (!confirmationResult) return;
    setCodeError(null);
    setConfirmingCode(true);
    try {
      await confirmationResult.confirm(code);
      await updateProfile({ phone, phoneVerified: true });
      setVerified(true);
      setTimeout(onVerified, 1200);
    } catch (err) {
      setCodeError(friendlyErrorMessage(err, t, "phoneVerify.codeFailed"));
    } finally {
      setConfirmingCode(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("phoneVerify.title")}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </button>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300">{reasonText}</p>
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t("phoneVerify.privacyNote")}
        </p>

        {verified ? (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            ✓ {t("phoneVerify.phoneVerifiedBadge")}
          </p>
        ) : !confirmationResult ? (
          <form onSubmit={handleSendCode} className="mt-4 space-y-3">
            {phoneError && <p className="text-sm text-red-600 dark:text-red-400">{phoneError}</p>}
            <input
              type="tel"
              required
              placeholder={t("phoneVerify.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={sendingCode}
              className="w-full rounded bg-[#5fac5e] px-4 py-2 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
            >
              {t("phoneVerify.sendCode")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmCode} className="mt-4 space-y-3">
            {codeError && <p className="text-sm text-red-600 dark:text-red-400">{codeError}</p>}
            <input
              required
              placeholder={t("phoneVerify.codePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={confirmingCode}
              className="w-full rounded bg-[#5fac5e] px-4 py-2 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
            >
              {t("phoneVerify.confirmCode")}
            </button>
          </form>
        )}
        <div key={attempt} id={containerId} />
      </div>
    </div>,
    document.body,
  );
}
