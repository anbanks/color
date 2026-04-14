import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { collections, collectionPalettes, palettes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

const DEFAULT_NAME = "__saved__";

type Db = ReturnType<typeof getDb>;

async function ensureDefault(db: Db, userId: string): Promise<string> {
  const existing = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.userId, userId), eq(collections.name, DEFAULT_NAME)))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const id = createId();
  await db.insert(collections).values({
    id,
    name: DEFAULT_NAME,
    userId,
  });
  return id;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const colId = await ensureDefault(db, session.user.id);

  const rows = await db
    .select({
      id: palettes.id,
      slug: palettes.slug,
      colors: palettes.colors,
      likesCount: palettes.likesCount,
    })
    .from(collectionPalettes)
    .innerJoin(palettes, eq(collectionPalettes.paletteId, palettes.id))
    .where(eq(collectionPalettes.collectionId, colId))
    .orderBy(desc(collectionPalettes.addedAt));

  return Response.json({
    palettes: rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      colors: JSON.parse(p.colors) as string[],
      likesCount: p.likesCount,
    })),
    ids: rows.map((p) => p.id),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { paletteId?: string };
  if (!body.paletteId) {
    return Response.json({ error: "paletteId required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const colId = await ensureDefault(db, session.user.id);

  const existing = await db
    .select({ id: collectionPalettes.id })
    .from(collectionPalettes)
    .where(
      and(
        eq(collectionPalettes.collectionId, colId),
        eq(collectionPalettes.paletteId, body.paletteId)
      )
    )
    .limit(1);

  if (existing[0]) {
    await db
      .delete(collectionPalettes)
      .where(eq(collectionPalettes.id, existing[0].id));
    return Response.json({ saved: false });
  }

  await db.insert(collectionPalettes).values({
    id: createId(),
    collectionId: colId,
    paletteId: body.paletteId,
  });

  return Response.json({ saved: true });
}
