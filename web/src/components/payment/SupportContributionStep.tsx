import { useState } from "react";
import { useTranslation } from "react-i18next";

type Choice = "none" | "5" | "10" | "custom";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function SupportContributionStep({
  serviceAmount,
  onContinue,
  onCancel,
}: {
  serviceAmount: number;
  onContinue: (supportAmount: number) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<Choice>("none");
  const [customAmount, setCustomAmount] = useState("");

  const fivePercent = round2(serviceAmount * 0.05);
  const tenPercent = round2(serviceAmount * 0.1);
  const supportAmount =
    choice === "5" ? fivePercent : choice === "10" ? tenPercent : choice === "custom" ? Math.max(0, Number(customAmount) || 0) : 0;
  const total = round2(serviceAmount + supportAmount);

  const optionClass = (active: boolean) =>
    `rounded-full border px-3 py-2 text-sm font-medium ${
      active
        ? "border-[#5fac5e] bg-green-50 text-[#4d9a4c] dark:bg-green-950"
        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t("payment.supportHeading")}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("payment.supportSubtitle")}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button type="button" className={optionClass(choice === "none")} onClick={() => setChoice("none")}>
          {t("payment.supportNone")}
        </button>
        <button type="button" className={optionClass(choice === "5")} onClick={() => setChoice("5")}>
          +5%
        </button>
        <button type="button" className={optionClass(choice === "10")} onClick={() => setChoice("10")}>
          +10%
        </button>
      </div>

      <button type="button" className={optionClass(choice === "custom") + " w-full"} onClick={() => setChoice("custom")}>
        {t("payment.supportCustom")}
      </button>
      {choice === "custom" && (
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="0.00 €"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          autoFocus
        />
      )}

      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {t("payment.supportTotal", { amount: total.toFixed(2) })}
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={() => onContinue(supportAmount)}
          className="flex-1 rounded-full bg-[#5fac5e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c]"
        >
          {t("payment.supportContinue")}
        </button>
      </div>
    </div>
  );
}
