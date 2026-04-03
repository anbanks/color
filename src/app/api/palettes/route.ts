import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

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
