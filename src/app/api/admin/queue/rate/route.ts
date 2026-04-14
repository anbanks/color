import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";

const RATE_KEY = "queue:publish_per_run";

export async function POST(request: Request) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { rate?: number };
  const rate = Number(body.rate);
  if (!Number.isFinite(rate) || rate < 1 || rate > 100) {
    return Response.json({ error: "rate must be 1-100" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.CACHE.put(RATE_KEY, String(Math.floor(rate)));

  return Response.json({ rate: Math.floor(rate) });
}
