const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/wermacht-7764c.firebasestorage.app/o/email-assets%2Flogo.png?alt=media&token=9d222d09-6b70-4755-8481-01707faabee0";
const WORDMARK_URL =
  "https://firebasestorage.googleapis.com/v0/b/wermacht-7764c.firebasestorage.app/o/email-assets%2Fwordmark.png?alt=media&token=60553b6d-970a-4478-bda3-10d5bbf3a357";

export function verificationEmailHtml(params: { name: string; link: string; resendUrl: string }): string {
  const { name, link, resendUrl } = params;
  const greeting = name ? `Hallo ${escapeHtml(name)},` : "Hallo,";

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>E-Mail-Adresse bestätigen</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="height:6px;background-color:#5fac5e;line-height:6px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px 32px;text-align:center;">
                <img src="${LOGO_URL}" alt="" width="56" height="56" style="display:inline-block;vertical-align:middle;border-radius:10px;border:0;" />
                <img src="${WORDMARK_URL}" alt="Wer Macht" height="38" style="display:inline-block;vertical-align:middle;margin-left:12px;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;color:#374151;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 16px 0;">${greeting}</p>
                <p style="margin:0 0 24px 0;">
                  schön, dass du dabei bist! Bitte bestätige deine E-Mail-Adresse, damit du Aufträge
                  veröffentlichen und Angebote abgeben kannst.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;text-align:center;">
                <a href="${link}" style="display:inline-block;background-color:#5fac5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:9999px;">
                  E-Mail-Adresse bestätigen
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;color:#6b7280;font-size:13px;line-height:1.6;">
                <p style="margin:0 0 8px 0;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
                <p style="margin:0;word-break:break-all;"><a href="${link}" style="color:#5fac5e;">${link}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;text-align:center;border-top:1px solid #f0f0f0;">
                <p style="margin:16px 0 4px 0;color:#9ca3af;font-size:12px;">Link abgelaufen oder schon verwendet?</p>
                <a href="${resendUrl}" style="color:#5fac5e;font-size:12px;font-weight:600;">Neuen Bestätigungslink anfordern</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f0f0f0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                Falls du kein Konto bei Wer Macht erstellt hast, kannst du diese E-Mail ignorieren.<br />
                Fragen? Schreib uns an
                <a href="mailto:info@wermacht.app" style="color:#5fac5e;">info@wermacht.app</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function passwordResetEmailHtml(params: { link: string }): string {
  const { link } = params;

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Passwort zurücksetzen</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="height:6px;background-color:#5fac5e;line-height:6px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px 32px;text-align:center;">
                <img src="${LOGO_URL}" alt="" width="56" height="56" style="display:inline-block;vertical-align:middle;border-radius:10px;border:0;" />
                <img src="${WORDMARK_URL}" alt="Wer Macht" height="38" style="display:inline-block;vertical-align:middle;margin-left:12px;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;color:#374151;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 16px 0;">Hallo,</p>
                <p style="margin:0 0 24px 0;">
                  wir haben eine Anfrage erhalten, das Passwort für dein Wer Macht Konto
                  zurückzusetzen. Klicke auf den Button, um ein neues Passwort festzulegen.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;text-align:center;">
                <a href="${link}" style="display:inline-block;background-color:#5fac5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:9999px;">
                  Passwort zurücksetzen
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;color:#6b7280;font-size:13px;line-height:1.6;">
                <p style="margin:0 0 8px 0;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
                <p style="margin:0;word-break:break-all;"><a href="${link}" style="color:#5fac5e;">${link}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f0f0f0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert.<br />
                Fragen? Schreib uns an
                <a href="mailto:info@wermacht.app" style="color:#5fac5e;">info@wermacht.app</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function contactMessageEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const { name, email, subject, message } = params;

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Neue Kontaktanfrage</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="height:6px;background-color:#5fac5e;line-height:6px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px 32px;text-align:center;">
                <img src="${LOGO_URL}" alt="" width="56" height="56" style="display:inline-block;vertical-align:middle;border-radius:10px;border:0;" />
                <img src="${WORDMARK_URL}" alt="Wer Macht" height="38" style="display:inline-block;vertical-align:middle;margin-left:12px;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;color:#374151;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 16px 0;font-weight:600;">Neue Nachricht über das Kontaktformular</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;width:90px;vertical-align:top;">Name:</td>
                    <td style="padding:4px 0;">${escapeHtml(name) || "—"}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;vertical-align:top;">E-Mail:</td>
                    <td style="padding:4px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#5fac5e;">${escapeHtml(email)}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;vertical-align:top;">Betreff:</td>
                    <td style="padding:4px 0;">${escapeHtml(subject) || "—"}</td>
                  </tr>
                </table>
                <p style="margin:20px 0 4px 0;color:#6b7280;font-size:14px;">Nachricht:</p>
                <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;color:#9ca3af;font-size:12px;line-height:1.6;">
                Du kannst direkt auf diese E-Mail antworten, um ${escapeHtml(name) || "den Absender"} zu erreichen.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function emailShell(title: string, bodyRows: string): string {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="height:6px;background-color:#5fac5e;line-height:6px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px 32px;text-align:center;">
                <img src="${LOGO_URL}" alt="" width="56" height="56" style="display:inline-block;vertical-align:middle;border-radius:10px;border:0;" />
                <img src="${WORDMARK_URL}" alt="Wer Macht" height="38" style="display:inline-block;vertical-align:middle;margin-left:12px;border:0;" />
              </td>
            </tr>
            ${bodyRows}
            <tr>
              <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f0f0f0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                Du erhältst diese E-Mail, weil auf Wer Macht etwas für dich passiert ist.<br />
                Fragen? Schreib uns an
                <a href="mailto:info@wermacht.app" style="color:#5fac5e;">info@wermacht.app</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function textBlock(paragraphsHtml: string[]): string {
  return `<tr><td style="padding:16px 32px 0 32px;color:#374151;font-size:15px;line-height:1.6;">${paragraphsHtml
    .map((p) => `<p style="margin:0 0 16px 0;">${p}</p>`)
    .join("")}</td></tr>`;
}

function ctaButton(label: string, url: string): string {
  return `<tr><td style="padding:8px 32px 32px 32px;text-align:center;"><a href="${url}" style="display:inline-block;background-color:#5fac5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:9999px;">${escapeHtml(label)}</a></td></tr>`;
}

function greetingLine(name: string): string {
  return name ? `Hallo ${escapeHtml(name)},` : "Hallo,";
}

export function bidPlacedEmailHtml(params: {
  recipientName: string;
  actorName: string;
  adTitle: string;
  url: string;
}): string {
  const { recipientName, actorName, adTitle, url } = params;
  return emailShell(
    "Neues Angebot erhalten",
    textBlock([
      greetingLine(recipientName),
      `<strong>${escapeHtml(actorName)}</strong> hat ein Angebot für deinen Auftrag „${escapeHtml(adTitle)}“ abgegeben.`,
    ]) + ctaButton("Angebot ansehen", url),
  );
}

export function bidAcceptedEmailHtml(params: { recipientName: string; adTitle: string; url: string }): string {
  const { recipientName, adTitle, url } = params;
  return emailShell(
    "Angebot angenommen",
    textBlock([
      greetingLine(recipientName),
      `Gute Neuigkeiten! Dein Angebot für „${escapeHtml(adTitle)}“ wurde angenommen.`,
    ]) + ctaButton("Jetzt ansehen", url),
  );
}

export function bidRejectedEmailHtml(params: { recipientName: string; adTitle: string; url: string }): string {
  const { recipientName, adTitle, url } = params;
  return emailShell(
    "Angebot abgelehnt",
    textBlock([
      greetingLine(recipientName),
      `Dein Angebot für „${escapeHtml(adTitle)}“ wurde leider abgelehnt. Schau dich gerne nach weiteren Aufträgen um.`,
    ]) + ctaButton("Weitere Aufträge ansehen", url),
  );
}

export function newMessageEmailHtml(params: { recipientName: string; actorName: string; url: string }): string {
  const { recipientName, actorName, url } = params;
  return emailShell(
    "Neue Nachricht",
    textBlock([
      greetingLine(recipientName),
      `<strong>${escapeHtml(actorName)}</strong> hat dir eine Nachricht geschickt.`,
    ]) + ctaButton("Nachricht ansehen", url),
  );
}

export function paymentConfirmedEmailHtml(params: {
  recipientName: string;
  adTitle: string;
  amount: number;
  url: string;
}): string {
  const { recipientName, adTitle, amount, url } = params;
  return emailShell(
    "Zahlung eingegangen",
    textBlock([
      greetingLine(recipientName),
      `Die Zahlung in Höhe von <strong>${amount.toFixed(2)} €</strong> für „${escapeHtml(adTitle)}“ ist eingegangen.`,
    ]) + ctaButton("Details ansehen", url),
  );
}

export function bankDetailsAdminAlertHtml(params: {
  userName: string;
  userEmail: string;
  adTitle: string;
  amount: number;
  bidId: string;
}): string {
  const { userName, userEmail, adTitle, amount, bidId } = params;
  return emailShell(
    "Neue Bankverbindung hinterlegt",
    textBlock([
      `<strong>${escapeHtml(userName)}</strong>${userEmail ? ` (${escapeHtml(userEmail)})` : ""} hat seine Bankverbindung für die Auszahlung von <strong>${amount.toFixed(2)} €</strong> („${escapeHtml(adTitle)}“) hinterlegt.`,
      `Bid-ID: <code>${escapeHtml(bidId)}</code>. Die IBAN findest du in der Firebase Console unter <code>bids/${escapeHtml(bidId)}/private/bankDetails</code>.`,
    ]),
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
