import type { MetadataRoute } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL, LOCALES } from "@/lib/site";

const STATIC_PATHS = ["", "/popular", "/random", "/collections"];
const PALETTES_PER_SITEMAP = 5000;

function alternates(path: string) {
  return Object.fromEntries(
    LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
}

export async function generateSitemaps() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const rows = await db
      .select({ id: palettes.id })
      .from(palettes)
      .where(eq(palettes.status, "published"));
    const total = rows.length;
    const groups = Math.max(1, Math.ceil(total / PALETTES_PER_SITEMAP));
    const ids = [{ id: 0 }];
    for (let i = 0; i < groups; i++) ids.push({ id: i + 1 });
    return ids;
  } catch {
    return [{ id: 0 }, { id: 1 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: number | string;
}): Promise<MetadataRoute.Sitemap> {
  // Next passes the URL segment as a string, so a `=== 0` compare with a
  // number would always fail. Normalize before routing.
  const numId = typeof id === "string" ? Number(id) : id;

  if (numId === 0) {
    const entries: MetadataRoute.Sitemap = [];
    for (const path of STATIC_PATHS) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}${path}`,
          lastModified: new Date(),
          changeFrequency: path === "" ? "daily" : "weekly",
          priority: path === "" ? 1 : 0.7,
          alternates: { languages: alternates(path) },
        });
      }
    }
    return entries;
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const offset = (numId - 1) * PALETTES_PER_SITEMAP;
    const published = await db
      .select({
        slug: palettes.slug,
        publishedAt: palettes.publishedAt,
      })
      .from(palettes)
      .where(eq(palettes.status, "published"))
      .limit(PALETTES_PER_SITEMAP)
      .offset(offset);

    const entries: MetadataRoute.Sitemap = [];
    for (const p of published) {
      const lastModified = p.publishedAt
        ? new Date(p.publishedAt)
        : new Date();
      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}/palette/${p.slug}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.8,
          alternates: { languages: alternates(`/palette/${p.slug}`) },
        });
      }
    }
    return entries;
  } catch {
    return [];
  }
}
