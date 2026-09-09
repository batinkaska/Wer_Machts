import { useTranslation } from "react-i18next";

export type SortOption = "newest" | "price_asc" | "price_desc";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label={t("adList.sortLabel")}
        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none dark:text-gray-300"
      >
        <option value="newest">{t("adList.sortNewest")}</option>
        <option value="price_asc">{t("adList.sortPriceAsc")}</option>
        <option value="price_desc">{t("adList.sortPriceDesc")}</option>
      </select>
    </div>
  );
}
