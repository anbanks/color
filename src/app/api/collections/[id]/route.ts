import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { collections, collectionPalettes, palettes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Verify ownership
  const col = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, session.user.id)))
    .limit(1);

  if (col.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Get palettes in collection
  const items = await db
    .select({
      id: palettes.id,
      slug: palettes.slug,
      colors: palettes.colors,
      likesCount: palettes.likesCount,
    })
    .from(collectionPalettes)
    .innerJoin(palettes, eq(collectionPalettes.paletteId, palettes.id))
    .where(eq(collectionPalettes.collectionId, id));

  const formatted = items.map((p) => ({
    ...p,
    colors: JSON.parse(p.colors) as string[],
  }));

  return Response.json({ collection: col[0], palettes: formatted });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    action: "add" | "remove";
    paletteId: string;
  };

  if (!body.action || !body.paletteId) {
    return Response.json({ error: "action and paletteId required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Verify ownership
  const col = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, session.user.id)))
    .limit(1);

  if (col.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add") {
    const existing = await db
      .select()
      .from(collectionPalettes)
      .where(
        and(
          eq(collectionPalettes.collectionId, id),
          eq(collectionPalettes.paletteId, body.paletteId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(collectionPalettes).values({
        id: createId(),
        collectionId: id,
        paletteId: body.paletteId,
      });
    }
  } else {
    await db
      .delete(collectionPalettes)
      .where(
        and(
          eq(collectionPalettes.collectionId, id),
          eq(collectionPalettes.paletteId, body.paletteId)
        )
      );
  }

  return Response.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Verify ownership
  const col = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, session.user.id)))
    .limit(1);

  if (col.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Delete collection (cascade deletes collection_palettes)
  await db.delete(collections).where(eq(collections.id, id));

  return Response.json({ success: true });
}
