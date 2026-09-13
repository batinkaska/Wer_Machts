import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { contactMessageEmailHtml, passwordResetEmailHtml, verificationEmailHtml } from "./emailTemplate";

export { confirmPaymentStatus, createPaymentIntent } from "./stripe";

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");

const SENDER = "Wer Macht <info@wermacht.app>";
const SUPPORT_INBOX = "info@wermacht.app";
const VERIFY_URL = "https://wermacht.app/email-bestaetigen";
const RESEND_URL = "https://wermacht.app/konto-aktivieren";
const RESET_PASSWORD_URL = "https://wermacht.app/passwort-zuruecksetzen";

async function sendViaResend(params: {
  to: string;
  subject: string;
  html: string;
  apiKey: string;
  replyTo?: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SENDER,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError("internal", `Resend-Fehler: ${errorText}`);
  }
}

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
