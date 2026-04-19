import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TagsClient } from "@/components/admin/tags-client";

async function getTagStats() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const rows = await db
      .select({ tags: palettes.tags, status: palettes.status })
      .from(palettes)
      .where(eq(palettes.status, "published"));

    const tagCount: Record<string, number> = {};
    rows.forEach((r) => {
      if (!r.tags) return;
      try {
        const tags = JSON.parse(r.tags) as string[];
        tags.forEach((t) => {
          tagCount[t] = (tagCount[t] || 0) + 1;
        });
      } catch {}
    });

    // Also count approved (in queue)
    const queueRows = await db
      .select({ tags: palettes.tags })
      .from(palettes)
      .where(eq(palettes.status, "approved"));

    const queueCount: Record<string, number> = {};
    queueRows.forEach((r) => {
      if (!r.tags) return;
      try {
        const tags = JSON.parse(r.tags) as string[];
        tags.forEach((t) => {
          queueCount[t] = (queueCount[t] || 0) + 1;
        });
      } catch {}
    });

    return { published: tagCount, queued: queueCount };
  } catch {
    return { published: {}, queued: {} };
  }
}

export default async function TagsPage() {
  const stats = await getTagStats();
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Tags</h1>
      <p className="text-sm text-gray-500 dark:text-white/40 mb-6">
        Color and collection tag coverage across published and queued palettes.
      </p>
      <TagsClient published={stats.published} queued={stats.queued} />
    </div>
  );
}
