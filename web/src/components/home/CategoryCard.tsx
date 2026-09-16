import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  to: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function CategoryCard({ to, name, icon: Icon }: CategoryCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-green-50 dark:bg-green-950">
        <Icon className="h-14 w-14 text-[#5fac5e]" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-[#5fac5e] px-4 py-2 text-sm font-medium text-white">
            {t("home.viewListings")}
          </span>
        </div>
      </div>
      <p className="p-3 text-sm font-medium text-[#4d9a4c] dark:text-[#7fc57e]">{name}</p>
    </Link>
  );
}
