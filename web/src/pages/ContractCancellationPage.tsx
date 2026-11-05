import { httpsCallable } from "firebase/functions";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { functions } from "../firebase/config";
import { friendlyErrorMessage } from "../lib/friendlyError";

const requestContractCancellationFn = httpsCallable(functions, "requestContractCancellation");

type CancellationKind = "ordinary" | "extraordinary";

interface Receipt {
  receivedAt: string;
  name: string;
  email: string;
  kind: CancellationKind;
  reason: string;
}

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

/**
 * The "Verträge hier kündigen" page required by § 312k BGB. Works without login on
 * purpose — cancelling must never be harder than signing up.
 */
export function ContractCancellationPage() {
  const { t } = useTranslation();
  const { appUser, firebaseUser } = useAuth();

  const [name, setName] = useState(appUser?.displayName ?? "");
  const [email, setEmail] = useState(firebaseUser?.email ?? "");
  const [kind, setKind] = useState<CancellationKind>("ordinary");
  const [reason, setReason] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — must stay empty
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await requestContractCancellationFn({ name, email, kind, reason, website });
      const { receivedAt } = result.data as { receivedAt: string };
      setReceipt({ receivedAt, name, email, kind, reason });
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "cancellation.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("cancellation.pageTitle")}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("cancellation.intro")}</p>
      </div>

      {receipt ? (
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircleIcon className="h-6 w-6 shrink-0" />
            <p className="text-base font-semibold">{t("cancellation.receivedTitle")}</p>
          </div>
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
            <dt className="text-gray-500 dark:text-gray-400">{t("cancellation.receivedAtLabel")}</dt>
            <dd>{receipt.receivedAt}</dd>
            <dt className="text-gray-500 dark:text-gray-400">{t("cancellation.contractLabel")}</dt>
            <dd>{t("cancellation.contractPro")}</dd>
            <dt className="text-gray-500 dark:text-gray-400">{t("cancellation.kindLabel")}</dt>
            <dd>{t(`cancellation.kind.${receipt.kind}`)}</dd>
            {receipt.name && (
              <>
                <dt className="text-gray-500 dark:text-gray-400">{t("cancellation.nameLabel")}</dt>
                <dd>{receipt.name}</dd>
              </>
            )}
            <dt className="text-gray-500 dark:text-gray-400">{t("cancellation.emailLabel")}</dt>
            <dd className="break-all">{receipt.email}</dd>
            {receipt.reason && (
              <>
                <dt className="text-gray-500 dark:text-gray-400">{t("cancellation.reasonLabel")}</dt>
                <dd className="whitespace-pre-wrap">{receipt.reason}</dd>
              </>
            )}
          </dl>
          <p className="text-sm text-gray-700 dark:text-gray-300">{t("cancellation.receivedNote")}</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t("cancellation.print")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <label className={labelClass}>{t("cancellation.contractLabel")}</label>
            <select disabled className={`${inputClass} opacity-80`} value="pro">
              <option value="pro">{t("cancellation.contractPro")}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t("cancellation.nameLabel")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t("cancellation.emailLabel")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("cancellation.emailHint")}</p>
          </div>

          <fieldset className="space-y-2">
            <legend className={labelClass}>{t("cancellation.kindLabel")}</legend>
            {(["ordinary", "extraordinary"] as const).map((value) => (
              <label key={value} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="kind"
                  value={value}
                  checked={kind === value}
                  onChange={() => setKind(value)}
                  className="mt-0.5"
                />
                <span>{t(`cancellation.kind.${value}`)}</span>
              </label>
            ))}
          </fieldset>

          {kind === "extraordinary" && (
            <div>
              <label className={labelClass}>{t("cancellation.reasonLabel")}</label>
              <textarea
                required
                minLength={3}
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Honeypot field: hidden from real users via CSS, invisible to screen readers. */}
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? t("cancellation.submitting") : t("cancellation.submit")}
          </button>
        </form>
      )}
    </div>
  );
}
