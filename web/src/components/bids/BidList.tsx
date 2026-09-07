import { useTranslation } from "react-i18next";
import type { Bid, BidStatus } from "../../types/bid";

const STATUS_CLASS: Record<BidStatus, string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

interface BidListProps {
  bids: Bid[];
  isOwner: boolean;
  onAccept?: (bid: Bid) => void;
  onReject?: (bid: Bid) => void;
}

export function BidList({ bids, isOwner, onAccept, onReject }: BidListProps) {
  const { t } = useTranslation();

  if (bids.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("bids.empty")}</p>;
  }

  return (
    <ul className="space-y-3">
      {bids.map((bid) => (
        <li key={bid.id} className="rounded border border-gray-200 p-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">{bid.providerName}</span>
            <span className={`rounded px-2 py-0.5 text-xs ${STATUS_CLASS[bid.status]}`}>
              {t(`bids.status.${bid.status}`)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{bid.amount} €</p>
          {bid.message && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{bid.message}</p>}
          {isOwner && bid.status === "pending" && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onAccept?.(bid)}
                className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
              >
                {t("bids.accept")}
              </button>
              <button
                type="button"
                onClick={() => onReject?.(bid)}
                className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
              >
                {t("bids.reject")}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
