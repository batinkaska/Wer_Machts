import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AdCard } from "../components/ads/AdCard";
import { TrashIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { adsCol } from "../firebase/converters";
import { useAds } from "../hooks/useAds";
import type { Ad, AdStatus } from "../types/ad";

function AdActions({
  ad,
  onSetStatus,
  onDelete,
}: {
  ad: Ad;
  onSetStatus: (adId: string, status: AdStatus) => void;
  onDelete: (adId: string) => void;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
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
  const { firebaseUser } = useAuth();
  const { ads, loading } = useAds({ ownerId: firebaseUser?.uid, includeDrafts: true });

  async function handleSetStatus(adId: string, status: AdStatus) {
    await updateDoc(doc(adsCol, adId), { status, updatedAt: serverTimestamp() });
  }

  async function handleDelete(adId: string) {
    await deleteDoc(doc(adsCol, adId));
  }

  const activeAds = ads.filter((a) => a.status === "open");
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

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
      ) : ads.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{t("adList.emptyDefault")}</p>
      ) : (
        <div className="space-y-8">
          {groups.map(
            (group) =>
              group.items.length > 0 && (
                <section key={group.heading}>
                  <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">{group.heading}</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((ad) => (
                      <div key={ad.id} className="space-y-2">
                        <AdCard ad={ad} />
                        <AdActions ad={ad} onSetStatus={handleSetStatus} onDelete={handleDelete} />
                      </div>
                    ))}
                  </div>
                </section>
              ),
          )}
        </div>
      )}
    </div>
  );
}
