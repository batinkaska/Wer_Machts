import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { bidsCol } from "../firebase/converters";
import { useMyBids } from "../hooks/useBids";
import type { Bid } from "../types/bid";

function BidRow({ bid }: { bid: Bid }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  async function handleWithdraw() {
    await deleteDoc(doc(bidsCol, bid.id));
  }

  return (
    <li className="rounded border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/ads/${bid.adId}`}
          className="font-medium text-purple-700 hover:underline dark:text-purple-400"
        >
          {bid.adTitle ?? t("myBids.toAd")}
        </Link>
        <div className="flex items-center gap-2">
          {bid.status === "pending" && !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-950"
            >
              {t("myBids.withdraw")}
            </button>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{t(`bids.status.${bid.status}`)}</span>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{bid.amount} €</p>
      {bid.status === "pending" && confirming && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            {t("myBids.withdrawConfirm")}
          </span>
          <button
            type="button"
            onClick={handleWithdraw}
            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            {t("myBids.withdraw")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </button>
        </div>
      )}
    </li>
  );
}

export function MyBidsPage() {
  const { t } = useTranslation();
  const { firebaseUser } = useAuth();
  const { bids, loading } = useMyBids(firebaseUser?.uid);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("myBids.pageTitle")}</h1>
      {loading && <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}
      {!loading && bids.length === 0 && <p className="text-gray-500 dark:text-gray-400">{t("myBids.empty")}</p>}
      <ul className="space-y-3">
        {bids.map((bid) => (
          <BidRow key={bid.id} bid={bid} />
        ))}
      </ul>
    </div>
  );
}
