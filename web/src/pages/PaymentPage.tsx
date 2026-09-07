import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { bidsCol } from "../firebase/converters";
import { useAd } from "../hooks/useAd";
import type { Bid, PaymentMethod } from "../types/bid";

export function PaymentPage() {
  const { t } = useTranslation();
  const { adId } = useParams<{ adId: string }>();
  const [searchParams] = useSearchParams();
  const bidId = searchParams.get("bidId");
  const { firebaseUser } = useAuth();
  const { ad, loading: adLoading } = useAd(adId);

  const [bid, setBid] = useState<Bid | null>(null);
  const [bidLoading, setBidLoading] = useState(true);
  const [saving, setSaving] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!bidId) {
      setBidLoading(false);
      return;
    }
    return onSnapshot(doc(bidsCol, bidId), (snap) => {
      setBid(snap.exists() ? snap.data() : null);
      setBidLoading(false);
    });
  }, [bidId]);

  async function choosePaymentMethod(method: PaymentMethod) {
    if (!bidId) return;
    setSaving(method);
    try {
      await updateDoc(doc(bidsCol, bidId), { paymentMethod: method });
    } finally {
      setSaving(null);
    }
  }

  if (adLoading || bidLoading) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </p>
    );
  }

  if (!ad || !bid) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("payment.notFound")}
      </p>
    );
  }

  const isParticipant =
    !!firebaseUser && (firebaseUser.uid === ad.ownerId || firebaseUser.uid === bid.providerId);

  if (!isParticipant) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("payment.notAuthorized")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {t("payment.pageTitle")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{ad.title}</p>
      <p className="mt-1 text-xl font-bold text-[#5fac5e]">{bid.amount} €</p>

      <div className="mt-6 rounded-lg border border-gray-200 p-5 dark:border-gray-700">
        {bid.paymentMethod ? (
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("payment.chosen", { method: t(`payment.method.${bid.paymentMethod}`) })}
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("payment.chooseMethod")}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => choosePaymentMethod("card")}
                disabled={saving !== null}
                className="flex-1 rounded-full bg-[#5fac5e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
              >
                {saving === "card" ? t("adDetail.sending") : t("payment.method.card")}
              </button>
              <button
                type="button"
                onClick={() => choosePaymentMethod("cash")}
                disabled={saving !== null}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {saving === "cash" ? t("adDetail.sending") : t("payment.method.cash")}
              </button>
            </div>
          </>
        )}
      </div>

      <Link
        to={`/ads/${adId}`}
        className="mt-4 inline-block text-sm text-[#5fac5e] hover:underline"
      >
        {t("payment.backToAd")}
      </Link>
    </div>
  );
}
