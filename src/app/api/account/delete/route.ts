import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users, likes, collections, collectionPalettes, accounts, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const userId = session.user.id;

  // Delete in dependency order
  await db.delete(likes).where(eq(likes.userId, userId));

  const userCollections = await db.select({ id: collections.id }).from(collections).where(eq(collections.userId, userId));
  for (const col of userCollections) {
    await db.delete(collectionPalettes).where(eq(collectionPalettes.collectionId, col.id));
  }
  await db.delete(collections).where(eq(collections.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  return Response.json({ deleted: true });
}
