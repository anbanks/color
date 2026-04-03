import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { PaletteGridInteractive } from "@/components/palette/palette-grid-interactive";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const title = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    title: `${title} Color Palettes`,
    description: `Discover beautiful ${tag} color palettes for your next design project.`,
  };
}

async function getPalettesByTag(tag: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  return db
    .select()
    .from(palettes)
    .where(eq(palettes.status, "published"))
    .orderBy(desc(palettes.likesCount))
    .limit(40);
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;

  let paletteData: { id: string; slug: string; colors: string[]; likesCount: number; createdAt?: string }[] = [];

  try {
    const results = await getPalettesByTag(tag);
    paletteData = results
      .filter((p) => {
        if (!p.tags) return false;
        const tags = JSON.parse(p.tags) as string[];
        return tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()));
      })
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        colors: JSON.parse(p.colors) as string[],
        likesCount: p.likesCount,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
      }));
  } catch {
    // D1 not available
  }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-8 flex gap-10">
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
