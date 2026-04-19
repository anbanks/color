import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";

const SETTINGS_KEYS = ["RESEND_API_KEY", "RESEND_FROM_EMAIL"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const settings: Record<string, string> = {};

  for (const key of SETTINGS_KEYS) {
    const val = await env.CACHE.get(`settings:${key}`);
    settings[key] = val || "";
  }

  return Response.json({ settings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, string>;
  const { env } = await getCloudflareContext({ async: true });

  for (const key of SETTINGS_KEYS) {
    if (key in body) {
      const val = body[key]?.trim();
      if (val) {
        await env.CACHE.put(`settings:${key}`, val);
      } else {
        await env.CACHE.delete(`settings:${key}`);
      }
    }
  }

  return Response.json({ ok: true });
}
