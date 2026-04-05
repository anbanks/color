import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, sql, eq, lt, and } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import { generateSlug } from "@/lib/generate-slug";

const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const sort = request.nextUrl.searchParams.get("sort") || "new";
  const cursor = request.nextUrl.searchParams.get("cursor");
  const limit = PAGE_SIZE;

  let results;

  const published = eq(palettes.status, "published");

  switch (sort) {
    case "popular":
      if (cursor) {
        const cursorLikes = parseInt(cursor);
        results = await db.select().from(palettes)
          .where(and(published, lt(palettes.likesCount, cursorLikes)))
          .orderBy(desc(palettes.likesCount))
          .limit(limit);
      } else {
        results = await db.select().from(palettes)
          .where(published)
          .orderBy(desc(palettes.likesCount))
          .limit(limit);
      }
      break;

    case "random":
      results = await db.select().from(palettes)
        .where(published)
        .orderBy(sql`RANDOM()`)
        .limit(limit);
      break;

    case "new":
    default:
      if (cursor) {
        const cursorDate = new Date(parseInt(cursor) * 1000);
        results = await db.select().from(palettes)
          .where(and(published, lt(palettes.createdAt, cursorDate)))
          .orderBy(desc(palettes.createdAt))
          .limit(limit);
      } else {
        results = await db.select().from(palettes)
          .where(published)
          .orderBy(desc(palettes.createdAt))
          .limit(limit);
      }
      break;
  }

  const formatted = results.map((p) => ({
    id: p.id,
    slug: p.slug,
    colors: JSON.parse(p.colors) as string[],
    likesCount: p.likesCount,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    tags: p.tags ? (JSON.parse(p.tags) as string[]) : [],
  }));

  // Build next cursor
  let nextCursor: string | null = null;
  if (results.length === limit) {
    const last = results[results.length - 1];
    if (sort === "popular") {
      nextCursor = String(last.likesCount);
    } else if (sort !== "random" && last.createdAt) {
      nextCursor = String(Math.floor(new Date(last.createdAt).getTime() / 1000));
    }
  }

  return Response.json({
    palettes: formatted,
    nextCursor,
    hasMore: results.length === limit,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { colors?: string[]; tags?: string[] };

  const validHex = /^#[0-9a-fA-F]{6}$/;
  if (!body.colors || body.colors.length !== 4 || body.colors.some((c) => !validHex.test(c))) {
    return Response.json({ error: "4 valid HEX colors required" }, { status: 400 });
  }

  const tags = (body.tags || []).slice(0, 5);

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const id = createId();
  const slug = generateSlug(body.colors);

  const existing = await db
    .select({ id: palettes.id })
    .from(palettes)
    .where(eq(palettes.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "This exact palette already exists" }, { status: 409 });
  }

  await db.insert(palettes).values({
    id,
    slug,
    colors: JSON.stringify(body.colors),
    tags: tags.length > 0 ? JSON.stringify(tags) : null,
    status: "pending",
    authorId: session.user.id,
  });

  return Response.json({ id, slug }, { status: 201 });
}
