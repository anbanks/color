import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";

const RATE_KEY = "queue:publish_per_run";
const AI_RATE_KEY = "queue:ai_generate_per_run";

export async function POST(request: Request) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { rate?: number; aiRate?: number };
  const { env } = await getCloudflareContext({ async: true });

  if (body.rate != null) {
    const rate = Number(body.rate);
    if (!Number.isFinite(rate) || rate < 1 || rate > 100) {
      return Response.json({ error: "rate must be 1-100" }, { status: 400 });
    }
    await env.CACHE.put(RATE_KEY, String(Math.floor(rate)));
  }

  if (body.aiRate != null) {
    const aiRate = Number(body.aiRate);
    if (!Number.isFinite(aiRate) || aiRate < 1 || aiRate > 10) {
      return Response.json({ error: "aiRate must be 1-10" }, { status: 400 });
    }
    await env.CACHE.put(AI_RATE_KEY, String(Math.floor(aiRate)));
  }

  return Response.json({ ok: true });
}
