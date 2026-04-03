import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { likes, palettes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: paletteId } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Check if already liked
  const existing = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, session.user.id), eq(likes.paletteId, paletteId)))
    .limit(1);

  let liked: boolean;

  if (existing.length > 0) {
    // Unlike
    await db.delete(likes).where(eq(likes.id, existing[0].id));
    await db
      .update(palettes)
      .set({ likesCount: sql`${palettes.likesCount} - 1` })
      .where(eq(palettes.id, paletteId));
    liked = false;
  } else {
    // Like
    await db.insert(likes).values({
      id: createId(),
      userId: session.user.id,
      paletteId,
    });
    await db
      .update(palettes)
      .set({ likesCount: sql`${palettes.likesCount} + 1` })
      .where(eq(palettes.id, paletteId));
    liked = true;
  }

  // Get updated count
  const updated = await db
    .select({ likesCount: palettes.likesCount })
    .from(palettes)
    .where(eq(palettes.id, paletteId))
    .limit(1);

  return Response.json({
    liked,
    count: updated[0]?.likesCount ?? 0,
  });
}
