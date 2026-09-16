import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

export type ProPlan = "monthly" | "semiannual" | "yearly";

// Stripe Price IDs for the 3 Pro plans. Test-mode and live-mode Prices are
// different objects with different IDs, so these must be swapped when moving
// this feature from test to live (same discipline as the Stripe secret keys).
export const PRO_PRICE_IDS: Record<ProPlan, string> = {
  monthly: "price_1UGCZ62LkHXtQQUF7LHCRncI",
  semiannual: "price_1UGCZ72LkHXtQQUFPaN5wIw2",
  yearly: "price_1UGCZ72LkHXtQQUFQUJQDw0u",
};

const PRICE_ID_TO_PLAN: Record<string, ProPlan> = Object.fromEntries(
  Object.entries(PRO_PRICE_IDS).map(([plan, priceId]) => [priceId, plan as ProPlan]),
);

export function planForPriceId(priceId: string | undefined): ProPlan | undefined {
  return priceId ? PRICE_ID_TO_PLAN[priceId] : undefined;
}

interface UserDoc {
  email: string;
  displayName: string;
  isPro?: boolean;
  proTrialUsed?: boolean;
  stripeCustomerId?: string;
  featuredAdId?: string | null;
}

async function ensureStripeCustomer(
  stripe: Stripe,
  db: FirebaseFirestore.Firestore,
  uid: string,
  user: UserDoc,
): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName,
    metadata: { uid },
  });
  await db.collection("users").doc(uid).update({ stripeCustomerId: customer.id });
  return customer.id;
}

export const createProCheckoutSession = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const plan = request.data?.plan as ProPlan | undefined;
  if (!plan || !PRO_PRICE_IDS[plan]) {
    throw new HttpsError("invalid-argument", "Ungültiger Plan.");
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new HttpsError("not-found", "Nutzer nicht gefunden.");
  }
  const user = userSnap.data() as UserDoc;

  if (user.isPro) {
    throw new HttpsError("failed-precondition", "Du hast bereits Pro.");
  }

  const stripe = new Stripe(stripeSecretKey.value());
  const stripeCustomerId = await ensureStripeCustomer(stripe, db, uid, user);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    client_reference_id: uid,
    line_items: [{ price: PRO_PRICE_IDS[plan], quantity: 1 }],
    subscription_data: {
      trial_period_days: user.proTrialUsed ? undefined : 30,
      metadata: { uid },
    },
    success_url: "https://wermacht.app/settings?pro=success",
    cancel_url: "https://wermacht.app/settings?pro=cancelled",
  });

  return { url: session.url };
});

export const createProBillingPortalSession = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const db = getFirestore();
  const userSnap = await db.collection("users").doc(uid).get();
  const user = userSnap.data() as UserDoc | undefined;
  if (!user?.stripeCustomerId) {
    throw new HttpsError("failed-precondition", "Kein Stripe-Kundenkonto gefunden.");
  }

  const stripe = new Stripe(stripeSecretKey.value());
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: "https://wermacht.app/settings",
  });

  return { url: session.url };
});

export const setFeaturedAd = onCall({}, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const adId = request.data?.adId as string | null | undefined;
  if (adId !== null && typeof adId !== "string") {
    throw new HttpsError("invalid-argument", "adId ist ungültig.");
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const user = userSnap.data() as UserDoc | undefined;
    if (!user?.isPro) {
      throw new HttpsError("permission-denied", "Nur für Pro-Mitglieder verfügbar.");
    }

    const previousFeaturedId = user.featuredAdId;
    if (previousFeaturedId && previousFeaturedId !== adId) {
      const prevRef = db.collection("ads").doc(previousFeaturedId);
      const prevSnap = await tx.get(prevRef);
      if (prevSnap.exists) {
        tx.update(prevRef, { isFeatured: false });
      }
    }

    if (adId) {
      const adRef = db.collection("ads").doc(adId);
      const adSnap = await tx.get(adRef);
      if (!adSnap.exists) {
        throw new HttpsError("not-found", "Auftrag nicht gefunden.");
      }
      if (adSnap.data()?.ownerId !== uid) {
        throw new HttpsError("permission-denied", "Das ist nicht dein Auftrag.");
      }
      tx.update(adRef, { isFeatured: true });
    }

    tx.update(userRef, { featuredAdId: adId ?? null });
  });

  return { featuredAdId: adId ?? null };
});

// Called by the Stripe webhook, not exposed as a callable — kept in this
// module since it owns the plan/price mapping the webhook needs.
export async function syncProStatusFromSubscription(
  db: FirebaseFirestore.Firestore,
  uid: string,
  subscription: Stripe.Subscription,
) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = planForPriceId(priceId);
  const status = subscription.status;
  const isPro = status === "trialing" || status === "active";

  const update: FirebaseFirestore.UpdateData<UserDoc> & Record<string, unknown> = {
    isPro,
    proStatus: status,
    proPlan: plan ?? null,
    proCurrentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
    proTrialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    proCancelAtPeriodEnd: subscription.cancel_at_period_end,
    stripeSubscriptionId: subscription.id,
  };
  // Once a subscription has ever gone through a trial, permanently mark the
  // trial as used so a cancel-and-resubscribe can't claim a second free month.
  if (status === "trialing") {
    update.proTrialUsed = true;
  }

  await db.collection("users").doc(uid).update(update);
}

export async function clearProStatus(db: FirebaseFirestore.Firestore, uid: string) {
  const userRef = db.collection("users").doc(uid);
  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const user = userSnap.data() as UserDoc | undefined;
    if (!user) return;

    if (user.featuredAdId) {
      const adRef = db.collection("ads").doc(user.featuredAdId);
      const adSnap = await tx.get(adRef);
      if (adSnap.exists) {
        tx.update(adRef, { isFeatured: false });
      }
    }

    tx.update(userRef, {
      isPro: false,
      proStatus: "canceled",
      featuredAdId: null,
    });
  });
}
