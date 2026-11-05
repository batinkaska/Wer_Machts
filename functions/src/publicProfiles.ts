import { getFirestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
// users/{uid} holds private data (email, phone, address, Stripe IDs, favorites,
// blocked users, …) and is readable only by its owner. Everything other people
// are allowed to see is mirrored into publicProfiles/{uid}, which is public but
// never writable by clients. Keep in sync with the PublicProfile type in
// web/src/types/user.ts.
export const PUBLIC_PROFILE_FIELDS = [
  "displayName",
  "photoURL",
  "bio",
  "accountType",
  "businessName",
  "impressum",
  "taxId",
  "withdrawalPolicy",
  "businessTerms",
  "galleryUrls",
  "emailVerified",
  "phoneVerified",
  "city",
  "categories",
  "categoryNote",
  "followingIds",
  "followersVisible",
  "sectionVisibility",
  "isPro",
  "createdAt",
] as const;

export function pickPublicProfile(data: FirebaseFirestore.DocumentData): Record<string, unknown> {
  const profile: Record<string, unknown> = {};
  for (const field of PUBLIC_PROFILE_FIELDS) {
    if (data[field] !== undefined) {
      profile[field] = data[field];
    }
  }
  return profile;
}

export const onUserWritten =onDocumentWritten("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const ref = getFirestore().collection("publicProfiles").doc(uid);
  const after = event.data?.after;

  if (!after?.exists) {
    await ref.delete();
    return;
  }

  // Full overwrite (no merge) so a field removed from users/{uid} also
  // disappears from the public mirror.
  await ref.set(pickPublicProfile(after.data() ?? {}));
});
