import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import heroPeople from "../assets/hero-people.png";
import logo from "../assets/logo.png";
import { CheckCircleIcon, ClockIcon, DiamondIcon, LightbulbIcon } from "../components/icons";
import { IntroAnimation } from "../components/home/IntroAnimation";
import { CATEGORY_GROUPS, categoryGroupName, categoryLabel } from "../lib/categories";

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
            className="mx-auto mt-6 hidden max-h-[28rem] w-auto md:block"
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.groupKey}>
              <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                {categoryGroupName(t, group.groupKey)}
              </h2>
              <div className="flex flex-wrap gap-2">
                {group.categories.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/ads?categories=${c.slug}`}
                    className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {categoryLabel(t, c.slug)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
