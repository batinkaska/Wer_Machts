import {
  addDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PhoneVerificationModal } from "../components/auth/PhoneVerificationModal";
import { BidForm } from "../components/bids/BidForm";
import { BidList } from "../components/bids/BidList";
import { PhotoGallery } from "../components/ads/PhotoGallery";
import { ChatIcon, FlagIcon, HeartIcon, PinIcon, ShareIcon } from "../components/icons";
import { ReviewBox } from "../components/reviews/ReviewBox";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuth } from "../contexts/AuthContext";
import { adsCol, bidsCol, messagesCol, reportsCol, usersCol } from "../firebase/converters";
import { db } from "../firebase/config";
import { useAd } from "../hooks/useAd";
import { useAds } from "../hooks/useAds";
import { useBids } from "../hooks/useBids";
import { categoryLabels } from "../lib/categories";
import { useDateFormatter } from "../lib/useDateFormatter";
import { createNotification } from "../lib/notify";
import { republishAd } from "../lib/republishAd";
import { makeConversationId } from "../types/message";
import type { AppUser } from "../types/user";
import type { Bid } from "../types/bid";

function statusLabel(t: TFunction, status: string): string {
  return t(`adDetail.status.${status}`);
}

function priceLabel(t: TFunction, ad: { priceType: string; budget?: number; shipping?: boolean }): string {
  let label: string;
  if (ad.priceType === "gift") label = t("adForm.priceTypeGift");
  else if (ad.priceType === "on_request") label = t("common.priceOnRequest");
  else if (ad.priceType === "hourly")
    label = ad.budget ? `${ad.budget} € · ${t("adForm.priceTypeHourly")}` : t("adForm.priceTypeHourly");
  else if (ad.priceType === "negotiable")
    label = ad.budget ? `${ad.budget} € ${t("common.negotiableSuffix")}` : t("common.negotiableSuffix");
  else
    label = ad.budget
      ? `${ad.budget} € · ${t("adForm.priceTypeFixed")}`
      : t("adDetail.noPriceGiven");
  return ad.shipping ? `${label} ${t("common.plusShipping")}` : label;
}

