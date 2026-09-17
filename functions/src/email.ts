const SENDER = "Wer Macht <info@wermacht.app>";

export async function sendViaResend(params: {
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
    throw new Error(`Resend-Fehler: ${errorText}`);
  }
}
