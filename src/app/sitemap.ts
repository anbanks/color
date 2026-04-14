import type { MetadataRoute } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL, LOCALES } from "@/lib/site";

const STATIC_PATHS = ["", "/popular", "/random", "/collections"];

function alternates(path: string) {
  return Object.fromEntries(
    LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const published = await db
      .select({ slug: palettes.slug, publishedAt: palettes.publishedAt })
      .from(palettes)
      .where(eq(palettes.status, "published"));

    for (const p of published) {
      const lastModified = p.publishedAt ? new Date(p.publishedAt) : new Date();
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
  } catch {
    // D1 not available in dev
  }

  return entries;
}