export function AdDetailPage() {
  const { t } = useTranslation();
  const { formatDate } = useDateFormatter();
  const { adId } = useParams<{ adId: string }>();
  const { ad, loading } = useAd(adId);
  const { bids } = useBids(adId);
  const { firebaseUser, appUser, toggleFavorite, toggleFollow } = useAuth();
  const navigate = useNavigate();
  const { ads: sellerAds } = useAds({ ownerId: ad?.ownerId });

  const [owner, setOwner] = useState<AppUser | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [inlineMessage, setInlineMessage] = useState("");
  const [inlineMessageSent, setInlineMessageSent] = useState(false);
  const [inlineMessageSending, setInlineMessageSending] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    if (!ad) return;
    getDoc(doc(usersCol, ad.ownerId))
      .then((snap) => {
        if (snap.exists()) setOwner(snap.data());
      })
      .catch(() => {
        // Anonymous visitors can't read user profiles — the "Aktiv seit" line is skipped for them.
      });
  }, [ad]);

  if (loading) {
    return (
      <p className="mx-auto max-w-5xl px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </p>
    );
  }
  if (!ad) {
    return (
      <p className="mx-auto max-w-5xl px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("adDetail.notFound")}
      </p>
    );
  }

  const isOwner = firebaseUser?.uid === ad.ownerId;
  const myBid = bids.find((b) => b.providerId === firebaseUser?.uid);
  const acceptedBid = bids.find((b) => b.status === "accepted");
  const canReviewDeal = !!acceptedBid && (isOwner || myBid?.status === "accepted");
  const dealPartnerId = canReviewDeal ? (isOwner ? acceptedBid!.providerId : ad.ownerId) : undefined;
  const dealPartnerName = canReviewDeal
    ? isOwner
      ? acceptedBid!.providerName
      : ad.ownerName
    : undefined;
  const dealConversationId =
    canReviewDeal && firebaseUser && dealPartnerId
      ? makeConversationId(ad.id, firebaseUser.uid, dealPartnerId)
      : undefined;
  const isFavorite = appUser?.favoriteAdIds?.includes(ad.id) ?? false;
  const isFollowing = appUser?.followingIds?.includes(ad.ownerId) ?? false;

  async function handleBidSubmit(values: { amount: number; message?: string }) {
    if (!firebaseUser || !appUser || !ad) return;
    if (!appUser.phoneVerified) {
      setShowPhoneModal(true);
      throw new Error(t("phoneVerify.requiredError"));
    }
    const adRef = doc(adsCol, ad.id);
    const newBidRef = doc(bidsCol);
    await runTransaction(db, async (tx) => {
      tx.set(newBidRef, {
        adId: ad.id,
        adTitle: ad.title,
        providerId: firebaseUser.uid,
        providerName: appUser.displayName,
        amount: values.amount,
        ...(values.message ? { message: values.message } : {}),
        status: "pending",
        createdAt: serverTimestamp(),
      } as never);
      tx.update(adRef, { bidCount: ad.bidCount + 1, updatedAt: serverTimestamp() });
    });
    if (ad.ownerId !== firebaseUser.uid) {
      await createNotification({
        recipientId: ad.ownerId,
        type: "bid_placed",
        actorId: firebaseUser.uid,
        actorName: appUser.displayName,
        adId: ad.id,
        adTitle: ad.title,
      });
    }
  }

  async function handleAccept(bid: Bid) {
    if (ad!.adKind === "biete") {
      await updateDoc(doc(bidsCol, bid.id), { status: "accepted" });
      await updateDoc(doc(adsCol, ad!.id), { status: "in_progress", updatedAt: serverTimestamp() });
      if (firebaseUser && ad && bid.providerId !== firebaseUser.uid) {
        await createNotification({
          recipientId: bid.providerId,
          type: "bid_accepted",
          actorId: firebaseUser.uid,
          actorName: appUser?.displayName ?? ad.ownerName,
          adId: ad.id,
          adTitle: ad.title,
          bidId: bid.id,
        });
      }
    } else {
      navigate(`/ads/${ad!.id}/payment?bidId=${bid.id}`);
    }
  }

  async function handleReject(bid: Bid) {
    await updateDoc(doc(bidsCol, bid.id), { status: "rejected" });
    if (firebaseUser && ad && bid.providerId !== firebaseUser.uid) {
      await createNotification({
        recipientId: bid.providerId,
        type: "bid_rejected",
        actorId: firebaseUser.uid,
        actorName: appUser?.displayName ?? ad.ownerName,
        adId: ad.id,
        adTitle: ad.title,
      });
    }
  }

  async function handleSetOpen() {
    if (!ad) return;
    await republishAd(ad.id);
  }

  function goToConversation(otherUid: string) {
    if (!firebaseUser || !ad) return;
    const conversationId = makeConversationId(ad.id, firebaseUser.uid, otherUid);
    navigate(`/messages/${conversationId}`, { state: { adId: ad.id, otherUid } });
  }

  async function handleInlineMessageSend() {
    if (!firebaseUser || !ad || !inlineMessage.trim()) return;
    setInlineMessageSending(true);
    try {
      const conversationId = makeConversationId(ad.id, firebaseUser.uid, ad.ownerId);
      await addDoc(messagesCol, {
        conversationId,
        adId: ad.id,
        senderId: firebaseUser.uid,
        recipientId: ad.ownerId,
        participantIds: [firebaseUser.uid, ad.ownerId],
        text: inlineMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
      } as never);
      if (ad.ownerId !== firebaseUser.uid) {
        await createNotification({
          recipientId: ad.ownerId,
          type: "message",
          actorId: firebaseUser.uid,
          actorName: appUser?.displayName ?? "",
          adId: ad.id,
          adTitle: ad.title,
          conversationId,
        });
      }
      setInlineMessageSent(true);
    } finally {
      setInlineMessageSending(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: ad!.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareFeedback(t("adDetail.linkCopied"));
        setTimeout(() => setShareFeedback(null), 2000);
      }
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  }

  async function handleSubmitReport() {
    if (!firebaseUser || !ad) return;
    setReportSubmitting(true);
    try {
      await addDoc(reportsCol, {
        adId: ad.id,
        reporterId: firebaseUser.uid,
        reason: reportReason,
        createdAt: serverTimestamp(),
      } as never);
      setReportSubmitted(true);
    } finally {
      setReportSubmitting(false);
    }
  }

  const otherSellerAdsCount = sellerAds.filter((a) => a.id !== ad.id).length;

  return (
    <>
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div>
          {isOwner && ad.status === "draft" && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("adDetail.draftNotice")}</p>
              <button
                type="button"
                onClick={handleSetOpen}
                className="shrink-0 rounded-full bg-[#5fac5e] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
              >
                {t("adDetail.publish")}
              </button>
            </div>
          )}
          {ad.status === "in_progress" && acceptedBid && (isOwner || myBid?.status === "accepted") && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-[#5fac5e] bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
              <p className="text-sm font-medium text-[#4d9a4c]">{t("adDetail.dealReachedNotice")}</p>
              <Link
                to={`/ads/${ad.id}/payment?bidId=${acceptedBid.id}`}
                className="shrink-0 rounded-full bg-[#5fac5e] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
              >
                {t("adDetail.goToPayment")}
              </Link>
            </div>
          )}
          {ad.status === "closed" && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{t("adDetail.closedNotice")}</p>
              {isOwner && (
                <button
                  type="button"
                  onClick={handleSetOpen}
                  className="shrink-0 rounded-full border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  {t("adDetail.reopen")}
                </button>
              )}
            </div>
          )}
          <PhotoGallery photoUrls={ad.photoUrls} alt={ad.title} />

          <div className="mt-6 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                ad.adKind === "biete"
                  ? "bg-green-50 text-[#4d9a4c] dark:bg-green-950"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
              }`}
            >
              {ad.adKind === "biete" ? t("common.offering") : t("common.seeking")}
            </span>
            {ad.status === "draft" && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {t("common.draft")}
              </span>
            )}
            {ad.status === "closed" && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                {t("adDetail.status.closed")}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{ad.title}</h1>
          <p className="mt-1 text-xl font-bold text-[#5fac5e]">{priceLabel(t, ad)}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <PinIcon className="h-4 w-4" />
              {ad.postalCode} {ad.city}
              {ad.showFullAddress && ad.street ? `, ${ad.street}` : ""}
            </span>
            <span>{formatDate(ad.createdAt)}</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-y border-gray-200 py-3 text-sm dark:border-gray-700">
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("adDetail.category")}</span>
              <p className="text-gray-900 dark:text-gray-100">{categoryLabels(t, ad.categories)}</p>
              {ad.categoryNote && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {t("categoryPicker.sonstigesPrefix")}: {ad.categoryNote}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-500 dark:text-gray-400">{t("adDetail.statusLabel")}</span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{statusLabel(t, ad.status)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">{t("adDetail.description")}</h2>
            <hr className="mb-3 border-gray-200 dark:border-gray-700" />
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{ad.description}</p>
          </div>

          {dealConversationId && dealPartnerId && (
            <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                {t("reviews.sectionTitle")}
              </h2>
              <ReviewBox
                conversationId={dealConversationId}
                adId={ad.id}
                revieweeId={dealPartnerId}
                revieweeName={dealPartnerName ?? ""}
              />
            </div>
          )}

          {firebaseUser && !isOwner && (
            <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">{t("adDetail.writeMessage")}</h2>
              {inlineMessageSent ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("adDetail.messageSent")}</p>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={inlineMessage}
                    onChange={(e) => setInlineMessage(e.target.value)}
                    placeholder={t("adDetail.messagePlaceholder", { name: ad.ownerName })}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleInlineMessageSend}
                    disabled={inlineMessageSending || !inlineMessage.trim()}
                    className="rounded bg-[#5fac5e] px-4 py-2 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
                  >
                    {inlineMessageSending ? t("adDetail.sending") : t("common.sendMessage")}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("adDetail.offersCount", { count: bids.length })}
            </h2>
            <BidList bids={bids} isOwner={isOwner} onAccept={handleAccept} onReject={handleReject} />
          </div>

          {!isOwner && !myBid && (
            <div className="mt-6">
              <BidForm onSubmit={handleBidSubmit} submitting={false} />
            </div>
          )}

          {firebaseUser && isOwner && bids.length > 0 && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t("adDetail.chatHint")}</p>
          )}

          {firebaseUser && isOwner &&
            bids.map((bid) => (
              <button
                key={bid.id}
                type="button"
                onClick={() => goToConversation(bid.providerId)}
                className="mt-2 mr-2 rounded border border-gray-300 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                {t("adDetail.chatWith", { name: bid.providerName })}
              </button>
            ))}

          {owner?.accountType === "business" && (
            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
              <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                {t("adDetail.legalInfoHeading")}
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {owner.businessName && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t("adDetail.businessNameLabel")}
                    </p>
                    <p>{owner.businessName}</p>
                  </div>
                )}
                {owner.impressum && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t("adDetail.impressumHeading")}
                    </p>
                    <p className="whitespace-pre-wrap">{owner.impressum}</p>
                  </div>
                )}
                {owner.taxId && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t("adDetail.taxIdLabel")}</p>
                    <p>{owner.taxId}</p>
                  </div>
                )}
                {owner.withdrawalPolicy && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t("adDetail.withdrawalPolicyHeading")}
                    </p>
                    <p className="whitespace-pre-wrap">{owner.withdrawalPolicy}</p>
                  </div>
                )}
                {owner.businessTerms && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t("adDetail.businessTermsHeading")}
                    </p>
                    <p className="whitespace-pre-wrap">{owner.businessTerms}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {firebaseUser && !isOwner && (
            <button
              type="button"
              onClick={() => goToConversation(ad.ownerId)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5fac5e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
            >
              <ChatIcon className="h-4 w-4" />
              {t("common.sendMessage")}
            </button>
          )}

          {firebaseUser && (
            <button
              type="button"
              onClick={() => toggleFavorite(ad.id)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <HeartIcon className="h-4 w-4" />
              {isFavorite ? t("common.saved") : t("common.addToFavorites")}
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ShareIcon className="h-4 w-4" />
            {shareFeedback ?? t("adDetail.shareAd")}
          </button>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <Link to={`/profile/${ad.ownerId}`} className="flex items-center gap-3 hover:underline">
              {owner?.photoURL ? (
                <img
                  src={owner.photoURL}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {ad.ownerName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-gray-900 dark:text-gray-100">{ad.ownerName}</span>
                {owner?.emailVerified && <VerifiedBadge label={t("verifiedBadges.email")} />}
                {owner?.phoneVerified && <VerifiedBadge label={t("verifiedBadges.phone")} />}
                {owner?.accountType === "business" && <VerifiedBadge label={t("verifiedBadges.business")} />}
              </span>
            </Link>
            {owner && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {t("adDetail.activeSince", { date: formatDate(owner.createdAt) })}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("adDetail.otherAdsCount", { count: otherSellerAdsCount })}
              </span>
              {firebaseUser && !isOwner && (
                <button
                  type="button"
                  onClick={() => toggleFollow(ad.ownerId)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {isFollowing ? t("common.unfollow") : t("common.follow")}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("adDetail.adId")}</span>
              <span className="text-gray-900 dark:text-gray-100">{ad.id}</span>
            </div>
          </div>

          {firebaseUser && !isOwner && (
            <div className="pt-2 text-center">
              {reportSubmitted ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("adDetail.reportSubmitted")}</p>
              ) : reportOpen ? (
                <div className="space-y-2 rounded-lg border border-gray-200 p-3 text-left dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="report-reason">
                    {t("adDetail.reportReasonLabel")}
                  </label>
                  <textarea
                    id="report-reason"
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    disabled={reportSubmitting}
                    className="w-full rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                  >
                    {reportSubmitting ? t("adDetail.sending") : t("adDetail.sendReport")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FlagIcon className="h-4 w-4" />
                  {t("adDetail.reportAd")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    {showPhoneModal && (
      <PhoneVerificationModal
        reasonText={t("phoneVerify.bidReason")}
        onClose={() => setShowPhoneModal(false)}
        onVerified={() => setShowPhoneModal(false)}
      />
    )}
    </>
  );
}
