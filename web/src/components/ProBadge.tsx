import { useTranslation } from "react-i18next";
import { StarIcon } from "./icons";

export function ProBadge({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300 ${className ?? ""}`}
    >
      <StarIcon className="h-3.5 w-3.5" />
      {t("pro.badge")}
    </span>
  );
}
