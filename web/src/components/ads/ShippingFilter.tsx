import { useTranslation } from "react-i18next";

interface ShippingFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ShippingFilter({ checked, onChange }: ShippingFilterProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-full border px-3 py-2 text-sm ${
        checked
          ? "border-[#5fac5e] bg-green-50 text-[#4d9a4c] dark:bg-green-950"
          : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {checked ? "✓ " : ""}
      {t("adList.shippingOnly")}
    </button>
  );
}
