import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onApply: (min: number | undefined, max: number | undefined) => void;
}

export function PriceRangeFilter({ minPrice, maxPrice, onApply }: PriceRangeFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [minDraft, setMinDraft] = useState(minPrice?.toString() ?? "");
  const [maxDraft, setMaxDraft] = useState(maxPrice?.toString() ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMinDraft(minPrice?.toString() ?? "");
    setMaxDraft(maxPrice?.toString() ?? "");
  }, [minPrice, maxPrice]);

  function handleApply() {
    onApply(minDraft ? Number(minDraft) : undefined, maxDraft ? Number(maxDraft) : undefined);
    setOpen(false);
  }

  const summary =
    minPrice !== undefined || maxPrice !== undefined
      ? `${minPrice ?? 0} – ${maxPrice ?? "∞"} €`
      : t("adList.priceFilterLabel");

  return (
    <div ref={containerRef} className="relative rounded border border-gray-300 px-3 py-2 dark:border-gray-600">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-[#5fac5e] hover:underline"
      >
        {summary}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value)}
              placeholder={t("adList.priceMin")}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              placeholder={t("adList.priceMax")}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="mt-3 w-full rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            {t("common.apply")}
          </button>
        </div>
      )}
    </div>
  );
}
