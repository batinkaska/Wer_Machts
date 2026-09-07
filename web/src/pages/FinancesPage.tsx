import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAds } from "../hooks/useAds";
import { useBidsForAds } from "../hooks/useBidsForAds";
import { useMyBids } from "../hooks/useBids";
import { useDateFormatter } from "../lib/useDateFormatter";

export function FinancesPage() {
  const { t } = useTranslation();
  const { formatDate } = useDateFormatter();
  const { firebaseUser } = useAuth();

  const { bids: myBids, loading: myBidsLoading } = useMyBids(firebaseUser?.uid);
  const { ads: myAds, loading: myAdsLoading } = useAds({
    ownerId: firebaseUser?.uid,
    includeDrafts: true,
  });
  const myAdIds = useMemo(() => myAds.map((a) => a.id), [myAds]);
  const { bids: bidsOnMyAds, loading: bidsOnMyAdsLoading } = useBidsForAds(myAdIds);

  const loading = myBidsLoading || myAdsLoading || bidsOnMyAdsLoading;

  const income = myBids.filter((b) => b.status === "accepted");
  const expenses = bidsOnMyAds.filter(
    (b) => b.status === "accepted" && b.providerId !== firebaseUser?.uid,
  );
  const adTitleById = useMemo(() => new Map(myAds.map((a) => [a.id, a.title])), [myAds]);

  const totalIncome = income.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, b) => sum + b.amount, 0);
  const balance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("finances.pageTitle")}</h1>

      <div className="rounded-lg border border-gray-200 p-5 text-center dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("finances.balance")}</p>
        <p
          className={`mt-1 text-3xl font-bold ${
            balance >= 0 ? "text-[#4d9a4c]" : "text-red-600 dark:text-red-400"
          }`}
        >
          {balance >= 0 ? "+" : "-"}
          {Math.abs(balance).toFixed(2)} €
        </p>
        <div className="mt-3 flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <span>{t("finances.totalIncome", { amount: totalIncome.toFixed(2) })}</span>
          <span>{t("finances.totalExpenses", { amount: totalExpenses.toFixed(2) })}</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">{t("finances.incomeHeading")}</h2>
        <hr className="mb-3 border-gray-200 dark:border-gray-700" />
        {income.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("finances.noIncome")}</p>
        ) : (
          <ul className="space-y-2">
            {income.map((bid) => (
              <li
                key={bid.id}
                className="flex items-center justify-between gap-3 rounded border border-gray-200 px-4 py-3 dark:border-gray-700"
              >
                <div className="min-w-0">
                  <Link
                    to={`/ads/${bid.adId}`}
                    className="truncate font-medium text-gray-900 hover:underline dark:text-gray-100"
                  >
                    {bid.adTitle ?? t("finances.unknownAd")}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(bid.createdAt)}</p>
                </div>
                <span className="shrink-0 font-semibold text-[#4d9a4c]">
                  +{bid.amount.toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">{t("finances.expensesHeading")}</h2>
        <hr className="mb-3 border-gray-200 dark:border-gray-700" />
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("finances.noExpenses")}</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((bid) => (
              <li
                key={bid.id}
                className="flex items-center justify-between gap-3 rounded border border-gray-200 px-4 py-3 dark:border-gray-700"
              >
                <div className="min-w-0">
                  <Link
                    to={`/ads/${bid.adId}`}
                    className="truncate font-medium text-gray-900 hover:underline dark:text-gray-100"
                  >
                    {adTitleById.get(bid.adId) ?? bid.adTitle ?? t("finances.unknownAd")}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("finances.paidTo", { name: bid.providerName })} · {formatDate(bid.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-red-600 dark:text-red-400">
                  -{bid.amount.toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
