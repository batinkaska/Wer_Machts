import { arrayUnion, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { adsCol, bidsCol } from "../firebase/converters";
import { functions } from "../firebase/config";
import { useAds } from "../hooks/useAds";
import { useBidsForAds } from "../hooks/useBidsForAds";
import { useMyBids } from "../hooks/useBids";
import type { Bid } from "../types/bid";

const cancelDealFn = httpsCallable(functions, "cancelDeal");

function ConfirmActionButton({
  label,
  confirmText,
  variant = "danger",
  onConfirm,
}: {
  label: string;
  confirmText: string;
  variant?: "danger" | "neutral";
  onConfirm: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const triggerClass =
    variant === "danger"
      ? "rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-950"
      : "rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800";
  const confirmClass =
    variant === "danger"
      ? "rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      : "rounded-full bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50";

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs font-medium text-red-600 dark:text-red-400">{confirmText}</span>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
          }}
          className={confirmClass}
        >
          {label}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {t("common.cancel")}
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className={triggerClass}>
      {label}
    </button>
  );
}

function GivenBidRow({ bid, onDelete }: { bid: Bid; onDelete: (bid: Bid) => Promise<void> }) {
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
      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{bid.amount} €</p>
      {bid.status !== "accepted" && (
        <div className="mt-2 flex justify-end">
          <ConfirmActionButton
            label={bid.status === "pending" ? t("myBids.withdraw") : t("myBids.deleteBid")}
            confirmText={bid.status === "pending" ? t("myBids.withdrawConfirm") : t("myBids.deleteConfirm")}
            onConfirm={() => onDelete(bid)}
          />
        </div>
      )}
    </li>
  );
}

function SettledDealRow({ bid, onHide }: { bid: Bid; onHide: (bid: Bid) => Promise<void> }) {
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
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-[#4d9a4c] dark:bg-green-950 dark:text-green-400">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          {t("myBids.settled")}
        </span>
        <ConfirmActionButton
          label={t("myBids.hideDeal")}
          confirmText={t("myBids.hideDealConfirm")}
          variant="neutral"
          onConfirm={() => onHide(bid)}
        />
      </div>
    </li>
  );
}

