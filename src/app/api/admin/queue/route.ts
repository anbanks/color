import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";

const RATE_KEY = "queue:publish_per_run";
const LAST_RUN_KEY = "queue:last_run";
const DEFAULT_RATE = 5;

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const counts = await db
    .select({
      status: palettes.status,
      count: sql<number>`count(*)`,
    })
    .from(palettes)
    .groupBy(palettes.status);

  const map: Record<string, number> = {};
  for (const row of counts) map[row.status] = row.count;

  let rate = DEFAULT_RATE;
  let lastRun: string | null = null;
  try {
    const r = await env.CACHE.get(RATE_KEY);
    if (r) {
      const parsed = parseInt(r, 10);
      if (Number.isFinite(parsed) && parsed > 0) rate = parsed;
    }
    lastRun = await env.CACHE.get(LAST_RUN_KEY);
  } catch {}

  return Response.json({
    counts: {
      pending: map["pending"] || 0,
      approved: map["approved"] || 0,
      published: map["published"] || 0,
      rejected: map["rejected"] || 0,
    },
    rate,
    lastRun,
  });
}
