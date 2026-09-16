import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AdCard } from "../components/ads/AdCard";
import { TrashIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { adsCol } from "../firebase/converters";
import { functions } from "../firebase/config";
import { useAds } from "../hooks/useAds";
import { friendlyErrorMessage } from "../lib/friendlyError";
import { republishAd } from "../lib/republishAd";
import type { Ad, AdStatus } from "../types/ad";

const setFeaturedAdFn = httpsCallable(functions, "setFeaturedAd");

function AdActions({
  ad,
  isPro,
  featuredAdId,
  onSetStatus,
  onDelete,
  onSetFeatured,
}: {
  ad: Ad;
  isPro: boolean;
  featuredAdId: string | null | undefined;
  onSetStatus: (adId: string, status: AdStatus) => void;
  onDelete: (adId: string) => void;
  onSetFeatured: (adId: string | null) => void;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const isFeatured = featuredAdId === ad.id;
  const buttonClass =
    "rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800";
  const publishClass =
    "rounded-full bg-[#5fac5e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4d9a4c]";

  const statusButtons = (() => {
    if (ad.status === "open") {
      return (
        <>
          <button type="button" className={buttonClass} onClick={() => onSetStatus(ad.id, "in_progress")}>
            {t("myAds.reserve")}
          </button>
          <button type="button" className={buttonClass} onClick={() => onSetStatus(ad.id, "closed")}>
            {t("myAds.close")}
          </button>
        </>
      );
    }
    if (ad.status === "in_progress") {
      return (
        <button type="button" className={buttonClass} onClick={() => onSetStatus(ad.id, "closed")}>
          {t("myAds.close")}
        </button>
      );
    }
    if (ad.status === "closed") {
      return (
        <button type="button" className={publishClass} onClick={() => onSetStatus(ad.id, "open")}>
          {t("myAds.reopen")}
        </button>
      );
    }
    return (
      <button type="button" className={publishClass} onClick={() => onSetStatus(ad.id, "open")}>
        {t("adDetail.publish")}
      </button>
    );
  })();

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-red-600 dark:text-red-400">{t("myAds.deleteConfirm")}</span>
        <button
          type="button"
          onClick={() => onDelete(ad.id)}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          {t("settings.deletePermanently")}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className={buttonClass}>
          {t("common.cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statusButtons}
      {ad.status === "open" &&
        (isPro ? (
          <button
            type="button"
            onClick={() => onSetFeatured(isFeatured ? null : ad.id)}
            className={
              isFeatured
                ? "rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                : buttonClass
            }
          >
            {isFeatured ? t("pro.unfeatureAd") : t("pro.featureAd")}
          </button>
        ) : (
          <Link
            to="/settings"
            className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-gray-800"
            title={t("pro.featureRequiresPro")}
          >
            {t("pro.featureAd")}
          </Link>
        ))}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-950"
      >
        <TrashIcon className="h-3.5 w-3.5" />
        {t("myAds.deleteAd")}
      </button>
    </div>
  );
}

export function MyAdsPage() {
  const { t } = useTranslation();
  const { firebaseUser, appUser, refreshAppUser } = useAuth();
  const { ads, loading } = useAds({ ownerId: firebaseUser?.uid, includeDrafts: true });
  const [featureError, setFeatureError] = useState<string | null>(null);

  const activeAds = ads.filter((a) => a.status === "open");

  async function handleSetStatus(adId: string, status: AdStatus) {
    if (status === "open") {
      if (!appUser?.isPro && activeAds.length >= 3) {
        setFeatureError(t("adForm.errorOpenAdCapReached"));
        return;
      }
      await republishAd(adId);
    } else {
      await updateDoc(doc(adsCol, adId), { status, updatedAt: serverTimestamp() });
    }
  }

  async function handleDelete(adId: string) {
    await deleteDoc(doc(adsCol, adId));
  }

  async function handleSetFeatured(adId: string | null) {
    setFeatureError(null);
    try {
      await setFeaturedAdFn({ adId });
      await refreshAppUser();
    } catch (err) {
      setFeatureError(friendlyErrorMessage(err, t, "adForm.errorSaveFailed"));
    }
  }
  const reservedAds = ads.filter((a) => a.status === "in_progress");
  const inactiveAds = ads.filter((a) => a.status === "draft" || a.status === "closed");

  const groups: { heading: string; items: Ad[] }[] = [
    { heading: t("myAds.activeHeading"), items: activeAds },
    { heading: t("myAds.reservedHeading"), items: reservedAds },
    { heading: t("myAds.draftsHeading"), items: inactiveAds },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("myAds.pageTitle")}</h1>
        <Link
          to="/ads/new"
          className="rounded bg-purple-700 px-4 py-2 text-sm text-white hover:bg-purple-800"
        >
          {t("myAds.newAd")}
        </Link>
      </div>

      {featureError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{featureError}</p>
      )}

      {!appUser?.isPro && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("pro.myAdsCapNotice", { count: activeAds.length })}
          </p>
          <Link
            to="/settings"
            className="shrink-0 rounded-full bg-[#5fac5e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4d9a4c]"
          >
            {t("pro.upgradeCta")}
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.heading}>
              <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">{group.heading}</h2>
              {group.items.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((ad) => (
                    <div key={ad.id} className="space-y-2">
                      <AdCard ad={ad} />
                      <AdActions
                        ad={ad}
                        isPro={!!appUser?.isPro}
                        featuredAdId={appUser?.featuredAdId}
                        onSetStatus={handleSetStatus}
                        onDelete={handleDelete}
                        onSetFeatured={handleSetFeatured}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("myAds.emptyGroup")}</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
