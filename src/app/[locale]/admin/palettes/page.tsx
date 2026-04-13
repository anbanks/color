import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { PaletteTableWithFilters } from "@/components/admin/palette-table-filters";
import { getDictionary, type Locale } from "@/lib/i18n";

async function getAllPalettes() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const r = await db.select().from(palettes).orderBy(desc(palettes.createdAt)).limit(200);

    const statusCounts = await db
      .select({ status: palettes.status, count: sql<number>`count(*)` })
      .from(palettes)
      .groupBy(palettes.status);

    const counts: Record<string, number> = {};
    for (const row of statusCounts) counts[row.status] = row.count;

    return {
      palettes: r.map((p) => ({
        id: p.id, slug: p.slug, status: p.status,
        colors: JSON.parse(p.colors) as string[],
        likesCount: p.likesCount,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      })),
      counts,
    };
  } catch { return { palettes: [], counts: {} }; }
}

export default async function PalettesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  const { palettes, counts } = await getAllPalettes();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">{t.admin.palettesTitle}</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/40 mt-1">{total} {t.admin.palettesTotal}</p>
      </div>
      <PaletteTableWithFilters
        palettes={palettes}
        counts={{ all: total, ...counts }}
      />
    </div>
  );
}
