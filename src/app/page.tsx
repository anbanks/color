import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Suspense } from "react";

interface HomeProps {
  searchParams: Promise<{ sort?: string }>;
}

async function getPalettes(sort: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const limit = 20;

  switch (sort) {
    case "popular":
      return db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(desc(palettes.likesCount))
        .limit(limit);

    case "new":
      return db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(desc(palettes.createdAt))
        .limit(limit);

    case "random":
      return db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(sql`RANDOM()`)
        .limit(limit);

    case "trending":
    default:
      return db
        .select()
        .from(palettes)
        .where(eq(palettes.status, "published"))
        .orderBy(desc(palettes.likesCount), desc(palettes.createdAt))
        .limit(limit);
  }
}

export default async function Home({ searchParams }: HomeProps) {
  let paletteData: { id: string; slug: string; colors: string[]; likesCount: number }[] = [];

  try {
    const { sort = "trending" } = await searchParams;
    const results = await getPalettes(sort);
    paletteData = results.map((p) => ({
      id: p.id,
      slug: p.slug,
      colors: JSON.parse(p.colors) as string[],
      likesCount: p.likesCount,
    }));
  } catch {
    // D1 not available in dev — show demo palettes
    paletteData = demoPalettes;
  }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <PaletteGrid palettes={paletteData} />
      </main>
      <Footer />
    </>
  );
}

const demoPalettes = [
  { id: "1", slug: "ff6b6b-4ecdc4-45b7d1-96ceb4", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"], likesCount: 42 },
  { id: "2", slug: "2c3e50-e74c3c-ecf0f1-3498db", colors: ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB"], likesCount: 38 },
  { id: "3", slug: "f8b500-ff6f61-5b5ea6-9b2335", colors: ["#F8B500", "#FF6F61", "#5B5EA6", "#9B2335"], likesCount: 35 },
  { id: "4", slug: "fad0c4-ffd1ff-a1c4fd-c2e9fb", colors: ["#FAD0C4", "#FFD1FF", "#A1C4FD", "#C2E9FB"], likesCount: 31 },
  { id: "5", slug: "0f0c29-302b63-24243e-1a1a2e", colors: ["#0F0C29", "#302B63", "#24243E", "#1A1A2E"], likesCount: 28 },
  { id: "6", slug: "56ab2f-a8e063-f7dc6f-f0b27a", colors: ["#56AB2F", "#A8E063", "#F7DC6F", "#F0B27A"], likesCount: 25 },
  { id: "7", slug: "ff9a9e-fecfef-ffdde1-fff1eb", colors: ["#FF9A9E", "#FECFEF", "#FFDDE1", "#FFF1EB"], likesCount: 22 },
  { id: "8", slug: "667eea-764ba2-f093fb-f5576c", colors: ["#667EEA", "#764BA2", "#F093FB", "#F5576C"], likesCount: 19 },
  { id: "9", slug: "1a1a2e-16213e-0f3460-e94560", colors: ["#1A1A2E", "#16213E", "#0F3460", "#E94560"], likesCount: 15 },
  { id: "10", slug: "f5f5dc-d4a574-8b7355-4a3728", colors: ["#F5F5DC", "#D4A574", "#8B7355", "#4A3728"], likesCount: 12 },
  { id: "11", slug: "ee5a24-f8c291-78e08f-38ada9", colors: ["#EE5A24", "#F8C291", "#78E08F", "#38ADA9"], likesCount: 10 },
  { id: "12", slug: "6c5ce7-a29bfe-dfe6e9-b2bec3", colors: ["#6C5CE7", "#A29BFE", "#DFE6E9", "#B2BEC3"], likesCount: 8 },
];
