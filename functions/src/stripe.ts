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
  providerName: string;
  amount: number;
  status: string;
  paymentStatus?: string;
  stripePaymentIntentId?: string;
  supportAmount?: number;
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

  // A bid already marked paid must never have its payment state touched again —
  // this is what protects against a stray double-click or a second open tab
  // silently resetting a completed payment back to "pending".
  if (bid.paymentStatus === "paid") {
    throw new HttpsError("failed-precondition", "Diese Zahlung wurde bereits abgeschlossen.");
  }

  if (!bid.amount || bid.amount <= 0) {
    throw new HttpsError("failed-precondition", "Ungültiger Betrag.");
  }

  // The voluntary support contribution is capped at the service amount itself —
  // a generous-but-sane bound since the payer still sees and authorizes the
  // final total themselves in the Stripe payment form before anything is charged.
  const rawSupportAmount = Number(request.data?.supportAmount) || 0;
  const supportAmount = Math.max(0, Math.min(rawSupportAmount, bid.amount));

  const stripe = new Stripe(stripeSecretKey.value());
  const amount = Math.round((bid.amount + supportAmount) * 100);

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
    const created = paymentIntent;
    await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(bidRef)).data() as BidDoc | undefined;
      if (fresh?.paymentStatus === "paid") {
        // Lost the race against a payment that just succeeded elsewhere — leave it alone.
        return;
      }
      tx.update(bidRef, {
        stripePaymentIntentId: created.id,
        paymentStatus: "pending",
        supportAmount,
      });
    });
  }

  return { clientSecret: paymentIntent.client_secret };
});

export const cancelDeal = onCall({ secrets: [stripeSecretKey] }, async (request) => {
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

  // Either party to the deal may cancel it — matches who is already allowed to
  // delete the bid document itself (see firestore.rules). Reverting the ad's
  // status back to "open" requires the Admin SDK since only the ad owner may
  // normally write to their own ad, and the canceling party is often the
  // *other* side of the deal.
  if (uid !== bid.providerId && uid !== ad.ownerId) {
    throw new HttpsError("permission-denied", "Du bist an diesem Angebot nicht beteiligt.");
  }

  // A settled deal is never canceled this way — it can only be hidden from a
  // user's own list (see MyBidsPage), never destroyed, since it's the other
  // party's real payment record too.
  if (bid.paymentStatus === "paid") {
    throw new HttpsError("failed-precondition", "Diese Zahlung wurde bereits abgeschlossen.");
  }

  if (bid.stripePaymentIntentId) {
    const stripe = new Stripe(stripeSecretKey.value());
    try {
      await stripe.paymentIntents.cancel(bid.stripePaymentIntentId);
    } catch {
      // Already canceled, already expired, or never left "requires_payment_method" —
      // none of that matters here since no money can move from an intent we're
      // abandoning anyway. Best-effort cleanup, never blocks the cancellation.
    }
  }

  if (bid.status === "accepted") {
    await adRef.update({ status: "open", updatedAt: FieldValue.serverTimestamp() });
  }
  await bidRef.delete();

  return { canceled: true };
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
  const wasAlreadyPaid = bid.paymentStatus === "paid";
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

  if (!wasAlreadyPaid) {
    // The payer already sees an on-screen confirmation immediately — this
    // notification (and its email) is for the recipient, who finds out
    // asynchronously that the money has arrived.
    const recipientId = uid === bid.providerId ? ad.ownerId : bid.providerId;
    if (recipientId !== uid) {
      await db.collection("notifications").add({
        recipientId,
        type: "payment_confirmed",
        actorId: uid,
        actorName: uid === bid.providerId ? ad.ownerName : bid.providerName,
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
