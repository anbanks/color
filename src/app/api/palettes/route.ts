import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import { generateSlug } from "@/lib/generate-slug";
import { getCurrentUserPaletteState } from "@/lib/enrich-palettes";

const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const sort = request.nextUrl.searchParams.get("sort") || "new";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "0");
  const offset = page * PAGE_SIZE;

  const published = eq(palettes.status, "published");
  let results;

  switch (sort) {
    case "popular":
      results = await db.select().from(palettes)
        .where(published).orderBy(desc(palettes.likesCount))
        .limit(PAGE_SIZE).offset(offset);
      break;
    case "random":
      results = await db.select().from(palettes)
        .where(published).orderBy(sql`RANDOM()`)
        .limit(PAGE_SIZE);
      break;
    case "new":
    default:
      results = await db.select().from(palettes)
        .where(published).orderBy(desc(palettes.publishedAt))
        .limit(PAGE_SIZE).offset(offset);
      break;
  }

  const formatted = results.map((p) => ({
    id: p.id,
    slug: p.slug,
    colors: JSON.parse(p.colors) as string[],
    likesCount: p.likesCount,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
  }));

  const { likedIds, savedIds } = await getCurrentUserPaletteState(formatted.map((p) => p.id));
  const withState = formatted.map((p) => ({
    ...p,
    liked: likedIds.has(p.id),
    saved: savedIds.has(p.id),
  }));

  return Response.json({
    palettes: withState,
    page,
    hasMore: results.length === PAGE_SIZE,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const rateLimitKey = `ratelimit:palette:${session?.user?.id || request.headers.get("cf-connecting-ip") || "anon"}`;
  const current = await env.CACHE.get(rateLimitKey);
  if (current && Number(current) >= 10) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  await env.CACHE.put(rateLimitKey, String((Number(current) || 0) + 1), { expirationTtl: 3600 });

  const body = (await request.json()) as { colors?: string[]; tags?: string[] };
  const validHex = /^#[0-9a-fA-F]{6}$/;
  if (!body.colors || body.colors.length !== 4 || body.colors.some((c) => !validHex.test(c))) {
    return Response.json({ error: "4 valid HEX colors required" }, { status: 400 });
  }

  const tags = (body.tags || []).slice(0, 5);
  const db = getDb(env.DB);
  const id = createId();
  const slug = generateSlug(body.colors);

  const existing = await db.select({ id: palettes.id }).from(palettes).where(eq(palettes.slug, slug)).limit(1);
  if (existing.length > 0) {
    return Response.json({ error: "This exact palette already exists" }, { status: 409 });
  }

  await db.insert(palettes).values({
    id, slug,
    colors: JSON.stringify(body.colors),
    tags: tags.length > 0 ? JSON.stringify(tags) : null,
    status: "pending",
    authorId: session.user.id,
  });

  return Response.json({ id, slug }, { status: 201 });
}
