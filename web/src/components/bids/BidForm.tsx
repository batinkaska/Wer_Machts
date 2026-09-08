import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

interface BidFormProps {
  onSubmit: (values: { amount: number; message?: string }) => Promise<void>;
  submitting: boolean;
}

export function BidForm({ onSubmit, submitting }: BidFormProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ amount: Number(amount), ...(message ? { message } : {}) });
      setAmount("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("bids.submitError"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-gray-100">{t("bids.formHeading")}</h3>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="bid-amount">
          {t("bids.amountLabel")}
        </label>
        <input
          id="bid-amount"
          type="number"
          min={0}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="bid-message">
          {t("bids.noteLabel")}
        </label>
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t("bids.noteHint")}</p>
        <textarea
          id="bid-message"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-purple-700 px-4 py-2 text-sm text-white hover:bg-purple-800 disabled:opacity-50"
      >
        {submitting ? t("adDetail.sending") : t("bids.submit")}
      </button>
    </form>
  );
}
