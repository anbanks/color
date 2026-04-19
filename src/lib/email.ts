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

// Reads the API key from KV (admin settings) first, falls back to env secret.
async function getApiKey(env: CloudflareEnv): Promise<string | undefined> {
  try {
    const fromKV = await env.CACHE.get("settings:RESEND_API_KEY");
    if (fromKV) return fromKV;
  } catch {}
  return env.RESEND_API_KEY;
}

async function getFromEmail(env: CloudflareEnv): Promise<string> {
  try {
    const fromKV = await env.CACHE.get("settings:RESEND_FROM_EMAIL");
    if (fromKV) return fromKV;
  } catch {}
  return "Color Grid <noreply@colorgrid.co>";
}

export async function sendEmail(
  env: CloudflareEnv,
  { to, subject, html, from }: SendInput
): Promise<SendResult> {
  const apiKey = await getApiKey(env);
  if (!apiKey) return { ok: false, error: "No RESEND_API_KEY configured" };

  const fromAddr = from || (await getFromEmail(env));

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddr,
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
