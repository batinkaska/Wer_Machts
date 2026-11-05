import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { publicProfilesCol } from "../firebase/converters";
import { useFollowers } from "../hooks/useFollowers";
import { useUsersByIds } from "../hooks/useUsersByIds";
import type { PublicProfile } from "../types/user";

export function FollowListPage() {
  const { t } = useTranslation();
  const { uid, kind } = useParams<{ uid: string; kind: string }>();
  const { firebaseUser, appUser } = useAuth();

  const [profileUser, setProfileUser] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = firebaseUser?.uid === uid;
  const displayedUser = isOwnProfile ? appUser : profileUser;

  useEffect(() => {
    if (!uid || isOwnProfile) {
      setLoading(false);
      return;
    }
    getDoc(doc(publicProfilesCol, uid))
      .then((snap) => setProfileUser(snap.exists() ? snap.data() : null))
      .finally(() => setLoading(false));
  }, [uid, isOwnProfile]);

  const { users: followers, loading: followersLoading } = useFollowers(uid);
  const { users: following, loading: followingLoading } = useUsersByIds(
    displayedUser?.followingIds ?? [],
  );

  if (loading) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </p>
    );
  }

  if (!displayedUser) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("profile.notFound")}
      </p>
    );
  }

  const canView = isOwnProfile || (displayedUser.followersVisible ?? true);
  if (!canView) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-gray-500 dark:text-gray-400">{t("profile.followersPrivate")}</p>
        <Link to={`/profile/${uid}`} className="mt-3 inline-block text-sm text-[#5fac5e] hover:underline">
          {t("profile.backToProfile")}
        </Link>
      </div>
    );
  }

  const activeKind = kind === "following" ? "following" : "followers";
  const list = activeKind === "followers" ? followers : following;
  const isLoadingList = activeKind === "followers" ? followersLoading : followingLoading;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link
        to={`/profile/${uid}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:underline dark:text-gray-400"
      >
        ‹ {displayedUser.displayName}
      </Link>
      <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <Link
          to={`/profile/${uid}/followers`}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            activeKind === "followers"
              ? "border-[#5fac5e] text-gray-900 dark:text-gray-100"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {t("profile.followerCount", { count: followers.length })}
        </Link>
        <Link
          to={`/profile/${uid}/following`}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            activeKind === "following"
              ? "border-[#5fac5e] text-gray-900 dark:text-gray-100"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {t("profile.followingCount", { count: following.length })}
        </Link>
      </div>

      {isLoadingList ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
      ) : list.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {activeKind === "followers" ? t("profile.noFollowers") : t("profile.noFollowing")}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {list.map((u) => (
            <li key={u.uid}>
              <Link
                to={`/profile/${u.uid}`}
                className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {u.photoURL ? (
                  <img src={u.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-gray-900 dark:text-gray-100">{u.displayName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
