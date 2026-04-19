// Thin wrapper around the Resend API. The API key is stored as a
// Cloudflare Worker secret (RESEND_API_KEY) and configured via the
// admin settings page or `wrangler secret put`.
//
// If no key is configured, send() returns { ok: false } silently so
// the app keeps working without email capability.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface SendInput {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(
  apiKey: string | undefined,
  { to, subject, html, from }: SendInput
): Promise<SendResult> {
  if (!apiKey) return { ok: false, error: "No RESEND_API_KEY configured" };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || "Color Grid <noreply@colorgrid.co>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, error: data.message || `Resend ${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
