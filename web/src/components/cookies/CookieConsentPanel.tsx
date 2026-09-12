import { useTranslation } from "react-i18next";

interface CookieConsentPanelProps {
  analytics: boolean;
  marketing: boolean;
  onChange: (next: { analytics: boolean; marketing: boolean }) => void;
}

function CategoryRow({
  title,
  description,
  checked,
  locked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={locked}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#5fac5e]" : "bg-gray-300 dark:bg-gray-700"
        } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function CookieConsentPanel({ analytics, marketing, onChange }: CookieConsentPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      <CategoryRow
        title={t("cookies.necessaryTitle")}
        description={t("cookies.necessaryDescription")}
        checked
        locked
      />
      <CategoryRow
        title={t("cookies.analyticsTitle")}
        description={t("cookies.analyticsDescription")}
        checked={analytics}
        onToggle={() => onChange({ analytics: !analytics, marketing })}
      />
      <CategoryRow
        title={t("cookies.marketingTitle")}
        description={t("cookies.marketingDescription")}
        checked={marketing}
        onToggle={() => onChange({ analytics, marketing: !marketing })}
      />
    </div>
  );
}
