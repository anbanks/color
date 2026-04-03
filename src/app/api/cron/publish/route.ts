import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Get up to 5 approved palettes (oldest first)
  const approved = await db
    .select()
    .from(palettes)
    .where(eq(palettes.status, "approved"))
    .orderBy(palettes.createdAt)
    .limit(5);

  if (approved.length === 0) {
    return Response.json({ published: 0, message: "No palettes in queue" });
  }

  // Publish each palette
  for (const palette of approved) {
    await db
      .update(palettes)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(palettes.id, palette.id));
  }

  // Invalidate KV cache
  try {
    await env.CACHE.delete("palettes:trending");
    await env.CACHE.delete("palettes:popular");
  } catch {
    // KV may not be available in dev
  }

  return Response.json({
    published: approved.length,
    ids: approved.map((p) => p.id),
  });
}
