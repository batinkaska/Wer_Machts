import {
  type User as FirebaseUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { usersCol } from "../firebase/converters";
import type { LanguageCode } from "../i18n";
import type { ThemePreference } from "../theme";
import { createNotification } from "../lib/notify";
import type { AccountType, AppUser, ProfileSectionVisibility } from "../types/user";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  needsProfile: boolean;
  needsActivation: boolean;
  emailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
  refreshEmailVerified: () => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeProfile: (
    input: {
      displayName: string;
      accountType: AccountType;
      city?: string;
      phone?: string;
      marketingOptIn?: boolean;
    },
    targetUser?: FirebaseUser,
  ) => Promise<void>;
  toggleFavorite: (adId: string) => Promise<void>;
  toggleFollow: (sellerId: string) => Promise<void>;
  toggleBlockUser: (uid: string) => Promise<void>;
  hideConversations: (conversationIds: string[]) => Promise<void>;
  updateProfile: (input: {
    displayName?: string;
    bio?: string;
    photoURL?: string;
    city?: string;
    phone?: string;
    deliveryAddress?: string;
    notifyOnNewMessage?: boolean;
    marketingOptIn?: boolean;
    phoneVerified?: boolean;
    categories?: string[];
    categoryNote?: string;
    language?: LanguageCode;
    theme?: ThemePreference;
    sectionVisibility?: ProfileSectionVisibility;
    followersVisible?: boolean;
    businessName?: string;
    impressum?: string;
    taxId?: string;
    withdrawalPolicy?: string;
    businessTerms?: string;
  }) => Promise<void>;
  addGalleryPhoto: (url: string) => Promise<void>;
  removeGalleryPhoto: (url: string) => Promise<void>;
  reauthenticate: (currentPassword?: string) => Promise<void>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (currentPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setEmailVerified(user?.emailVerified ?? false);
      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(usersCol, user.uid));
      if (!snap.exists()) {
        setAppUser(null);
        setLoading(false);
        return;
      }
      let data = snap.data();
      if (user.email && data.email !== user.email) {
        await updateDoc(doc(db, "users", user.uid), { email: user.email });
        data = { ...data, email: user.email };
      }
      if (user.emailVerified && !data.emailVerified) {
        await updateDoc(doc(db, "users", user.uid), { emailVerified: true });
        data = { ...data, emailVerified: true };
      }
      setAppUser(data);
      setLoading(false);
    });
  }, []);

  async function registerWithEmail(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential.user;
  }

  async function resendVerificationEmail() {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  }

  async function refreshEmailVerified() {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    const verified = auth.currentUser.emailVerified;
    setEmailVerified(verified);
    if (verified) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), { emailVerified: true });
      setAppUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
    }
    return verified;
  }

  async function loginWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function logout() {
    await signOut(auth);
  }

  async function completeProfile(
    input: {
      displayName: string;
      accountType: AccountType;
      city?: string;
      phone?: string;
      marketingOptIn?: boolean;
    },
    targetUser?: FirebaseUser,
  ) {
    const user = targetUser ?? firebaseUser;
    if (!user) throw new Error("No authenticated user");
    const newUser: AppUser = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: input.displayName,
      accountType: input.accountType,
      createdAt: serverTimestamp() as unknown as AppUser["createdAt"],
      ...(input.city ? { city: input.city } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.marketingOptIn ? { marketingOptIn: true } : {}),
    };
    await setDoc(doc(db, "users", user.uid), newUser);
    setAppUser(newUser);
  }

  async function toggleFavorite(adId: string) {
    if (!firebaseUser || !appUser) return;
    const isFavorite = appUser.favoriteAdIds?.includes(adId) ?? false;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      favoriteAdIds: isFavorite ? arrayRemove(adId) : arrayUnion(adId),
    });
    setAppUser((prev) =>
      prev
        ? {
            ...prev,
            favoriteAdIds: isFavorite
              ? (prev.favoriteAdIds ?? []).filter((id) => id !== adId)
              : [...(prev.favoriteAdIds ?? []), adId],
          }
        : prev,
    );
  }

  async function toggleFollow(sellerId: string) {
    if (!firebaseUser || !appUser) return;
    const isFollowing = appUser.followingIds?.includes(sellerId) ?? false;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      followingIds: isFollowing ? arrayRemove(sellerId) : arrayUnion(sellerId),
    });
    setAppUser((prev) =>
      prev
        ? {
            ...prev,
            followingIds: isFollowing
              ? (prev.followingIds ?? []).filter((id) => id !== sellerId)
              : [...(prev.followingIds ?? []), sellerId],
          }
        : prev,
    );
    if (!isFollowing && sellerId !== firebaseUser.uid) {
      await createNotification({
        recipientId: sellerId,
        type: "new_follower",
        actorId: firebaseUser.uid,
        actorName: appUser.displayName,
      });
    }
  }

  async function updateProfile(input: {
    displayName?: string;
    bio?: string;
    photoURL?: string;
    city?: string;
    phone?: string;
    deliveryAddress?: string;
    notifyOnNewMessage?: boolean;
    marketingOptIn?: boolean;
    categories?: string[];
    categoryNote?: string;
    language?: LanguageCode;
    theme?: ThemePreference;
    sectionVisibility?: ProfileSectionVisibility;
    followersVisible?: boolean;
    businessName?: string;
    impressum?: string;
    taxId?: string;
    withdrawalPolicy?: string;
    businessTerms?: string;
  }) {
    if (!firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), { ...input });
    setAppUser((prev) => (prev ? { ...prev, ...input } : prev));
  }

  async function toggleBlockUser(uid: string) {
    if (!firebaseUser || !appUser) return;
    const isBlocked = appUser.blockedUserIds?.includes(uid) ?? false;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      blockedUserIds: isBlocked ? arrayRemove(uid) : arrayUnion(uid),
    });
    setAppUser((prev) =>
      prev
        ? {
            ...prev,
            blockedUserIds: isBlocked
              ? (prev.blockedUserIds ?? []).filter((id) => id !== uid)
              : [...(prev.blockedUserIds ?? []), uid],
          }
        : prev,
    );
  }

  async function hideConversations(conversationIds: string[]) {
    if (!firebaseUser || conversationIds.length === 0) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      hiddenConversationIds: arrayUnion(...conversationIds),
    });
    setAppUser((prev) =>
      prev
        ? {
            ...prev,
            hiddenConversationIds: [
              ...new Set([...(prev.hiddenConversationIds ?? []), ...conversationIds]),
            ],
          }
        : prev,
    );
  }

  async function reauthenticate(currentPassword?: string) {
    if (!firebaseUser) throw new Error("No authenticated user");
    const isGoogleUser = firebaseUser.providerData.some((p) => p.providerId === "google.com");
    if (isGoogleUser) {
      await reauthenticateWithPopup(firebaseUser, new GoogleAuthProvider());
      return;
    }
    if (!currentPassword || !firebaseUser.email) {
      throw new Error("Aktuelles Passwort erforderlich");
    }
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
  }

  async function changeEmail(newEmail: string, currentPassword: string) {
    if (!firebaseUser) throw new Error("No authenticated user");
    await reauthenticate(currentPassword);
    await verifyBeforeUpdateEmail(firebaseUser, newEmail);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!firebaseUser) throw new Error("No authenticated user");
    await reauthenticate(currentPassword);
    await updatePassword(firebaseUser, newPassword);
  }

  async function deleteAccount(currentPassword?: string) {
    if (!firebaseUser) throw new Error("No authenticated user");
    await reauthenticate(currentPassword);
    await deleteDoc(doc(db, "users", firebaseUser.uid));
    await deleteUser(firebaseUser);
  }

  async function addGalleryPhoto(url: string) {
    if (!firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      galleryUrls: arrayUnion(url),
    });
    setAppUser((prev) =>
      prev ? { ...prev, galleryUrls: [...(prev.galleryUrls ?? []), url] } : prev,
    );
  }

  async function removeGalleryPhoto(url: string) {
    if (!firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      galleryUrls: arrayRemove(url),
    });
    setAppUser((prev) =>
      prev
        ? { ...prev, galleryUrls: (prev.galleryUrls ?? []).filter((u) => u !== url) }
        : prev,
    );
  }

  const value: AuthContextValue = {
    firebaseUser,
    appUser,
    loading,
    needsProfile: !loading && !!firebaseUser && !appUser,
    needsActivation: !loading && !!firebaseUser && !!appUser && !emailVerified,
    emailVerified,
    resendVerificationEmail,
    refreshEmailVerified,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    completeProfile,
    toggleFavorite,
    toggleFollow,
    toggleBlockUser,
    hideConversations,
    updateProfile,
    addGalleryPhoto,
    removeGalleryPhoto,
    reauthenticate,
    changeEmail,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
