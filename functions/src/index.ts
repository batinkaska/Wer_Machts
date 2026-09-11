import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { verificationEmailHtml } from "./emailTemplate";

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");

const SENDER = "Wer Macht <info@wermacht.app>";
const VERIFY_URL = "https://wermacht.app/email-bestaetigen";
const RESEND_URL = "https://wermacht.app/konto-aktivieren";

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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SENDER,
      to: user.email,
      subject: "Bestätige deine E-Mail-Adresse für Wer Macht",
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError("internal", `Resend-Fehler: ${errorText}`);
  }

  return { alreadySent: true, alreadyVerified: false };
});
