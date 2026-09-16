import type { MouseEvent } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { categoryLabels } from "../../lib/categories";
import type { Ad } from "../../types/ad";

export function priceLabel(t: TFunction, ad: Ad): string {
  let label: string;
  if (ad.priceType === "gift") label = t("adForm.priceTypeGift");
  else if (ad.priceType === "on_request") label = t("common.priceOnRequest");
  else if (ad.priceType === "hourly")
    label = ad.budget ? `${ad.budget} € · ${t("adForm.priceTypeHourly")}` : t("adForm.priceTypeHourly");
  else if (ad.priceType === "negotiable")
    label = ad.budget ? `${ad.budget} € ${t("common.negotiableSuffix")}` : t("common.negotiableSuffix");
  else label = ad.budget ? `${ad.budget} € · ${t("adForm.priceTypeFixed")}` : t("adForm.priceTypeFixed");
  return ad.shipping ? `${label} ${t("common.plusShipping")}` : label;
}

export function AdCard({ ad }: { ad: Ad }) {
  const { t } = useTranslation();
  const { firebaseUser, appUser, toggleFavorite } = useAuth();
  const isFavorite = appUser?.favoriteAdIds?.includes(ad.id) ?? false;

  function handleFavoriteClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(ad.id);
  }

  return (
    <Link
      to={`/ads/${ad.id}`}
      className="relative block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      {firebaseUser && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? t("common.removeFromFavorites") : t("common.addToFavorites")}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg shadow hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900"
        >
          {isFavorite ? "★" : "☆"}
        </button>
      )}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700">
        {ad.photoUrls[0] && (
          <img
            src={ad.photoUrls[0]}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="line-clamp-1 text-xs font-medium text-purple-700 dark:text-purple-400">
              {categoryLabels(t, ad.categories)}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                ad.adKind === "biete"
                  ? "bg-green-50 text-[#4d9a4c] dark:bg-green-950"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
              }`}
            >
              {ad.adKind === "biete" ? t("common.offering") : t("common.seeking")}
            </span>
            {ad.status === "draft" && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {t("common.draft")}
              </span>
            )}
            {ad.status === "closed" && (
              <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                {t("adDetail.status.closed")}
              </span>
            )}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{ad.city}</span>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ad.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{ad.description}</p>
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{priceLabel(t, ad)}</p>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{t("common.bidCount", { count: ad.bidCount })}</span>
        </div>
      </div>
    </Link>
  );
}
