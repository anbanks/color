import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL } from "@/lib/site";

const PALETTES_PER_SITEMAP = 5000;

// sitemapindex referenced by robots.txt. Next's generateSitemaps splits the
// payload into /sitemap/{id}.xml; this file aggregates those URLs so Google
// Search Console has a single entry point to submit.
export async function GET() {
  let total = 0;
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const rows = await db
      .select({ id: palettes.id })
      .from(palettes)
      .where(eq(palettes.status, "published"));
    total = rows.length;
  } catch {
    total = 0;
  }
  const groups = Math.max(1, Math.ceil(total / PALETTES_PER_SITEMAP));
  const ids = [0];
  for (let i = 0; i < groups; i++) ids.push(i + 1);

  const lastmod = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ids
  .map(
    (id) =>
      `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`
  )
  .join("\n")}
</sitemapindex>
`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
