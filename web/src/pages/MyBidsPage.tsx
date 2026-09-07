import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMyBids } from "../hooks/useBids";

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
          <li key={bid.id} className="rounded border border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link to={`/ads/${bid.adId}`} className="font-medium text-purple-700 hover:underline dark:text-purple-400">
                {t("myBids.toAd")}
              </Link>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t(`bids.status.${bid.status}`)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{bid.amount} €</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
