import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { sendViaResend } from "./email";
import {
  type CancellationSummary,
  cancellationAdminAlertHtml,
  cancellationConfirmationEmailHtml,
} from "./emailTemplate";
import { enforceRateLimit } from "./rateLimit";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const resendApiKey = defineSecret("RESEND_API_KEY");

const ADMIN_INBOX = "info@wermacht.app";
const CONTRACT_NAME = "Wer Macht Pro";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatBerlin(date: Date, withTime: boolean): string {
  return date.toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/**
 * Backend of the legally required "Verträge hier kündigen" button (§ 312k BGB).
 * Deliberately works WITHOUT login — the law forbids making cancellation harder
 * than signing up. Abuse (someone canceling someone else's Pro) is contained by
 * only ever doing an ordinary cancellation at period end, which the real owner
 * is told about by email and can undo in the Stripe Billing Portal.
 *
 * The response is identical whether or not an account/subscription exists for
 * the given email, so this can't be used to probe which addresses have accounts.
 */
export const requestContractCancellation = onCall(
  { secrets: [stripeSecretKey, resendApiKey] },
  async (request) => {
    const data = request.data ?? {};
    const name = typeof data.name === "string" ? data.name.trim().slice(0, 200) : "";
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const kind = data.kind === "extraordinary" ? "extraordinary" : "ordinary";
    const reason = typeof data.reason === "string" ? data.reason.trim().slice(0, 2000) : "";
    const honeypot = typeof data.website === "string" ? data.website.trim() : "";

    const receivedAtDate = new Date();
    const receivedAt = formatBerlin(receivedAtDate, true);

    if (honeypot) {
      return { received: true, receivedAt };
    }
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new HttpsError("invalid-argument", "Bitte gib eine gültige E-Mail-Adresse an.");
    }
    if (kind === "extraordinary" && reason.length < 3) {
      throw new HttpsError("invalid-argument", "Bitte gib einen Grund für die außerordentliche Kündigung an.");
    }

    await enforceRateLimit({
      bucket: "cancellation",
      key: email,
      maxPerWindow: 5,
      windowMs: 60 * 60 * 1000,
    });

    const db = getFirestore();
    const recordRef = db.collection("contractCancellations").doc();
    await recordRef.set({
      name,
      email,
      contract: CONTRACT_NAME,
      kind,
      reason,
      receivedAt: FieldValue.serverTimestamp(),
      status: "received",
    });

    let uid: string | null = null;
    let effectiveDate: string | null = null;
    let subscriptionId: string | null = null;
    try {
      uid = (await getAuth().getUserByEmail(email)).uid;
    } catch {
      // No account for this email — handled manually via the admin alert.
    }

    if (uid) {
      const user = (await db.collection("users").doc(uid).get()).data();
      subscriptionId = (user?.stripeSubscriptionId as string | undefined) ?? null;
      if (subscriptionId) {
        try {
          const stripe = new Stripe(stripeSecretKey.value());
          const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });
          if (subscription.status === "trialing" || subscription.status === "active" || subscription.status === "past_due") {
            const endUnix = subscription.cancel_at ?? subscription.items.data[0]?.current_period_end;
            if (endUnix) {
              effectiveDate = formatBerlin(new Date(endUnix * 1000), false);
            }
          }
        } catch (err) {
          // Already canceled/ended subscription, or a Stripe hiccup — never block
          // the receipt itself; the admin alert flags it for manual follow-up.
          console.error("Stripe cancellation failed", err);
        }
      }
    }

    const summary: CancellationSummary = {
      name,
      email,
      contract: CONTRACT_NAME,
      kind,
      reason,
      receivedAt,
      effectiveDate,
    };

    let confirmationSent = false;
    try {
      await sendViaResend({
        to: email,
        subject: "Bestätigung deiner Kündigung – Wer Macht Pro",
        html: cancellationConfirmationEmailHtml(summary),
        apiKey: resendApiKey.value(),
        replyTo: ADMIN_INBOX,
      });
      confirmationSent = true;
    } catch (err) {
      console.error("Cancellation confirmation email failed", err);
    }

    try {
      await sendViaResend({
        to: ADMIN_INBOX,
        subject: effectiveDate ? "Kündigung eingegangen (automatisch verarbeitet)" : "Kündigung eingegangen – manuell prüfen",
        html: cancellationAdminAlertHtml(summary),
        apiKey: resendApiKey.value(),
        replyTo: email,
      });
    } catch (err) {
      console.error("Cancellation admin alert failed", err);
    }

    await recordRef.update({
      uid,
      subscriptionId,
      status: effectiveDate ? "subscription_canceled_at_period_end" : "needs_manual_review",
      confirmationSent,
    });

    return { received: true, receivedAt };
  },
);
