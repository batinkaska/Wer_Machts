import { createHash } from "crypto";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Simple fixed-window rate limiter backed by a Firestore collection that only
 * this Admin SDK code ever touches (no client rules needed — anything not
 * explicitly matched in firestore.rules is denied by default).
 *
 * Not exact (a burst right at a window boundary can slip through), but that's
 * an acceptable tradeoff for stopping casual spam/abuse without adding real
 * infrastructure (Redis, Cloud Armor, etc.) for a site at this scale.
 */
export async function enforceRateLimit(params: {
  bucket: string;
  key: string;
  maxPerWindow: number;
  windowMs: number;
}) {
  const { bucket, key, maxPerWindow, windowMs } = params;
  const docId = createHash("sha256").update(key.toLowerCase()).digest("hex");
  const ref = getFirestore().collection("rateLimits").doc(`${bucket}_${docId}`);

  await getFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.data() as { windowStart?: number; count?: number } | undefined;

    if (data?.windowStart && now - data.windowStart < windowMs) {
      if ((data.count ?? 0) >= maxPerWindow) {
        throw new HttpsError("resource-exhausted", "Zu viele Anfragen. Bitte versuche es später erneut.");
      }
      tx.set(ref, { windowStart: data.windowStart, count: (data.count ?? 0) + 1 });
    } else {
      tx.set(ref, { windowStart: now, count: 1 });
    }
  });
}
