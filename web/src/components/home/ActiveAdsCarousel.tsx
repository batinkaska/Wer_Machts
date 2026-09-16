import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { priceLabel } from "../ads/AdCard";
import { ChevronRightIcon } from "../icons";
import { useAds } from "../../hooks/useAds";
import type { Ad } from "../../types/ad";

const PAGE_SIZE = 4;
const MAX_ADS = 12;

function CompactAdCard({ ad }: { ad: Ad }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/ads/${ad.id}`}
      className="block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="aspect-video bg-gray-100 dark:bg-gray-700">
        {ad.photoUrls[0] && (
          <img src={ad.photoUrls[0]} alt={ad.title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <span
          className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            ad.adKind === "biete"
              ? "bg-green-50 text-[#4d9a4c] dark:bg-green-950"
              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
          }`}
        >
          {ad.adKind === "biete" ? t("common.offering") : t("common.seeking")}
        </span>
        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {ad.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {priceLabel(t, ad)}
        </p>
      </div>
    </Link>
  );
}

export function ActiveAdsCarousel() {
  const { t } = useTranslation();
  const { ads, loading } = useAds({ hideReserved: true });
  const [page, setPage] = useState(0);

  const visibleAds = useMemo(() => ads.slice(0, MAX_ADS), [ads]);
  const totalPages = Math.ceil(visibleAds.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));

  if (loading || visibleAds.length === 0) return null;

  const pageAds = visibleAds.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700";

  return (
    <div className="mx-auto max-w-4xl rounded-b-xl bg-white px-5 pb-5 pt-3 text-left shadow-lg dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t("home.activeAdsHeading")}
        </h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
              aria-label={t("home.prevPage")}
              className={buttonClass}
            >
              <ChevronRightIcon className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
              aria-label={t("home.nextPage")}
              className={buttonClass}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {pageAds.map((ad) => (
          <CompactAdCard key={ad.id} ad={ad} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={t("home.goToPage", { page: i + 1 })}
              className={`h-2 w-2 rounded-full ${
                i === currentPage ? "bg-[#5fac5e]" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
