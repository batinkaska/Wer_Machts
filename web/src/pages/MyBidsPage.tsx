import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adsCol, bidsCol } from "../firebase/converters";
import { useAds } from "../hooks/useAds";
import { useBidsForAds } from "../hooks/useBidsForAds";
import { useMyBids } from "../hooks/useBids";
import { createNotification } from "../lib/notify";
import type { Bid } from "../types/bid";

function GivenBidRow({ bid }: { bid: Bid }) {
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

function CompletedDealRow({ bid }: { bid: Bid }) {
  const { t } = useTranslation();

  return (
    <li className="flex items-center justify-between gap-3 rounded border border-gray-200 p-3 dark:border-gray-700">
      <div>
        <Link
          to={`/ads/${bid.adId}`}
          className="font-medium text-purple-700 hover:underline dark:text-purple-400"
        >
          {bid.adTitle ?? t("myBids.toAd")}
        </Link>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{bid.amount} €</p>
      </div>
      <Link
        to={`/ads/${bid.adId}/payment?bidId=${bid.id}`}
        className="shrink-0 rounded-full bg-[#5fac5e] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
      >
        {t("adDetail.goToPayment")}
      </Link>
    </li>
  );
}

function ReceivedBidRow({
  bid,
  onAccept,
  onReject,
}: {
  bid: Bid;
  onAccept: (bid: Bid) => void;
  onReject: (bid: Bid) => void;
}) {
  const { t } = useTranslation();

  return (
    <li className="rounded border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/ads/${bid.adId}`}
          className="font-medium text-purple-700 hover:underline dark:text-purple-400"
        >
          {bid.adTitle ?? t("myBids.toAd")}
        </Link>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t(`bids.status.${bid.status}`)}</span>
      </div>
      <Link
        to={`/profile/${bid.providerId}`}
        className="mt-1 inline-block text-sm text-gray-700 hover:underline dark:text-gray-300"
      >
        {bid.providerName}
      </Link>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{bid.amount} €</p>
      {bid.message && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{bid.message}</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onAccept(bid)}
          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
        >
          {t("bids.accept")}
        </button>
        <button
          type="button"
          onClick={() => onReject(bid)}
          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
        >
          {t("bids.reject")}
        </button>
      </div>
    </li>
  );
}

export function MyBidsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { firebaseUser, appUser } = useAuth();
  const { bids: givenBids, loading: givenLoading } = useMyBids(firebaseUser?.uid);
  const { ads: myAds } = useAds({ ownerId: firebaseUser?.uid, includeDrafts: true });
  const myAdIds = useMemo(() => myAds.map((a) => a.id), [myAds]);
  const adKindById = useMemo(() => new Map(myAds.map((a) => [a.id, a.adKind])), [myAds]);
  const { bids: bidsOnMyAds, loading: receivedLoading } = useBidsForAds(myAdIds);
  const receivedBids = bidsOnMyAds.filter(
    (bid) => bid.status === "pending" && bid.providerId !== firebaseUser?.uid,
  );
  const completedDeals = [
    ...givenBids.filter((bid) => bid.status === "accepted"),
    ...bidsOnMyAds.filter((bid) => bid.status === "accepted" && bid.providerId !== firebaseUser?.uid),
  ];
  const isDealSettled = (bid: Bid) =>
    bid.status === "accepted" &&
    (bid.paymentMethod === "cash" || (bid.paymentMethod === "card" && bid.paymentStatus === "paid"));
  const visibleGivenBids = givenBids.filter((bid) => !isDealSettled(bid));

  async function handleAccept(bid: Bid) {
    if (!firebaseUser) return;
    if (adKindById.get(bid.adId) === "biete") {
      await updateDoc(doc(bidsCol, bid.id), { status: "accepted" });
      await updateDoc(doc(adsCol, bid.adId), { status: "in_progress", updatedAt: serverTimestamp() });
      await createNotification({
        recipientId: bid.providerId,
        type: "bid_accepted",
        actorId: firebaseUser.uid,
        actorName: appUser?.displayName ?? "",
        adId: bid.adId,
        adTitle: bid.adTitle ?? "",
        bidId: bid.id,
      });
    } else {
      navigate(`/ads/${bid.adId}/payment?bidId=${bid.id}`);
    }
  }

  async function handleReject(bid: Bid) {
    if (!firebaseUser) return;
    await updateDoc(doc(bidsCol, bid.id), { status: "rejected" });
    await createNotification({
      recipientId: bid.providerId,
      type: "bid_rejected",
      actorId: firebaseUser.uid,
      actorName: appUser?.displayName ?? "",
      adId: bid.adId,
      adTitle: bid.adTitle ?? "",
    });
  }

  const loading = givenLoading || receivedLoading;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("myBids.pageTitle")}</h1>
      {loading && <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}
      {!loading && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("myBids.receivedHeading")}
            </h2>
            {receivedBids.length > 0 ? (
              <ul className="space-y-3">
                {receivedBids.map((bid) => (
                  <ReceivedBidRow key={bid.id} bid={bid} onAccept={handleAccept} onReject={handleReject} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("myBids.receivedEmpty")}</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("myBids.completedHeading")}
            </h2>
            {completedDeals.length > 0 ? (
              <ul className="space-y-3">
                {completedDeals.map((bid) => (
                  <CompletedDealRow key={bid.id} bid={bid} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("myBids.completedEmpty")}</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("myBids.givenHeading")}
            </h2>
            {visibleGivenBids.length > 0 ? (
              <ul className="space-y-3">
                {visibleGivenBids.map((bid) => (
                  <GivenBidRow key={bid.id} bid={bid} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("myBids.empty")}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
