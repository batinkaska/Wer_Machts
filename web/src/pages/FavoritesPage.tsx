import { useTranslation } from "react-i18next";
import { AdList } from "../components/ads/AdList";
import { useAuth } from "../contexts/AuthContext";
import { useFavoriteAds } from "../hooks/useFavoriteAds";

export function FavoritesPage() {
  const { t } = useTranslation();
  const { appUser } = useAuth();
  const { ads, loading } = useFavoriteAds(appUser?.favoriteAdIds);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("favorites.pageTitle")}</h1>
      <AdList ads={ads} loading={loading} emptyMessage={t("favorites.empty")} />
    </div>
  );
}
