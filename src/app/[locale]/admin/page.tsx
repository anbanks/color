import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Palette, Users as UsersIcon, Eye, Clock } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";

async function getStats() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const statusCounts = await db.select({ status: palettes.status, count: sql<number>`count(*)` }).from(palettes).groupBy(palettes.status);
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

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  const stats = await getStats();

  const cards = [
    { label: t.admin.totalPalettes, value: stats.total.toLocaleString(), icon: Palette },
    { label: t.admin.published, value: stats.published.toLocaleString(), icon: Eye },
    { label: t.admin.pendingReview2, value: stats.pending.toLocaleString(), icon: Clock },
    { label: t.admin.users, value: stats.users.toLocaleString(), icon: UsersIcon },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-[13px] text-gray-500 dark:text-white/40 mt-0.5">{t.admin.overview}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-gray-500 dark:text-white/40">{card.label}</span>
                <Icon className="h-4 w-4 text-gray-400 dark:text-white/25" strokeWidth={1.5} />
              </div>
              <p className="text-[24px] font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-4">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-3">{t.admin.quickStats}</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500 dark:text-white/40">{t.admin.totalLikes}</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.likes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500 dark:text-white/40">{t.admin.rejected}</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.rejected}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500 dark:text-white/40">{t.admin.approvalRate}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-4">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-3">{t.admin.quickActions}</h3>
          <div className="space-y-1.5">
            <a href={`/${locale}/admin/palettes`} className="block px-3 py-2.5 rounded-md border border-gray-200/60 dark:border-white/[0.06] text-[13px] text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
              {t.admin.managePalettes} →
            </a>
            <a href={`/${locale}/admin/palettes`} className="block px-3 py-2.5 rounded-md border border-gray-200/60 dark:border-white/[0.06] text-[13px] text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
              {t.admin.reviewPending} ({stats.pending}) →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
