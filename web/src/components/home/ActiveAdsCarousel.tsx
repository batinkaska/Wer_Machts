import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdCard } from "../ads/AdCard";
import { ChevronRightIcon } from "../icons";
import { useAds } from "../../hooks/useAds";

const PAGE_SIZE = 4;
const MAX_ADS = 12;

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
    <div className="mx-auto mt-8 max-w-4xl rounded-xl bg-white p-5 text-left shadow-lg dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
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
          <AdCard key={ad.id} ad={ad} />
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
