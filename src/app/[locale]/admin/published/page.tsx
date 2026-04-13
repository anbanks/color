import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PaletteTable } from "@/components/admin/palette-table";

async function getPublished() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const r = await db.select().from(palettes).where(eq(palettes.status, "published")).orderBy(desc(palettes.likesCount)).limit(100);
    return r.map((p) => ({
      id: p.id, slug: p.slug, status: p.status,
      colors: JSON.parse(p.colors) as string[],
      likesCount: p.likesCount,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch { return []; }
}

export default async function PublishedPage() {
  const data = await getPublished();
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Published Palettes</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/40 mt-1">{data.length} published palettes (sorted by likes)</p>
      </div>
      <PaletteTable palettes={data} showActions={false} />
    </div>
  );
}
