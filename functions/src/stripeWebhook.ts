import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { clearProStatus, syncProStatusFromSubscription } from "./proSubscription";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const stripe = new Stripe(stripeSecretKey.value());

    let event: Stripe.Event;
    try {
      const signature = req.headers["stripe-signature"];
      if (!signature || Array.isArray(signature)) {
        throw new Error("Missing stripe-signature header");
      }
      event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value());
    } catch (err) {
      console.error("Stripe webhook signature verification failed", err);
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    const db = getFirestore();

    // Idempotency: if this event was already processed, .create() throws
    // (doc already exists) and we treat that as a harmless duplicate delivery.
    try {
      await db.collection("stripeWebhookEvents").doc(event.id).create({
        type: event.type,
        receivedAt: new Date(),
      });
    } catch {
      res.status(200).send("already processed");
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const uid = session.client_reference_id;
          if (uid && session.customer && session.subscription) {
            await db
              .collection("users")
              .doc(uid)
              .update({
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
              });
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const uid = subscription.metadata?.uid;
          if (uid) {
            await syncProStatusFromSubscription(db, uid, subscription);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const uid = subscription.metadata?.uid;
          if (uid) {
            await clearProStatus(db, uid);
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
          const subscriptionId =
            typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id;
          if (subscriptionId) {
            const stripe2 = new Stripe(stripeSecretKey.value());
            const subscription = await stripe2.subscriptions.retrieve(subscriptionId);
            const uid = subscription.metadata?.uid;
            if (uid) {
              // Informational only — Stripe's own retry schedule will either
              // recover (subscription.updated back to active) or exhaust into
              // subscription.deleted, so Pro perks are not revoked here.
              await db.collection("users").doc(uid).update({ proStatus: "past_due" });
            }
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error(`Error handling Stripe webhook event ${event.type}`, err);
      res.status(500).send("Internal error handling event");
      return;
    }

    res.status(200).send("ok");
  },
);
