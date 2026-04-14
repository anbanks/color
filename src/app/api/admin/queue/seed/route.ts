import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";

// Bulk-move all currently published palettes back to "approved" so the
// publish cron drains them gradually. Useful once when bootstrapping the
// drip-publishing workflow on an existing dataset.
export async function POST() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const result = await db
    .update(palettes)
    .set({ status: "approved", publishedAt: null })
    .where(eq(palettes.status, "published"));

  try {
    await env.CACHE.delete("palettes:trending");
    await env.CACHE.delete("palettes:popular");
  } catch {}

  return Response.json({
    moved: (result as { meta?: { changes?: number } }).meta?.changes ?? null,
  });
}

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const rows = await db
    .select({
      status: palettes.status,
      count: sql<number>`count(*)`,
    })
    .from(palettes)
    .groupBy(palettes.status);

  return Response.json({ rows });
}
