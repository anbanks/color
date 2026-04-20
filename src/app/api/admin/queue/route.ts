import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";

const RATE_KEY = "queue:publish_per_run";
const AI_RATE_KEY = "queue:ai_generate_per_run";
const LAST_RUN_KEY = "queue:last_run";
const AI_LAST_RUN_KEY = "queue:ai_last_run";
const DEFAULT_RATE = 5;
const DEFAULT_AI_RATE = 2;

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

  // Count approved palettes with complete translations (9 locales)
  let readyToPublish = 0;
  if (map["approved"]) {
    const readyRows = await db
      .select({ n: sql<number>`count(*)` })
      .from(palettes)
      .where(sql`${palettes.status} = 'approved' AND ${palettes.id} IN (
        SELECT ${paletteContent.paletteId} FROM ${paletteContent}
        GROUP BY ${paletteContent.paletteId} HAVING count(*) >= 9
      )`);
    readyToPublish = readyRows[0]?.n || 0;
  }

  let rate = DEFAULT_RATE;
  let aiRate = DEFAULT_AI_RATE;
  let lastRun: string | null = null;
  let aiLastRun: string | null = null;
  try {
    const r = await env.CACHE.get(RATE_KEY);
    if (r) { const p = parseInt(r, 10); if (Number.isFinite(p) && p > 0) rate = p; }
    const ar = await env.CACHE.get(AI_RATE_KEY);
    if (ar) { const p = parseInt(ar, 10); if (Number.isFinite(p) && p > 0) aiRate = p; }
    lastRun = await env.CACHE.get(LAST_RUN_KEY);
    aiLastRun = await env.CACHE.get(AI_LAST_RUN_KEY);
  } catch {}

  return Response.json({
    counts: {
      pending: map["pending"] || 0,
      approved: map["approved"] || 0,
      published: map["published"] || 0,
      rejected: map["rejected"] || 0,
      readyToPublish,
    },
    rate,
    aiRate,
    lastRun,
    aiLastRun,
  });
}
