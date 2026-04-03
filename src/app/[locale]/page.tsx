import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { PaletteGridInteractive } from "@/components/palette/palette-grid-interactive";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Suspense } from "react";

interface HomeProps {
  searchParams: Promise<{ sort?: string; tag?: string }>;
}

async function getPalettes(sort: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const limit = 20;

  switch (sort) {
    case "popular":
      return db.select().from(palettes).where(eq(palettes.status, "published")).orderBy(desc(palettes.likesCount)).limit(limit);
    case "random":
      return db.select().from(palettes).where(eq(palettes.status, "published")).orderBy(sql`RANDOM()`).limit(limit);
    case "new":
    default:
      return db.select().from(palettes).where(eq(palettes.status, "published")).orderBy(desc(palettes.createdAt)).limit(limit);
  }
}

export default async function Home({ searchParams }: HomeProps) {
  let paletteData: { id: string; slug: string; colors: string[]; likesCount: number; createdAt?: string }[] = [];

  try {
    const { sort = "new" } = await searchParams;
    const results = await getPalettes(sort);
    paletteData = results.map((p) => ({
      id: p.id,
      slug: p.slug,
      colors: JSON.parse(p.colors) as string[],
      likesCount: p.likesCount,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    }));
  } catch {
    paletteData = demoPalettes;
  }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex gap-8">
        <Suspense>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0">
          <PaletteGridInteractive palettes={paletteData} />
        </main>
      </div>
      <Footer />
    </>
  );
}

const demoPalettes = [
  { id: "1", slug: "ff6b6b-4ecdc4-45b7d1-96ceb4", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"], likesCount: 42, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "2", slug: "2c3e50-e74c3c-ecf0f1-3498db", colors: ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB"], likesCount: 126, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", slug: "f8b500-ff6f61-5b5ea6-9b2335", colors: ["#F8B500", "#FF6F61", "#5B5EA6", "#9B2335"], likesCount: 128, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "4", slug: "fad0c4-ffd1ff-a1c4fd-c2e9fb", colors: ["#FAD0C4", "#FFD1FF", "#A1C4FD", "#C2E9FB"], likesCount: 224, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "5", slug: "0f0c29-302b63-24243e-1a1a2e", colors: ["#0F0C29", "#302B63", "#24243E", "#1A1A2E"], likesCount: 375, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "6", slug: "56ab2f-a8e063-f7dc6f-f0b27a", colors: ["#56AB2F", "#A8E063", "#F7DC6F", "#F0B27A"], likesCount: 436, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "7", slug: "ff9a9e-fecfef-ffdde1-fff1eb", colors: ["#FF9A9E", "#FECFEF", "#FFDDE1", "#FFF1EB"], likesCount: 289, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "8", slug: "667eea-764ba2-f093fb-f5576c", colors: ["#667EEA", "#764BA2", "#F093FB", "#F5576C"], likesCount: 524, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
];
