import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { collections, collectionPalettes, palettes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const results = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, session.user.id))
    .orderBy(desc(collections.createdAt));

  // Get palette count for each collection
  const withCounts = await Promise.all(
    results.map(async (col) => {
      const items = await db
        .select({ paletteId: collectionPalettes.paletteId })
        .from(collectionPalettes)
        .where(eq(collectionPalettes.collectionId, col.id));

      return {
        id: col.id,
        name: col.name,
        count: items.length,
        createdAt: col.createdAt,
      };
    })
  );

  return Response.json(withCounts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string };
  if (!body.name?.trim()) {
    return Response.json({ error: "Name required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const id = createId();
  await db.insert(collections).values({
    id,
    name: body.name.trim(),
    userId: session.user.id,
  });

  return Response.json({ id, name: body.name.trim() }, { status: 201 });
}
