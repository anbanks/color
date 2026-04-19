import type { MetadataRoute } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL, LOCALES } from "@/lib/site";

const STATIC_PATHS = ["", "/popular", "/random", "/collections"];

// Top tag combos matching ColorHunt's category structure for SEO coverage
const TAG_PAGES = [
  "pastel","purple","pink","blue","green","summer","sunset","maroon","earth",
  "orange","warm","red","fall","yellow","light","dark","black","neon","teal",
  "grey","white","brown","navy","gold","halloween","cream","beige","vintage",
  "retro","spring","wedding","cold","nature","peach","sage","winter","sky",
  "sea","gradient","rainbow","mint","christmas","coffee","space","night",
  "happy","skin","kids","food",
  "blue-purple","blue-yellow","blue-orange","blue-green","blue-pink",
  "blue-brown","blue-grey","blue-black","blue-teal","blue-dark",
  "blue-mint","blue-navy","blue-white",
  "red-blue","red-green","red-yellow","red-purple","red-grey","red-brown",
  "red-black","red-orange","red-maroon",
  "pink-purple","pink-green","pink-brown","pink-orange","pink-blue-purple",
  "green-purple","green-yellow","green-grey","green-black",
  "brown-green","brown-orange","brown-grey",
  "black-white","black-red","black-purple","black-yellow","black-grey",
  "black-gold","black-brown",
  "pastel-blue","pastel-pink","pastel-purple","pastel-green","pastel-orange",
  "pastel-grey","pastel-brown",
  "dark-white","dark-green","dark-pink","dark-grey","dark-red",
  "orange-green","orange-yellow",
  "purple-grey","purple-navy","purple-orange",
  "navy-white","navy-pink",
  "beige-brown","beige-green",
  "sunset-yellow","warm-orange",
  "vintage-blue","vintage-red","vintage-green",
];
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
    for (const tag of TAG_PAGES) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}/palettes/${tag}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: { languages: alternates(`/palettes/${tag}`) },
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
