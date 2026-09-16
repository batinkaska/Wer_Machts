import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import heroPeople from "../assets/hero-people.png";
import logo from "../assets/logo.png";
import { CheckCircleIcon, ClockIcon, DiamondIcon, LightbulbIcon } from "../components/icons";
import { CategoryCard } from "../components/home/CategoryCard";
// IntroAnimation geçici olarak kapatıldı — geri açmak için: import'u geri ekle ve
// aşağıda <IntroAnimation /> satırının yorumunu kaldır.
import { CATEGORY_GROUPS, CATEGORY_GROUP_ICONS, categoryGroupName } from "../lib/categories";

const BENEFITS = [
  { icon: DiamondIcon, key: "compareOffers" },
  { icon: ClockIcon, key: "saveTime" },
  { icon: CheckCircleIcon, key: "directContact" },
  { icon: LightbulbIcon, key: "easyToUse" },
] as const;

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* <IntroAnimation /> */}
      <section className="bg-[#0b5b7a]">
        <div className="mx-auto max-w-5xl px-4 pt-8 text-center">
          <img src={logo} alt="" className="mx-auto mb-4 h-20 w-20 rounded-xl" />
          <h1 className="text-4xl font-semibold text-white">{t("home.heroTitle")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">{t("home.heroSubtitle")}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/ads"
              className="rounded bg-[#5fac5e] px-5 py-2.5 text-white hover:bg-[#4d9a4c]"
            >
              {t("home.browseAds")}
            </Link>
            <Link
              to="/ads/new"
              className="rounded border border-white/70 px-5 py-2.5 text-white hover:bg-white/10"
            >
              {t("home.offerCta")}
            </Link>
          </div>
          <img
            src={heroPeople}
            alt=""
            className="mx-auto mt-6 block max-h-48 w-auto sm:max-h-72 md:max-h-[28rem]"
          />
        </div>
      </section>
      <div className="border-t border-gray-100 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.key}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                <benefit.icon className="h-6 w-6 text-[#5fac5e]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t(`home.benefits.${benefit.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t(`home.benefits.${benefit.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-12 dark:bg-gray-900">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t("home.categoriesHeading")}
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORY_GROUPS.map((group) => (
            <CategoryCard
              key={group.groupKey}
              to={`/ads?categories=${group.categories.map((c) => c.slug).join(",")}`}
              name={categoryGroupName(t, group.groupKey)}
              icon={CATEGORY_GROUP_ICONS[group.groupKey]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
