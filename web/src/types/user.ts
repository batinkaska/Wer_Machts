import type { Timestamp } from "firebase/firestore";
import type { LanguageCode } from "../i18n";
import type { ThemePreference } from "../theme";

export type ProfileVisibility = "public" | "private";

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
  createdAt: Timestamp;
}
