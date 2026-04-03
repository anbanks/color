import type { MetadataRoute } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://color.anbanks.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const published = await db
      .select({ slug: palettes.slug, publishedAt: palettes.publishedAt })
      .from(palettes)
      .where(eq(palettes.status, "published"));

    for (const p of published) {
      entries.push({
        url: `${BASE_URL}/palette/${p.slug}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // D1 not available in dev
  }

  return entries;
}
