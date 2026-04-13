import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Palette, Users as UsersIcon, Eye, Clock } from "lucide-react";

async function getStats() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const statusCounts = await db
      .select({ status: palettes.status, count: sql<number>`count(*)` })
      .from(palettes)
      .groupBy(palettes.status);

    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalLikes = await db.select({ total: sql<number>`sum(likes_count)` }).from(palettes);

    const map: Record<string, number> = {};
    for (const row of statusCounts) map[row.status] = row.count;

    return {
      total: Object.values(map).reduce((a, b) => a + b, 0),
      pending: map["pending"] || 0,
      published: map["published"] || 0,
      rejected: map["rejected"] || 0,
      users: userCount[0]?.count || 0,
      likes: totalLikes[0]?.total || 0,
    };
  } catch {
    return { total: 0, pending: 0, published: 0, rejected: 0, users: 0, likes: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Palettes", value: stats.total.toLocaleString(), icon: Palette, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
    { label: "Published", value: stats.published.toLocaleString(), icon: Eye, color: "text-green-600 bg-green-50 dark:bg-green-500/10" },
    { label: "Pending Review", value: stats.pending.toLocaleString(), icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
    { label: "Users", value: stats.users.toLocaleString(), icon: UsersIcon, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/40 mt-1">Overview of your color palette platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-gray-500 dark:text-white/50">{card.label}</span>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[28px] font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-500 dark:text-white/50">Total Likes</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.likes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-500 dark:text-white/50">Rejected</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.rejected}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-500 dark:text-white/50">Approval Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="admin/palettes" className="block px-4 py-3 rounded-lg border border-gray-200/60 dark:border-white/[0.06] text-[14px] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
              Manage all palettes →
            </a>
            <a href="admin/pending" className="block px-4 py-3 rounded-lg border border-gray-200/60 dark:border-white/[0.06] text-[14px] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
              Review pending ({stats.pending}) →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
