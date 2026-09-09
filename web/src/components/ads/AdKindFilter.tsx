import { useTranslation } from "react-i18next";
import type { AdKind } from "../../types/ad";

interface AdKindFilterProps {
  value: AdKind | "";
  onChange: (value: AdKind | "") => void;
}

export function AdKindFilter({ value, onChange }: AdKindFilterProps) {
  const { t } = useTranslation();
  const options: { value: AdKind | ""; label: string }[] = [
    { value: "", label: t("adList.adKindAll") },
    { value: "biete", label: t("common.offering") },
    { value: "suche", label: t("common.seeking") },
  ];

  return (
    <div className="flex items-center gap-1 rounded border border-gray-300 p-1 dark:border-gray-600">
      {options.map((opt) => (
        <button
          key={opt.value || "all"}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-2.5 py-1 text-sm font-medium ${
            value === opt.value
              ? "bg-[#5fac5e] text-white"
              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
