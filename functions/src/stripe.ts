import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

const ACTIVE_PAYMENT_INTENT_STATUSES = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
]);

interface BidDoc {
  adId: string;
  providerId: string;
  amount: number;
  status: string;
  stripePaymentIntentId?: string;
}

interface AdDoc {
  adKind: "biete" | "suche";
  ownerId: string;
  ownerName: string;
  title: string;
  status: string;
}

async function loadBidAndAd(db: FirebaseFirestore.Firestore, bidId: string) {
  const bidRef = db.collection("bids").doc(bidId);
  const bidSnap = await bidRef.get();
  if (!bidSnap.exists) {
    throw new HttpsError("not-found", "Angebot nicht gefunden.");
  }
  const bid = bidSnap.data() as BidDoc;

  const adRef = db.collection("ads").doc(bid.adId);
  const adSnap = await adRef.get();
  if (!adSnap.exists) {
    throw new HttpsError("not-found", "Auftrag nicht gefunden.");
  }
  const ad = adSnap.data() as AdDoc;

  return { bidRef, bid, adRef, ad };
}

function assertIsPayer(uid: string, bid: BidDoc, ad: AdDoc) {
  const payerId = ad.adKind === "biete" ? bid.providerId : ad.ownerId;
  if (uid !== payerId) {
    throw new HttpsError("permission-denied", "Du bist nicht zur Zahlung berechtigt.");
  }
}

export const createPaymentIntent = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const bidId = request.data?.bidId;
  if (!bidId || typeof bidId !== "string") {
    throw new HttpsError("invalid-argument", "bidId fehlt.");
  }

  const db = getFirestore();
  const { bidRef, bid, ad } = await loadBidAndAd(db, bidId);
  assertIsPayer(uid, bid, ad);

  if (!bid.amount || bid.amount <= 0) {
    throw new HttpsError("failed-precondition", "Ungültiger Betrag.");
  }

  const stripe = new Stripe(stripeSecretKey.value());
  const amount = Math.round(bid.amount * 100);

  let paymentIntent: Stripe.PaymentIntent | undefined;
  if (bid.stripePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(bid.stripePaymentIntentId);
    if (existing.status === "succeeded") {
      throw new HttpsError("failed-precondition", "Diese Zahlung wurde bereits abgeschlossen.");
    }
    if (ACTIVE_PAYMENT_INTENT_STATUSES.has(existing.status) && existing.amount === amount) {
      paymentIntent = existing;
    }
  }

  if (!paymentIntent) {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      metadata: { bidId, adId: bid.adId },
      automatic_payment_methods: { enabled: true },
    });
    await bidRef.update({ stripePaymentIntentId: paymentIntent.id, paymentStatus: "pending" });
  }

  return { clientSecret: paymentIntent.client_secret };
});

export const confirmPaymentStatus = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const bidId = request.data?.bidId;
  if (!bidId || typeof bidId !== "string") {
    throw new HttpsError("invalid-argument", "bidId fehlt.");
  }

  const db = getFirestore();
  const { bidRef, bid, adRef, ad } = await loadBidAndAd(db, bidId);
  assertIsPayer(uid, bid, ad);

  if (!bid.stripePaymentIntentId) {
    throw new HttpsError("failed-precondition", "Für dieses Angebot wurde keine Zahlung gestartet.");
  }

  const stripe = new Stripe(stripeSecretKey.value());
  const paymentIntent = await stripe.paymentIntents.retrieve(bid.stripePaymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return { paid: false, status: paymentIntent.status };
  }

  const wasAlreadyAccepted = bid.status === "accepted";
  await bidRef.update({ paymentStatus: "paid", paymentMethod: "card", status: "accepted" });

  if (!wasAlreadyAccepted) {
    await adRef.update({ status: "in_progress", updatedAt: FieldValue.serverTimestamp() });
    if (uid !== bid.providerId) {
      await db.collection("notifications").add({
        recipientId: bid.providerId,
        type: "bid_accepted",
        actorId: uid,
        actorName: ad.ownerName,
        adId: adRef.id,
        adTitle: ad.title,
        bidId,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }

  return { paid: true };
});
