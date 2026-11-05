import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { onBidWritten, onMessageCreated } from "./bidNotificationTriggers";
import { sendViaResend } from "./email";
import { contactMessageEmailHtml, passwordResetEmailHtml, verificationEmailHtml } from "./emailTemplate";
import { enforceRateLimit } from "./rateLimit";

export { cancelDeal, confirmPaymentStatus, createPaymentIntent } from "./stripe";
export { createProBillingPortalSession, createProCheckoutSession, setFeaturedAd } from "./proSubscription";
export { stripeWebhook } from "./stripeWebhook";
export { onBankDetailsWritten, onNotificationCreated } from "./notificationEmails";
export { onBidWritten, onMessageCreated };
export { onUserWritten } from "./publicProfiles";

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");

const SUPPORT_INBOX = "info@wermacht.app";
const VERIFY_URL = "https://wermacht.app/email-bestaetigen";
const RESEND_URL = "https://wermacht.app/konto-aktivieren";
const RESET_PASSWORD_URL = "https://wermacht.app/passwort-zuruecksetzen";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sendVerificationEmail = onCall({ secrets: [resendApiKey] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const user = await getAuth().getUser(uid);
  if (!user.email) {
    throw new HttpsError("failed-precondition", "Für dieses Konto ist keine E-Mail-Adresse hinterlegt.");
  }
  if (user.emailVerified) {
    return { alreadySent: false, alreadyVerified: true };
  }

  const rawLink = await getAuth().generateEmailVerificationLink(user.email, {
    url: VERIFY_URL,
  });
  const oobCode = new URL(rawLink).searchParams.get("oobCode");
  const link = `${VERIFY_URL}?mode=verifyEmail&oobCode=${oobCode}`;

  const html = verificationEmailHtml({ name: user.displayName ?? "", link, resendUrl: RESEND_URL });

  await sendViaResend({
    to: user.email,
    subject: "Bestätige deine E-Mail-Adresse für Wer Macht",
    html,
    apiKey: resendApiKey.value(),
  });

  return { alreadySent: true, alreadyVerified: false };
});

export const sendPasswordResetEmail = onCall({ secrets: [resendApiKey] }, async (request) => {
  const email = request.data?.email;
  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "E-Mail-Adresse fehlt.");
  }

  let rawLink: string;
  try {
    rawLink = await getAuth().generatePasswordResetLink(email, { url: RESET_PASSWORD_URL });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") {
      // Don't reveal whether an account exists for this email.
      return { sent: true };
    }
    throw err;
  }

  const oobCode = new URL(rawLink).searchParams.get("oobCode");
  const link = `${RESET_PASSWORD_URL}?mode=resetPassword&oobCode=${oobCode}`;

  const html = passwordResetEmailHtml({ link });

  await sendViaResend({
    to: email,
    subject: "Setze dein Passwort für Wer Macht zurück",
    html,
    apiKey: resendApiKey.value(),
  });

  return { sent: true };
});

export const sendContactMessage = onCall({ secrets: [resendApiKey] }, async (request) => {
  const data = request.data ?? {};
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  // Honeypot: real users never fill this hidden field. Bots that do get a
  // fake success without us actually sending anything.
  const honeypot = typeof data.website === "string" ? data.website.trim() : "";

  if (honeypot) {
    return { sent: true };
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new HttpsError("invalid-argument", "Bitte gib eine gültige E-Mail-Adresse an.");
  }
  if (!message || message.length < 5) {
    throw new HttpsError("invalid-argument", "Bitte gib eine Nachricht ein.");
  }
  if (message.length > 5000) {
    throw new HttpsError("invalid-argument", "Deine Nachricht ist zu lang.");
  }

  // This is the one unauthenticated onCall function in the project (a contact
  // form has to be), so it's the one most exposed to scripted spam beyond
  // what the honeypot already catches.
  await enforceRateLimit({
    bucket: "contact",
    key: email,
    maxPerWindow: 3,
    windowMs: 60 * 60 * 1000,
  });

  const html = contactMessageEmailHtml({ name, email, subject, message });

  await sendViaResend({
    to: SUPPORT_INBOX,
    subject: subject ? `Kontaktformular: ${subject}` : "Neue Nachricht über das Kontaktformular",
    html,
    apiKey: resendApiKey.value(),
    replyTo: email,
  });

  return { sent: true };
});

// Reviews go through this callable (Firestore rules deny direct writes) so we
// can verify the reviewer actually shared a real conversation with the
// reviewee first — otherwise anyone could post a fake rating for any account,
// undermining the one trust signal the whole marketplace relies on.
export const submitReview = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Du musst angemeldet sein.");
  }

  const data = request.data ?? {};
  const revieweeId = typeof data.revieweeId === "string" ? data.revieweeId : "";
  const conversationId = typeof data.conversationId === "string" ? data.conversationId : "";
  const adId = typeof data.adId === "string" ? data.adId : undefined;
  const rating = data.rating;
  const comment = typeof data.comment === "string" ? data.comment.trim() : "";

  if (!revieweeId || revieweeId === uid) {
    throw new HttpsError("invalid-argument", "Ungültiger Bewertungsempfänger.");
  }
  if (!conversationId) {
    throw new HttpsError("invalid-argument", "conversationId fehlt.");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpsError("invalid-argument", "Ungültige Bewertung.");
  }
  if (comment.length > 1000) {
    throw new HttpsError("invalid-argument", "Kommentar ist zu lang.");
  }

  const db = getFirestore();

  // Proof of a real interaction: at least one message in ANY conversation
  // between the two of them — not scoped to the given conversationId, since
  // the public-profile review flow uses a synthetic "profile_..." id that
  // never has a real message behind it even for two users who genuinely
  // messaged each other about an ad. Single-field query (array-contains on
  // participantIds, avoids a composite index) — filtered further in code.
  const messagesSnap = await db
    .collection("messages")
    .where("participantIds", "array-contains", uid)
    .limit(200)
    .get();
  const hasSharedConversation = messagesSnap.docs.some((doc) => {
    const participantIds = doc.data().participantIds as string[] | undefined;
    return participantIds?.includes(uid) && participantIds?.includes(revieweeId);
  });
  if (!hasSharedConversation) {
    throw new HttpsError("failed-precondition", "Keine gemeinsame Unterhaltung mit dieser Person gefunden.");
  }

  const existingSnap = await db
    .collection("reviews")
    .where("conversationId", "==", conversationId)
    .where("reviewerId", "==", uid)
    .limit(10)
    .get();
  if (existingSnap.docs.some((doc) => doc.data().revieweeId === revieweeId)) {
    throw new HttpsError("already-exists", "Du hast diese Person für diese Unterhaltung bereits bewertet.");
  }

  const reviewerSnap = await db.collection("users").doc(uid).get();
  const reviewerName = (reviewerSnap.data()?.displayName as string | undefined) ?? "";

  await db.collection("reviews").add({
    conversationId,
    ...(adId ? { adId } : {}),
    revieweeId,
    reviewerId: uid,
    reviewerName,
    rating,
    ...(comment ? { comment } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
