import type { Timestamp } from "firebase/firestore";
import type { LanguageCode } from "../i18n";
import type { ThemePreference } from "../theme";

export type ProfileVisibility = "public" | "private";
export type AccountType = "private" | "business";
export type ProPlan = "monthly" | "semiannual" | "yearly";
export type ProStatus = "trialing" | "active" | "past_due" | "canceled";

export interface ProfileSectionVisibility {
  bio?: ProfileVisibility;
  categories?: ProfileVisibility;
  photos?: ProfileVisibility;
  completedWork?: ProfileVisibility;
}

export interface AppUser {
  uid: string;
  email: string;
  emailVerified?: boolean;
  displayName: string;
  photoURL?: string;
  bio?: string;
  accountType?: AccountType;
  businessName?: string;
  impressum?: string;
  taxId?: string;
  withdrawalPolicy?: string;
  businessTerms?: string;
  galleryUrls?: string[];
  phone?: string;
  phoneVerified?: boolean;
  city?: string;
  deliveryAddress?: string;
  notifyOnNewMessage?: boolean;
  marketingOptIn?: boolean;
  categories?: string[];
  categoryNote?: string;
  language?: LanguageCode;
  theme?: ThemePreference;
  favoriteAdIds?: string[];
  followingIds?: string[];
  blockedUserIds?: string[];
  followersVisible?: boolean;
  hiddenConversationIds?: string[];
  sectionVisibility?: ProfileSectionVisibility;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isPro?: boolean;
  proPlan?: ProPlan;
  proStatus?: ProStatus;
  proCurrentPeriodEnd?: Timestamp;
  proTrialEnd?: Timestamp;
  proTrialUsed?: boolean;
  proCancelAtPeriodEnd?: boolean;
  featuredAdId?: string | null;
  createdAt: Timestamp;
}

/**
 * The subset of a user's data that anyone may read — mirrored from `users/{uid}`
 * into `publicProfiles/{uid}` by the `onUserWritten` Cloud Function. The full
 * `users/{uid}` document (email, phone, address, Stripe IDs, favorites, …) is
 * readable only by its owner. Keep this list in sync with PUBLIC_PROFILE_FIELDS
 * in functions/src/publicProfiles.ts.
 */
export type PublicProfile = Pick<
  AppUser,
  | "uid"
  | "displayName"
  | "photoURL"
  | "bio"
  | "accountType"
  | "businessName"
  | "impressum"
  | "taxId"
  | "withdrawalPolicy"
  | "businessTerms"
  | "galleryUrls"
  | "emailVerified"
  | "phoneVerified"
  | "city"
  | "categories"
  | "categoryNote"
  | "followingIds"
  | "followersVisible"
  | "sectionVisibility"
  | "isPro"
  | "createdAt"
>;
