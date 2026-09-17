import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { sendViaResend } from "./email";
import {
  bankDetailsAdminAlertHtml,
  bidAcceptedEmailHtml,
  bidPlacedEmailHtml,
  bidRejectedEmailHtml,
  newMessageEmailHtml,
  paymentConfirmedEmailHtml,
} from "./emailTemplate";

const resendApiKey = defineSecret("RESEND_API_KEY");
const SITE_URL = "https://wermacht.app";
const ADMIN_EMAIL = "info@wermacht.app";

interface NotificationDoc {
  recipientId: string;
  type: string;
  actorId: string;
  actorName: string;
  adId?: string;
  adTitle?: string;
  conversationId?: string;
  bidId?: string;
}

interface UserDoc {
  email?: string;
  displayName?: string;
  notifyOnNewMessage?: boolean;
}

// Every in-app notification (see web/src/lib/notify.ts) lands here first, so this
// is the single place that turns any of them into an email — no client-side
// changes needed when a new notification type should also send mail.
export const onNotificationCreated = onDocumentCreated(
  { document: "notifications/{notificationId}", secrets: [resendApiKey] },
  async (event) => {
    const notification = event.data?.data() as NotificationDoc | undefined;
    if (!notification) return;

    const db = getFirestore();
    const recipientSnap = await db.collection("users").doc(notification.recipientId).get();
    const recipient = recipientSnap.data() as UserDoc | undefined;
    if (!recipient?.email) return;

    const apiKey = resendApiKey.value();
    const name = recipient.displayName ?? "";

    try {
      switch (notification.type) {
        case "bid_placed": {
          if (!notification.adId || !notification.adTitle) return;
          await sendViaResend({
            to: recipient.email,
            subject: `Neues Angebot für „${notification.adTitle}“`,
            html: bidPlacedEmailHtml({
              recipientName: name,
              actorName: notification.actorName,
              adTitle: notification.adTitle,
              url: `${SITE_URL}/ads/${notification.adId}`,
            }),
            apiKey,
          });
          return;
        }
        case "bid_accepted": {
          if (!notification.adId || !notification.adTitle) return;
          const url = notification.bidId
            ? `${SITE_URL}/ads/${notification.adId}/payment?bidId=${notification.bidId}`
            : `${SITE_URL}/ads/${notification.adId}`;
          await sendViaResend({
            to: recipient.email,
            subject: `Dein Angebot für „${notification.adTitle}“ wurde angenommen`,
            html: bidAcceptedEmailHtml({ recipientName: name, adTitle: notification.adTitle, url }),
            apiKey,
          });
          return;
        }
        case "bid_rejected": {
          if (!notification.adId || !notification.adTitle) return;
          await sendViaResend({
            to: recipient.email,
            subject: `Dein Angebot für „${notification.adTitle}“ wurde abgelehnt`,
            html: bidRejectedEmailHtml({
              recipientName: name,
              adTitle: notification.adTitle,
              url: `${SITE_URL}/ads`,
            }),
            apiKey,
          });
          return;
        }
        case "message": {
          // Respects the existing "Nachrichten von Nutzern" toggle in Settings
          // (AppUser.notifyOnNewMessage), which defaults to on when unset.
          if (recipient.notifyOnNewMessage === false) return;
          if (!notification.conversationId) return;
          await sendViaResend({
            to: recipient.email,
            subject: `Neue Nachricht von ${notification.actorName}`,
            html: newMessageEmailHtml({
              recipientName: name,
              actorName: notification.actorName,
              url: `${SITE_URL}/messages/${notification.conversationId}`,
            }),
            apiKey,
          });
          return;
        }
        case "payment_confirmed": {
          if (!notification.adId || !notification.adTitle) return;
          const url = notification.bidId
            ? `${SITE_URL}/ads/${notification.adId}/payment?bidId=${notification.bidId}`
            : `${SITE_URL}/ads/${notification.adId}`;
          const bidSnap = notification.bidId ? await db.collection("bids").doc(notification.bidId).get() : undefined;
          const amount = (bidSnap?.data()?.amount as number | undefined) ?? 0;
          await sendViaResend({
            to: recipient.email,
            subject: `Zahlung für „${notification.adTitle}“ ist eingegangen`,
            html: paymentConfirmedEmailHtml({ recipientName: name, adTitle: notification.adTitle, amount, url }),
            apiKey,
          });
          return;
        }
        default:
          return;
      }
    } catch (err) {
      // Email delivery is a best-effort enhancement on top of the already-created
      // in-app notification — a Resend outage must never surface as a failed
      // trigger execution (Firestore would otherwise retry it indefinitely).
      console.error("onNotificationCreated: failed to send email", err);
    }
  },
);

// Lets Batin know as soon as someone enters their payout bank details, since
// payouts are currently manual (see CLAUDE.md) — without this he'd have no way
// to know a payout is ready other than checking the Firebase Console himself.
export const onBankDetailsWritten = onDocumentCreated(
  { document: "bids/{bidId}/private/bankDetails", secrets: [resendApiKey] },
  async (event) => {
    const details = event.data?.data() as { iban?: string; accountHolderName?: string } | undefined;
    if (!details) return;

    const bidId = event.params.bidId;
    const db = getFirestore();
    const bidSnap = await db.collection("bids").doc(bidId).get();
    const bid = bidSnap.data() as
      | { adTitle?: string; amount?: number; providerId?: string; adId?: string }
      | undefined;
    if (!bid) return;

    let recipientEmail = "";
    try {
      const adSnap = bid.adId ? await db.collection("ads").doc(bid.adId).get() : undefined;
      const ad = adSnap?.data() as { adKind?: string; ownerId?: string } | undefined;
      const recipientUid = ad?.adKind === "biete" ? ad.ownerId : bid.providerId;
      if (recipientUid) {
        const userSnap = await db.collection("users").doc(recipientUid).get();
        recipientEmail = (userSnap.data()?.email as string | undefined) ?? "";
      }
    } catch {
      // Best-effort enrichment only — the alert still goes out without it.
    }

    try {
      await sendViaResend({
        to: ADMIN_EMAIL,
        subject: `Bankverbindung hinterlegt: „${bid.adTitle ?? "Auftrag"}“`,
        html: bankDetailsAdminAlertHtml({
          userName: details.accountHolderName || recipientEmail || "Unbekannt",
          userEmail: recipientEmail,
          adTitle: bid.adTitle ?? "",
          amount: bid.amount ?? 0,
          bidId,
        }),
        apiKey: resendApiKey.value(),
      });
    } catch (err) {
      console.error("onBankDetailsWritten: failed to send admin alert", err);
    }
  },
);
