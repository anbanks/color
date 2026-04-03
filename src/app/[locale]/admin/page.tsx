import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { StatsCards } from "@/components/admin/stats-cards";
import { ModerationCard } from "@/components/admin/moderation-card";

async function getStats() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const counts = await db
    .select({
      status: palettes.status,
      count: sql<number>`count(*)`,
    })
    .from(palettes)
    .groupBy(palettes.status);

  const map: Record<string, number> = {};
  for (const row of counts) {
    map[row.status] = row.count;
  }

  return {
    pending: map["pending"] || 0,
    approved: map["approved"] || 0,
    published: map["published"] || 0,
    rejected: map["rejected"] || 0,
  };
}

async function getPendingPalettes() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const results = await db
    .select()
    .from(palettes)
    .where(eq(palettes.status, "pending"))
    .orderBy(palettes.createdAt)
    .limit(50);

  return results.map((p) => ({
    id: p.id,
    colors: JSON.parse(p.colors) as string[],
    status: p.status,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));
}

export default async function AdminPage() {
  let stats = { pending: 0, approved: 0, published: 0, rejected: 0 };
  let pending: { id: string; colors: string[]; status: string; createdAt: string }[] = [];

  try {
    stats = await getStats();
    pending = await getPendingPalettes();
  } catch {
    // D1 not available in dev
  }

  return (
    <div>
      <StatsCards {...stats} />

      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Pending Review ({stats.pending})
      </h2>

      {pending.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          No palettes pending review.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pending.map((p) => (
            <ModerationCard
              key={p.id}
              id={p.id}
              colors={p.colors}
              status={p.status}
              createdAt={p.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
