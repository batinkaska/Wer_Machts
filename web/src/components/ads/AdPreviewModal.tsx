import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { categoryLabels } from "../../lib/categories";
import type { AdKind, PriceType } from "../../types/ad";

interface AdPreviewModalProps {
  title: string;
  description: string;
  categories: string[];
  categoryNote?: string;
  adKind: AdKind;
  priceType: PriceType;
  budget: string;
  city: string;
  postalCode: string;
  street: string;
  showFullAddress: boolean;
  photoPreviewUrls: string[];
  ownerName: string;
  onClose: () => void;
}

function previewPriceLabel(
  t: TFunction,
  { priceType, budget }: { priceType: PriceType; budget: string },
): string {
  if (priceType === "gift") return t("adForm.priceTypeGift");
  if (priceType === "on_request") return t("common.priceOnRequest");
  if (priceType === "negotiable")
    return budget ? `${budget} € ${t("common.negotiableSuffix")}` : t("common.negotiableSuffix");
  return budget ? `${budget} € · ${t("adForm.priceTypeFixed")}` : t("adForm.priceTypeFixed");
}

export function AdPreviewModal({
  title,
  description,
  categories,
  categoryNote,
  adKind,
  priceType,
  budget,
  city,
  postalCode,
  street,
  showFullAddress,
  photoPreviewUrls,
  ownerName,
  onClose,
}: AdPreviewModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("adForm.previewHeading")}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {t("adForm.close")}
          </button>
        </div>

        {photoPreviewUrls.length > 0 ? (
          <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <img src={photoPreviewUrls[0]} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            {t("adForm.noPhotosAdded")}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              adKind === "biete" ? "bg-green-50 text-[#4d9a4c] dark:bg-green-950" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            }`}
          >
            {adKind === "biete" ? t("common.offering") : t("common.seeking")}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {categories.length > 0 ? categoryLabels(t, categories) : t("adForm.noCategoryChosen")}
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {title || t("adForm.noTitle")}
        </h1>
        <p className="mt-1 text-xl font-bold text-[#5fac5e]">
          {previewPriceLabel(t, { priceType, budget })}
        </p>
        {categoryNote && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("categoryPicker.sonstigesPrefix")}: {categoryNote}
          </p>
        )}

        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {postalCode} {city}
          {showFullAddress && street ? `, ${street}` : ""}
        </p>

        <div className="mt-6">
          <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">{t("adDetail.description")}</h2>
          <hr className="mb-3 border-gray-200 dark:border-gray-700" />
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {description || t("adForm.noDescription")}
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">{t("adForm.previewOwner", { name: ownerName })}</p>
      </div>
    </div>
  );
}
