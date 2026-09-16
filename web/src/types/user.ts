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
