import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PhoneVerificationModal } from "../auth/PhoneVerificationModal";
import { useAuth } from "../../contexts/AuthContext";
import { storage } from "../../firebase/config";
import { SONSTIGES_SLUG } from "../../lib/categories";
import { friendlyErrorMessage } from "../../lib/friendlyError";
import { getCoordinates, getPlaceName, isValidPlzFormat } from "../../lib/postalCodes";
import type { AdKind, NewAd, PriceType } from "../../types/ad";
import { CategoryMultiPicker } from "../categories/CategoryMultiPicker";
import { PhotoIcon } from "../icons";
import { AdPreviewModal } from "./AdPreviewModal";

const MAX_PHOTOS = 20;
const MAX_PHOTO_SIZE = 12 * 1024 * 1024;

type SubmitAction = "publish" | "draft";

interface AdFormProps {
  onSubmit: (values: NewAd, action: SubmitAction) => Promise<void>;
  submitting: boolean;
}

export function AdForm({ onSubmit, submitting }: AdFormProps) {
  const { t } = useTranslation();
  const { appUser, updateProfile } = useAuth();

  const [adKind, setAdKind] = useState<AdKind>("suche");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryNote, setCategoryNote] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [budget, setBudget] = useState("");
  const [shipping, setShipping] = useState(false);

  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [showFullAddress, setShowFullAddress] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [marketingOptIn, setMarketingOptIn] = useState(appUser?.marketingOptIn ?? false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoPreviewUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  async function resolvePostalCode(value: string) {
    if (!isValidPlzFormat(value)) {
      setCity("");
      return;
    }
    const [coords, placeName] = await Promise.all([getCoordinates(value), getPlaceName(value)]);
    if (!coords) {
      setPostalCodeError(t("common.plzNotFound"));
      setCity("");
      return;
    }
    setPostalCodeError(null);
    setCity(placeName ?? "");
  }

  function handleBudgetChange(value: string) {
    setBudget(value);
    if (value === "0") {
      setPriceType("gift");
    }
  }

  function handlePriceTypeChange(value: PriceType) {
    setPriceType(value);
    if (value === "gift") {
      setBudget("0");
    } else if (budget === "0") {
      setBudget("");
    }
  }

  function handlePostalCodeChange(value: string) {
    setPostalCode(value);
    setPostalCodeError(null);
    if (value.length === 5) {
      resolvePostalCode(value);
    } else {
      setCity("");
    }
  }

  function addFiles(newFiles: File[]) {
    setPhotoError(null);
    const images = newFiles.filter((f) => f.type.startsWith("image/"));
    const oversized = images.filter((f) => f.size > MAX_PHOTO_SIZE);
    const accepted = images.filter((f) => f.size <= MAX_PHOTO_SIZE);

    setFiles((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > MAX_PHOTOS) {
        setPhotoError(t("adForm.tooManyPhotos", { max: MAX_PHOTOS }));
        return combined.slice(0, MAX_PHOTOS);
      }
      return combined;
    });

    if (oversized.length > 0) {
      setPhotoError(t("adForm.photosTooLarge", { count: oversized.length }));
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }

  async function uploadPhotos(): Promise<string[]> {
    return Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `ads/${crypto.randomUUID()}-${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        return getDownloadURL(snap.ref);
      }),
    );
  }

  function failWith(message: string) {
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAction(action: SubmitAction) {
    setError(null);

    if (!title.trim()) {
      failWith(t("adForm.errorTitleRequired"));
      return;
    }

    if (action === "publish") {
      if (categories.length === 0) {
        failWith(t("adForm.errorCategoryRequired"));
        return;
      }
      if (!description.trim()) {
        failWith(t("adForm.errorDescriptionRequired"));
        return;
      }
      if (!isValidPlzFormat(postalCode)) {
        setPostalCodeError(t("common.plzInvalid"));
        return;
      }
      const coords = await getCoordinates(postalCode);
      if (!coords) {
        setPostalCodeError(t("common.plzNotFound"));
        return;
      }
      if (!appUser?.phoneVerified) {
        setShowPhoneModal(true);
        return;
      }
    }

    try {
      setUploading(true);
      const photoUrls = await uploadPhotos();
      setUploading(false);

      const coords = isValidPlzFormat(postalCode) ? await getCoordinates(postalCode) : undefined;

      if (appUser && marketingOptIn !== (appUser.marketingOptIn ?? false)) {
        await updateProfile({ marketingOptIn });
      }

      await onSubmit(
        {
          adKind,
          title: title.trim(),
          description,
          categories,
          ...(categories.includes(SONSTIGES_SLUG) && categoryNote ? { categoryNote } : {}),
          city,
          postalCode,
          ...(street ? { street, showFullAddress } : {}),
          lat: coords?.lat ?? 0,
          lng: coords?.lng ?? 0,
          priceType,
          photoUrls,
          ...(budget ? { budget: Number(budget) } : {}),
          ...(shipping ? { shipping: true } : {}),
        },
        action,
      );
    } catch (err) {
      setUploading(false);
      failWith(friendlyErrorMessage(err, t, "adForm.errorSaveFailed"));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleAction("publish");
  }

  const busy = submitting || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t("adForm.detailsHeading")}</h2>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t("adForm.offerOrSeek")}</p>
            <div className="flex gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <input
                    type="radio"
                    name="adKind"
                    checked={adKind === "biete"}
                    onChange={() => setAdKind("biete")}
                    className="h-4 w-4 accent-[#5fac5e]"
                  />
                  {t("adForm.iOffer")}
                </label>
                <p className="mt-0.5 pl-6 text-xs text-gray-500 dark:text-gray-400">{t("adForm.iOfferHint")}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <input
                    type="radio"
                    name="adKind"
                    checked={adKind === "suche"}
                    onChange={() => setAdKind("suche")}
                    className="h-4 w-4 accent-[#5fac5e]"
                  />
                  {t("adForm.iSeek")}
                </label>
                <p className="mt-0.5 pl-6 text-xs text-gray-500 dark:text-gray-400">{t("adForm.iSeekHint")}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="title">
              {t("adForm.titleLabel")}
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("adForm.categoryLabel")}</p>
            <CategoryMultiPicker
              selected={categories}
              onChange={setCategories}
              note={categoryNote}
              onNoteChange={setCategoryNote}
              placeholder={t("adForm.categoryPlaceholder")}
              allowGroupSelect
              variant="menu"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="description">
              {t("adDetail.description")}
            </label>
            <textarea
              id="description"
              rows={5}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <p className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{description.length}/4000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="budget">
                {t("adForm.priceLabel")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="budget"
                  type="number"
                  min={0}
                  disabled={priceType === "on_request" || priceType === "gift"}
                  value={budget}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">EUR</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="priceType">
                {t("adForm.priceTypeLabel")}
              </label>
              <select
                id="priceType"
                value={priceType}
                onChange={(e) => handlePriceTypeChange(e.target.value as PriceType)}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="fixed">{t("adForm.priceTypeFixed")}</option>
                <option value="hourly">{t("adForm.priceTypeHourly")}</option>
                <option value="negotiable">{t("adForm.priceTypeNegotiable")}</option>
                <option value="on_request">{t("common.priceOnRequest")}</option>
                <option value="gift">{t("adForm.priceTypeGift")}</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={shipping}
              onChange={(e) => setShipping(e.target.checked)}
              className="h-4 w-4 accent-[#5fac5e]"
            />
            {t("common.plusShipping")}
          </label>

          <div>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("adForm.photosLabel")}</p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
            >
              <PhotoIcon className="h-6 w-6 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("adForm.dropzoneText")}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {t("adForm.dropzoneHint", { max: MAX_PHOTOS })}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
              className="hidden"
            />
            {photoError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{photoError}</p>}
            {photoPreviewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {photoPreviewUrls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={t("adForm.removePhoto")}
                      className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-white/90 text-xs text-gray-700 shadow group-hover:flex dark:bg-gray-900/80 dark:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t("adForm.locationLabel")}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400" htmlFor="postalCode">
                  {t("adForm.plz")}
                </label>
                <input
                  id="postalCode"
                  maxLength={5}
                  inputMode="numeric"
                  value={postalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t("adForm.city")}</label>
                <div className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {city || "—"}
                </div>
              </div>
            </div>
            {postalCodeError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{postalCodeError}</p>}

            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400" htmlFor="street">
                {t("adForm.streetLabel")}
              </label>
              <label className="mb-1.5 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showFullAddress}
                  onChange={(e) => setShowFullAddress(e.target.checked)}
                  className="h-4 w-4 accent-[#5fac5e]"
                />
                {t("adForm.showFullAddress")}
              </label>
              <input
                id="street"
                disabled={!showFullAddress}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t("adForm.yourInfoHeading")}</h2>
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("adForm.nameLabel")}</p>
          <div className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {appUser?.displayName}
          </div>
          <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
            {t("adForm.nameTipBefore")}{" "}
            <Link to="/settings" className="text-[#5fac5e] hover:underline">
              {t("nav.menuSettings")}
            </Link>
            {t("adForm.nameTipAfter")}
          </p>
          <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">{t("adForm.phoneHint")}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t("adForm.publishHeading")}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("adForm.legalBefore")}{" "}
          <Link to="/nutzungsbedingungen" target="_blank" className="text-[#5fac5e] underline">
            {t("legal.terms")}
          </Link>
          {t("adForm.legalMiddle")}{" "}
          <Link to="/datenschutz" target="_blank" className="text-[#5fac5e] underline">
            {t("legal.privacy")}
          </Link>
          {t("adForm.legalAfter")}
        </p>
        <label className="mt-3 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#5fac5e]"
          />
          {t("adForm.marketingOptIn")}
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t("adForm.preview")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleAction("draft")}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {t("adForm.saveDraft")}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[#5fac5e] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
          >
            {busy ? t("adDetail.sending") : t("adForm.publishAction")}
          </button>
        </div>
      </div>

      {previewOpen && (
        <AdPreviewModal
          title={title}
          description={description}
          categories={categories}
          categoryNote={categoryNote}
          adKind={adKind}
          priceType={priceType}
          budget={budget}
          shipping={shipping}
          city={city}
          postalCode={postalCode}
          street={street}
          showFullAddress={showFullAddress}
          photoPreviewUrls={photoPreviewUrls}
          ownerName={appUser?.displayName ?? ""}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {showPhoneModal && (
        <PhoneVerificationModal
          reasonText={t("phoneVerify.publishReason")}
          onClose={() => setShowPhoneModal(false)}
          onVerified={() => setShowPhoneModal(false)}
        />
      )}
    </form>
  );
}
