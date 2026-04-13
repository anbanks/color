import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PaletteTable } from "@/components/admin/palette-table";

async function getAllPalettes() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const r = await db.select().from(palettes).orderBy(desc(palettes.createdAt)).limit(100);
    return r.map((p) => ({
      id: p.id, slug: p.slug, status: p.status,
      colors: JSON.parse(p.colors) as string[],
      likesCount: p.likesCount,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch { return []; }
}

export default async function AllPalettesPage() {
  const data = await getAllPalettes();
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">All Palettes</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/40 mt-1">{data.length} palettes total</p>
      </div>
      <PaletteTable palettes={data} />
    </div>
  );
}