function PendingPaymentRow({
  bid,
  isPayer,
  onCancel,
}: {
  bid: Bid;
  isPayer: boolean;
  onCancel: (bid: Bid) => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <li className="rounded border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            to={`/ads/${bid.adId}`}
            className="font-medium text-purple-700 hover:underline dark:text-purple-400"
          >
            {bid.adTitle ?? t("myBids.toAd")}
          </Link>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{bid.amount} €</p>
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            {isPayer ? t("myBids.paymentPendingPayer") : t("myBids.paymentPendingRecipient")}
          </p>
        </div>
        {isPayer ? (
          <Link
            to={`/ads/${bid.adId}/payment?bidId=${bid.id}`}
            className="shrink-0 rounded-full bg-[#5fac5e] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
          >
            {t("adDetail.goToPayment")}
          </Link>
        ) : (
          <Link
            to={`/ads/${bid.adId}/payment?bidId=${bid.id}`}
            className="shrink-0 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t("myBids.enterBankDetails")}
          </Link>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <ConfirmActionButton
          label={t("myBids.cancelDeal")}
          confirmText={t("myBids.cancelDealConfirm")}
          onConfirm={() => onCancel(bid)}
        />
      </div>
    </li>
  );
}

function ReceivedBidRow({
  bid,
  onAccept,
  onReject,
  onDelete,
}: {
  bid: Bid;
  onAccept: (bid: Bid) => void;
  onReject: (bid: Bid) => void;
  onDelete: (bid: Bid) => Promise<void>;
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
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-2">
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
        <ConfirmActionButton
          label={t("myBids.deleteBid")}
          confirmText={t("myBids.deleteConfirm")}
          onConfirm={() => onDelete(bid)}
        />
      </div>
    </li>
  );
}

export function MyBidsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { bids: givenBids, loading: givenLoading } = useMyBids(firebaseUser?.uid);
  const { ads: myAds } = useAds({ ownerId: firebaseUser?.uid, includeDrafts: true });
  const myAdIds = useMemo(() => myAds.map((a) => a.id), [myAds]);
  const adKindById = useMemo(() => new Map(myAds.map((a) => [a.id, a.adKind])), [myAds]);
  const { bids: bidsOnMyAds, loading: receivedLoading } = useBidsForAds(myAdIds);
  const receivedBids = bidsOnMyAds.filter(
    (bid) => bid.status === "pending" && bid.providerId !== firebaseUser?.uid,
  );
  const isDealSettled = (bid: Bid) =>
    bid.status === "accepted" &&
    (bid.paymentMethod === "cash" || (bid.paymentMethod === "card" && bid.paymentStatus === "paid"));
  const isHiddenByMe = (bid: Bid) => !!firebaseUser && (bid.hiddenForUserIds ?? []).includes(firebaseUser.uid);
  const visibleGivenBids = givenBids.filter((bid) => !isDealSettled(bid));

  // For bids I submitted (givenBids), I'm the payer on "biete" ads (I hired the ad owner)
  // and the recipient on "suche" ads (the ad owner hired me).
  const givenDeals = givenBids
    .filter((bid) => bid.status === "accepted")
    .map((bid) => ({ bid, isPayer: bid.adKind === "biete" }));
  // For bids on my own ads (bidsOnMyAds), I'm the recipient on "biete" ads (someone hired me)
  // and the payer on "suche" ads (I hired the bidder).
  const receivedDeals = bidsOnMyAds
    .filter((bid) => bid.status === "accepted" && bid.providerId !== firebaseUser?.uid)
    .map((bid) => ({ bid, isPayer: adKindById.get(bid.adId) === "suche" }));
  const allDeals = [...givenDeals, ...receivedDeals];
  const settledDeals = allDeals.filter((d) => isDealSettled(d.bid) && !isHiddenByMe(d.bid));
  const pendingPaymentDeals = allDeals.filter((d) => !isDealSettled(d.bid));

  async function handleAccept(bid: Bid) {
    if (!firebaseUser) return;
    if (adKindById.get(bid.adId) === "biete") {
      await updateDoc(doc(bidsCol, bid.id), { status: "accepted" });
      await updateDoc(doc(adsCol, bid.adId), { status: "in_progress", updatedAt: serverTimestamp() });
      // The bid_accepted notification is created server-side by onBidWritten.
    } else {
      navigate(`/ads/${bid.adId}/payment?bidId=${bid.id}`);
    }
  }

  async function handleReject(bid: Bid) {
    if (!firebaseUser) return;
    await updateDoc(doc(bidsCol, bid.id), { status: "rejected" });
    // The bid_rejected notification is created server-side by onBidWritten.
  }

  async function handleDeleteBid(bid: Bid) {
    await deleteDoc(doc(bidsCol, bid.id));
  }

  async function handleCancelDeal(bid: Bid) {
    await cancelDealFn({ bidId: bid.id });
  }

  async function handleHideDeal(bid: Bid) {
    if (!firebaseUser) return;
    await updateDoc(doc(bidsCol, bid.id), { hiddenForUserIds: arrayUnion(firebaseUser.uid) });
  }

  const loading = givenLoading || receivedLoading;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6">
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
                  <ReceivedBidRow
                    key={bid.id}
                    bid={bid}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onDelete={handleDeleteBid}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("myBids.receivedEmpty")}</p>
            )}
          </section>

          {pendingPaymentDeals.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                {t("myBids.pendingPaymentHeading")}
              </h2>
              <ul className="space-y-3">
                {pendingPaymentDeals.map(({ bid, isPayer }) => (
                  <PendingPaymentRow key={bid.id} bid={bid} isPayer={isPayer} onCancel={handleCancelDeal} />
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("myBids.completedHeading")}
            </h2>
            {settledDeals.length > 0 ? (
              <ul className="space-y-3">
                {settledDeals.map(({ bid }) => (
                  <SettledDealRow key={bid.id} bid={bid} onHide={handleHideDeal} />
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
                  <GivenBidRow key={bid.id} bid={bid} onDelete={handleDeleteBid} />
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
