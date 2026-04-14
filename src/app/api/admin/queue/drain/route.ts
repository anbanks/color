import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

const RATE_KEY = "queue:publish_per_run";
const LAST_RUN_KEY = "queue:last_run";
const DEFAULT_RATE = 5;

export async function POST() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  let rate = DEFAULT_RATE;
  try {
    const stored = await env.CACHE.get(RATE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) rate = parsed;
  } catch {}

  const approved = await db
    .select()
    .from(palettes)
    .where(eq(palettes.status, "approved"))
    .orderBy(palettes.createdAt)
    .limit(rate);

  for (const p of approved) {
    await db
      .update(palettes)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(palettes.id, p.id));
  }

  try {
    await env.CACHE.delete("palettes:trending");
    await env.CACHE.delete("palettes:popular");
    await env.CACHE.put(LAST_RUN_KEY, new Date().toISOString());
  } catch {}

  return Response.json({ published: approved.length, rate });
}
