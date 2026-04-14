import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";

const RATE_KEY = "queue:publish_per_run";
const LAST_RUN_KEY = "queue:last_run";
const DEFAULT_RATE = 5;

type Env = { CACHE: KVNamespace };

async function getRate(env: Env): Promise<number> {
  try {
    const stored = await env.CACHE.get(RATE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) return parsed;
  } catch {}
  return DEFAULT_RATE;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const rate = await getRate(env as unknown as Env);

  const approved = await db
    .select()
    .from(palettes)
    .where(eq(palettes.status, "approved"))
    .orderBy(palettes.createdAt)
    .limit(rate);

  if (approved.length === 0) {
    try {
      await env.CACHE.put(LAST_RUN_KEY, new Date().toISOString());
    } catch {}
    return Response.json({ published: 0, rate, message: "No palettes in queue" });
  }

  for (const palette of approved) {
    await db
      .update(palettes)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(palettes.id, palette.id));
  }

  try {
    await env.CACHE.delete("palettes:trending");
    await env.CACHE.delete("palettes:popular");
    await env.CACHE.put(LAST_RUN_KEY, new Date().toISOString());
  } catch {}

  return Response.json({
    published: approved.length,
    rate,
    ids: approved.map((p) => p.id),
  });
}
