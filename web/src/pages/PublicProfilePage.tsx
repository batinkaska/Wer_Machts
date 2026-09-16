import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { type ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { AdList } from "../components/ads/AdList";
import { CategoryMultiPicker } from "../components/categories/CategoryMultiPicker";
import { Lightbox } from "../components/common/Lightbox";
import { PhotoIcon, StarIcon } from "../components/icons";
import { ReviewBox } from "../components/reviews/ReviewBox";
import { StarRatingDisplay } from "../components/reviews/StarRating";
import { ProBadge } from "../components/ProBadge";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../firebase/config";
import { adsCol, bidsCol, usersCol } from "../firebase/converters";
import { useAds } from "../hooks/useAds";
import { useMyBids } from "../hooks/useBids";
import { useFollowerCount } from "../hooks/useFollowerCount";
import { useReviewsForUser } from "../hooks/useReviewsForUser";
import { SONSTIGES_SLUG, categoryLabel } from "../lib/categories";
import { useDateFormatter } from "../lib/useDateFormatter";
import { makeConversationId } from "../types/message";
import type { AppUser, ProfileSectionVisibility, ProfileVisibility } from "../types/user";

function VisibilitySelect({
  value,
  onChange,
}: {
  value: ProfileVisibility;
  onChange: (v: ProfileVisibility) => void;
}) {
  const { t } = useTranslation();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ProfileVisibility)}
      className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
    >
      <option value="public">{t("profile.visibilityPublic")}</option>
      <option value="private">{t("profile.visibilityPrivate")}</option>
    </select>
  );
}

