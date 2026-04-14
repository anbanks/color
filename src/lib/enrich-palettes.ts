import { likes, collections, collectionPalettes } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { auth } from "@/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_SAVED_COLLECTION = "__saved__";

type Db = ReturnType<typeof getDb>;

export interface UserPaletteState {
  likedIds: Set<string>;
  savedIds: Set<string>;
}

export async function getUserPaletteState(
  db: Db,
  userId: string,
  paletteIds: string[]
): Promise<UserPaletteState> {
  if (paletteIds.length === 0) {
    return { likedIds: new Set(), savedIds: new Set() };
  }

  const likedRows = await db
    .select({ paletteId: likes.paletteId })
    .from(likes)
    .where(and(eq(likes.userId, userId), inArray(likes.paletteId, paletteIds)));

  const defaultCol = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.userId, userId), eq(collections.name, DEFAULT_SAVED_COLLECTION)))
    .limit(1);

  let savedRows: { paletteId: string }[] = [];
  if (defaultCol[0]) {
    savedRows = await db
      .select({ paletteId: collectionPalettes.paletteId })
      .from(collectionPalettes)
      .where(
        and(
          eq(collectionPalettes.collectionId, defaultCol[0].id),
          inArray(collectionPalettes.paletteId, paletteIds)
        )
      );
  }

  return {
    likedIds: new Set(likedRows.map((r) => r.paletteId)),
    savedIds: new Set(savedRows.map((r) => r.paletteId)),
  };
}

export async function getCurrentUserPaletteState(
  paletteIds: string[]
): Promise<UserPaletteState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { likedIds: new Set(), savedIds: new Set() };
  }
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  return getUserPaletteState(db, session.user.id, paletteIds);
}
