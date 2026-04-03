import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import { generateSlug } from "@/lib/generate-slug";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const sort = request.nextUrl.searchParams.get("sort") || "trending";
  const limit = 20;

  let query;

  switch (sort) {
    case "popular":
      query = db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(desc(palettes.likesCount))
        .limit(limit);
      break;

    case "new":
      query = db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(desc(palettes.createdAt))
        .limit(limit);
      break;

    case "random":
      query = db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
      break;

    case "trending":
    default:
      query = db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(desc(palettes.likesCount), desc(palettes.createdAt))
        .limit(limit);
      break;
  }

  const results = await query;

  const formatted = results.map((p) => ({
    id: p.id,
    slug: p.slug,
    colors: JSON.parse(p.colors) as string[],
    likesCount: p.likesCount,
    tags: p.tags ? (JSON.parse(p.tags) as string[]) : [],
  }));

  return Response.json(formatted);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { colors?: string[]; tags?: string[] };

  // Validate colors
  const validHex = /^#[0-9a-fA-F]{6}$/;
  if (!body.colors || body.colors.length !== 4 || body.colors.some((c) => !validHex.test(c))) {
    return Response.json({ error: "4 valid HEX colors required" }, { status: 400 });
  }

  // Validate tags
  const tags = (body.tags || []).slice(0, 5);

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const id = createId();
  const slug = generateSlug(body.colors);

  // Check if slug already exists
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