export function PublicProfilePage() {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const { firebaseUser, appUser, toggleFollow, updateProfile, addGalleryPhoto, removeGalleryPhoto } =
    useAuth();

  const [profileUser, setProfileUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [bioDraft, setBioDraft] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [categoriesDraft, setCategoriesDraft] = useState<string[]>([]);
  const [categoryNoteDraft, setCategoryNoteDraft] = useState("");
  const [editingCategories, setEditingCategories] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [confirmingRemoveKey, setConfirmingRemoveKey] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOwnProfile = firebaseUser?.uid === uid;
  const showOwnerControls = isOwnProfile && !previewMode;
  const displayedUser = isOwnProfile ? appUser : profileUser;

  const { ads, loading: adsLoading } = useAds({ ownerId: uid });
  const { bids: providerBids } = useMyBids(uid);
  const { count: followerCount } = useFollowerCount(uid);
  const { reviews, average: ratingAverage, count: ratingCount } = useReviewsForUser(uid);
  const { formatDate } = useDateFormatter();
  const followingCount = displayedUser?.followingIds?.length ?? 0;
  const isFollowing = appUser?.followingIds?.includes(uid ?? "") ?? false;
  const canViewFollows = isOwnProfile || (displayedUser?.followersVisible ?? true);

  const completedAsClient = ads.filter(
    (a) => (a.status === "in_progress" || a.status === "closed") && !a.hiddenFromProfile,
  );
  const completedAsProvider = providerBids.filter((b) => b.status === "accepted" && !b.hiddenFromProfile);
  const hasCompletedWork = completedAsClient.length > 0 || completedAsProvider.length > 0;
  const isBlocked = !!uid && (appUser?.blockedUserIds?.includes(uid) ?? false);

  async function hideCompletedAd(adId: string) {
    await updateDoc(doc(adsCol, adId), { hiddenFromProfile: true });
    setConfirmingRemoveKey(null);
  }

  async function hideCompletedBid(bidId: string) {
    await updateDoc(doc(bidsCol, bidId), { hiddenFromProfile: true });
    setConfirmingRemoveKey(null);
  }

  const sectionVisibility = displayedUser?.sectionVisibility ?? {};
  function isVisible(section: keyof ProfileSectionVisibility): boolean {
    if (showOwnerControls) return true;
    return (sectionVisibility[section] ?? "public") !== "private";
  }
  async function setSectionVisibility(section: keyof ProfileSectionVisibility, value: ProfileVisibility) {
    await updateProfile({
      sectionVisibility: { ...(appUser?.sectionVisibility ?? {}), [section]: value },
    });
  }

  useEffect(() => {
    if (!uid || isOwnProfile) {
      setLoading(false);
      return;
    }
    getDoc(doc(usersCol, uid))
      .then((snap) => {
        setProfileUser(snap.exists() ? snap.data() : null);
      })
      .finally(() => setLoading(false));
  }, [uid, isOwnProfile]);

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setAvatarUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${uid}/avatar-${crypto.randomUUID()}-${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      await updateProfile({ photoURL: url });
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleGalleryUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !uid) return;
    setGalleryUploading(true);
    try {
      for (const file of files) {
        const storageRef = ref(storage, `profiles/${uid}/gallery-${crypto.randomUUID()}-${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snap.ref);
        await addGalleryPhoto(url);
      }
    } finally {
      setGalleryUploading(false);
    }
  }

  function startEditingBio() {
    setBioDraft(displayedUser?.bio ?? "");
    setEditingBio(true);
  }

  async function saveBio() {
    await updateProfile({ bio: bioDraft });
    setEditingBio(false);
  }

  function startEditingCategories() {
    setCategoriesDraft(displayedUser?.categories ?? []);
    setCategoryNoteDraft(displayedUser?.categoryNote ?? "");
    setEditingCategories(true);
  }

  async function saveCategories() {
    await updateProfile({
      categories: categoriesDraft,
      ...(categoriesDraft.includes(SONSTIGES_SLUG) ? { categoryNote: categoryNoteDraft } : {}),
    });
    setEditingCategories(false);
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </p>
    );
  }
  if (!displayedUser) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("profile.notFound")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {previewMode && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-[#5fac5e] bg-green-50 px-4 py-3 dark:bg-green-950">
          <p className="text-sm text-[#4d9a4c]">{t("profile.previewBanner")}</p>
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="shrink-0 rounded-full bg-[#5fac5e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4d9a4c]"
          >
            {t("profile.exitPreview")}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {displayedUser.photoURL ? (
            <img
              src={displayedUser.photoURL}
              alt=""
              className="h-32 w-32 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 text-4xl font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {displayedUser.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{displayedUser.displayName}</h1>
            {displayedUser.isPro && <ProBadge />}
            {displayedUser.emailVerified && <VerifiedBadge label={t("verifiedBadges.email")} />}
            {displayedUser.phoneVerified && <VerifiedBadge label={t("verifiedBadges.phone")} />}
            {displayedUser.accountType === "business" && <VerifiedBadge label={t("verifiedBadges.business")} />}
          </div>
          {displayedUser.city && <p className="text-sm text-gray-500 dark:text-gray-400">{displayedUser.city}</p>}
          <div className="mt-1 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            {canViewFollows ? (
              <>
                <Link to={`/profile/${uid}/followers`} className="hover:underline">
                  {t("profile.followerCount", { count: followerCount })}
                </Link>
                <Link to={`/profile/${uid}/following`} className="hover:underline">
                  {t("profile.followingCount", { count: followingCount })}
                </Link>
              </>
            ) : (
              <>
                <span>{t("profile.followerCount", { count: followerCount })}</span>
                <span>{t("profile.followingCount", { count: followingCount })}</span>
              </>
            )}
          </div>
          {ratingCount > 0 && (
            <div className="mt-1">
              <StarRatingDisplay average={ratingAverage} count={ratingCount} />
            </div>
          )}
        </div>
        </div>

        {showOwnerControls && !displayedUser.isPro && (
          <div className="w-full shrink-0 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950 sm:w-56">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t("pro.profilePromoHeading")}
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
              <li>• {t("pro.profilePromoUnlimited")}</li>
              <li>• {t("pro.profilePromoFeatured")}</li>
              <li>• {t("pro.profilePromoBadge")}</li>
            </ul>
            <Link
              to="/settings"
              className="mt-2 inline-block rounded-full bg-[#5fac5e] px-3 py-1 text-xs font-medium text-white hover:bg-[#4d9a4c]"
            >
              {t("pro.upgradeCta")}
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {showOwnerControls ? (
          <>
            <label className="cursor-pointer text-sm font-medium text-[#5fac5e] hover:underline">
              {avatarUploading ? t("profile.uploading") : t("profile.changePhoto")}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t("profile.preview")}
            </button>
          </>
        ) : (
          !isOwnProfile &&
          firebaseUser && (
            <button
              type="button"
              onClick={() => uid && toggleFollow(uid)}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isFollowing ? t("common.unfollow") : t("common.follow")}
            </button>
          )
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          {t("profile.adsFromUser", { name: displayedUser.displayName, count: ads.length })}
        </h2>
        <AdList ads={ads} loading={adsLoading} emptyMessage={t("profile.noAdsYet")} />
      </div>

      {isVisible("bio") && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("profile.aboutMe")}</h2>
            {showOwnerControls && (
              <div className="flex items-center gap-2">
                <VisibilitySelect
                  value={sectionVisibility.bio ?? "public"}
                  onChange={(v) => setSectionVisibility("bio", v)}
                />
                {!editingBio && (
                  <button type="button" onClick={startEditingBio} className="text-sm text-[#5fac5e] hover:underline">
                    {t("common.edit")}
                  </button>
                )}
              </div>
            )}
          </div>
          <hr className="mb-3 border-gray-200 dark:border-gray-700" />
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                rows={4}
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveBio}
                  className="rounded bg-[#5fac5e] px-3 py-1.5 text-sm text-white hover:bg-[#4d9a4c]"
                >
                  {t("common.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBio(false)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {displayedUser.bio || (showOwnerControls ? t("profile.noBioYet") : "")}
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("reviews.sectionTitle")}</h2>
        <hr className="mb-3 mt-2 border-gray-200 dark:border-gray-700" />
        {firebaseUser && !isOwnProfile && !isBlocked && uid && (
          <div className="mb-4 rounded border border-gray-200 p-3 dark:border-gray-700">
            <ReviewBox
              conversationId={makeConversationId("profile", firebaseUser.uid, uid)}
              revieweeId={uid}
              revieweeName={displayedUser.displayName}
            />
          </div>
        )}
        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{t("reviews.none")}</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{review.reviewerName}</span>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{formatDate(review.createdAt)}</span>
                </div>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i <= review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}`}
                    />
                  ))}
                </div>
                {review.comment && <p className="mt-1 text-gray-700 dark:text-gray-300">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isVisible("photos") && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("profile.photos")}</h2>
            {showOwnerControls && (
              <div className="flex items-center gap-2">
                <VisibilitySelect
                  value={sectionVisibility.photos ?? "public"}
                  onChange={(v) => setSectionVisibility("photos", v)}
                />
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-[#5fac5e] hover:underline">
                  <PhotoIcon className="h-4 w-4" />
                  {galleryUploading ? t("profile.uploading") : t("profile.addPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <hr className="mb-3 border-gray-200 dark:border-gray-700" />
          {(displayedUser.galleryUrls?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("profile.noPhotos")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {displayedUser.galleryUrls!.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                  <img
                    src={url}
                    alt=""
                    onClick={() => setLightboxIndex(i)}
                    className="h-full w-full cursor-zoom-in object-cover"
                  />
                  {showOwnerControls && (
                    <button
                      type="button"
                      onClick={() => removeGalleryPhoto(url)}
                      className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-gray-700 shadow group-hover:flex dark:bg-gray-900/80 dark:text-gray-300"
                      aria-label={t("profile.removePhoto")}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {lightboxIndex !== null && (
            <Lightbox
              photoUrls={displayedUser.galleryUrls!}
              activeIndex={lightboxIndex}
              onIndexChange={setLightboxIndex}
              onClose={() => setLightboxIndex(null)}
              alt=""
            />
          )}
        </div>
      )}

      {hasCompletedWork && isVisible("completedWork") && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("profile.completedWork")}</h2>
            {showOwnerControls && (
              <VisibilitySelect
                value={sectionVisibility.completedWork ?? "public"}
                onChange={(v) => setSectionVisibility("completedWork", v)}
              />
            )}
          </div>
          <hr className="mb-3 border-gray-200 dark:border-gray-700" />
          <ul className="space-y-2">
            {completedAsClient.map((ad) => {
              const key = `client-${ad.id}`;
              return (
                <li
                  key={key}
                  className="flex items-center justify-between gap-3 rounded border border-gray-200 px-4 py-2.5 dark:border-gray-700"
                >
                  <Link to={`/ads/${ad.id}`} className="truncate text-sm font-medium text-gray-900 hover:underline dark:text-gray-100">
                    {ad.title}
                  </Link>
                  {confirmingRemoveKey === key ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {t("profile.removeCompletedWorkConfirm")}
                      </span>
                      <button
                        type="button"
                        onClick={() => hideCompletedAd(ad.id)}
                        className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        {t("common.delete")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingRemoveKey(null)}
                        className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                        {t("profile.roleClient")}
                      </span>
                      {showOwnerControls && (
                        <button
                          type="button"
                          onClick={() => setConfirmingRemoveKey(key)}
                          className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                          aria-label={t("profile.removeCompletedWork")}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {completedAsProvider.map((bid) => {
              const key = `provider-${bid.id}`;
              return (
                <li
                  key={key}
                  className="flex items-center justify-between gap-3 rounded border border-gray-200 px-4 py-2.5 dark:border-gray-700"
                >
                  <Link
                    to={`/ads/${bid.adId}`}
                    className="truncate text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
                  >
                    {bid.adTitle ?? t("finances.unknownAd")}
                  </Link>
                  {confirmingRemoveKey === key ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {t("profile.removeCompletedWorkConfirm")}
                      </span>
                      <button
                        type="button"
                        onClick={() => hideCompletedBid(bid.id)}
                        className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        {t("common.delete")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingRemoveKey(null)}
                        className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-[#4d9a4c] dark:bg-green-950">
                        {t("profile.roleProvider")}
                      </span>
                      {showOwnerControls && (
                        <button
                          type="button"
                          onClick={() => setConfirmingRemoveKey(key)}
                          className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                          aria-label={t("profile.removeCompletedWork")}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isVisible("categories") && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("profile.offeredServices")}</h2>
            {showOwnerControls && (
              <div className="flex items-center gap-2">
                <VisibilitySelect
                  value={sectionVisibility.categories ?? "public"}
                  onChange={(v) => setSectionVisibility("categories", v)}
                />
                {!editingCategories && (
                  <button
                    type="button"
                    onClick={startEditingCategories}
                    className="text-sm text-[#5fac5e] hover:underline"
                  >
                    {t("common.edit")}
                  </button>
                )}
              </div>
            )}
          </div>
          <hr className="mb-3 border-gray-200 dark:border-gray-700" />
          {editingCategories ? (
            <div className="space-y-2">
              <CategoryMultiPicker
                selected={categoriesDraft}
                onChange={setCategoriesDraft}
                note={categoryNoteDraft}
                onNoteChange={setCategoryNoteDraft}
                placeholder={t("categoryPicker.choosePlaceholder")}
                variant="menu"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveCategories}
                  className="rounded bg-[#5fac5e] px-3 py-1.5 text-sm text-white hover:bg-[#4d9a4c]"
                >
                  {t("common.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategories(false)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (displayedUser.categories?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {showOwnerControls ? t("profile.noServicesYet") : t("profile.noInfo")}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {displayedUser.categories!.map((slug) => (
                  <span
                    key={slug}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {categoryLabel(t, slug)}
                  </span>
                ))}
              </div>
              {displayedUser.categoryNote && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("categoryPicker.sonstigesPrefix")}: {displayedUser.categoryNote}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
