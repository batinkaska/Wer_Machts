import { useTranslation } from "react-i18next";
import type { Ad } from "../../types/ad";
import { AdCard } from "./AdCard";

interface AdListProps {
  ads: Ad[];
  loading: boolean;
  emptyMessage?: string;
}

export function AdList({ ads, loading, emptyMessage }: AdListProps) {
  const { t } = useTranslation();
  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t("common.loading")}</p>;
  }
  if (ads.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">{emptyMessage ?? t("adList.emptyDefault")}</p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
