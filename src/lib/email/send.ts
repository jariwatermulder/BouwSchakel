import "server-only";

/**
 * E-mailverzending via Resend (HTTP-API).
 *
 * Zolang RESEND_API_KEY niet is ingesteld, wordt er niets verstuurd maar blijft
 * de app werken (er wordt alleen gewaarschuwd). Aanroepers vangen fouten af,
 * zodat een mislukte mail nooit de hoofdactie laat falen.
 * Zie docs/EMAIL_SETUP.md.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "ZZP Connect <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      `[email] Geen RESEND_API_KEY ingesteld — e-mail niet verzonden aan ${message.to} ("${message.subject}").`,
    );
    return;
  }

  const html = message.html ?? basisTemplate(message.subject, message.text);

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `E-mail versturen mislukt (${res.status}): ${body.slice(0, 300)}`,
    );
  }
}

/** Escape voor veilige HTML-interpolatie. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const URL_RE = /(https?:\/\/[^\s]+)/;

/**
 * Eenvoudige, gebrande HTML-mail. Detecteert een eventuele link in de tekst en
 * toont die als knop; de rest wordt als alinea's weergegeven.
 */
function basisTemplate(titel: string, tekst: string): string {
  const match = tekst.match(URL_RE);
  const link = match?.[1];
  const zonderLink = link ? tekst.replace(link, "").trim() : tekst;

  const alineas = zonderLink
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1e293b;">${esc(
          p,
        ).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  const knop = link
    ? `<p style="margin:8px 0 0;"><a href="${esc(
        link,
      )}" style="display:inline-block;background:#f59e0b;color:#0b1220;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px;">Openen</a></p>
       <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">${esc(
         link,
       )}</p>`
    : "";

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f7fa;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0b1220;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:800;">ZZP <span style="color:#f59e0b;">Connect</span></span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:18px;color:#0b1220;">${esc(titel)}</h1>
          ${alineas}
          ${knop}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">Je ontvangt deze e-mail omdat je een account hebt bij ZZP Connect. Voorkeuren aanpassen kan in je instellingen.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
