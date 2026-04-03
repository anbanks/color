import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PaletteDetail } from "@/components/palette/palette-detail";
import { PaletteContent } from "@/components/seo/palette-content";
import { LikeButton } from "@/components/palette/like-button";
import { ContrastChecker } from "@/components/palette/contrast-checker";
import { SiteMockup } from "@/components/preview/site-mockup";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, ne, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPalette(slug: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const results = await db
    .select()
    .from(palettes)
    .where(eq(palettes.slug, slug))
    .limit(1);

  return results[0] || null;
}

async function getContent(paletteId: string, locale: "en" | "pt" | "es" = "en") {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const results = await db
    .select()
    .from(paletteContent)
    .where(
      and(eq(paletteContent.paletteId, paletteId), eq(paletteContent.locale, locale))
    )
    .limit(1);

  return results[0] || null;
}

async function getRelated(paletteId: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const results = await db
    .select()
    .from(palettes)
    .where(and(eq(palettes.status, "published"), ne(palettes.id, paletteId)))
    .orderBy(desc(palettes.likesCount))
    .limit(4);

  return results.map((p) => ({
    id: p.id,
    slug: p.slug,
    colors: JSON.parse(p.colors) as string[],
    likesCount: p.likesCount,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const palette = await getPalette(slug);
    if (!palette) return { title: "Palette Not Found" };

    const colors = JSON.parse(palette.colors) as string[];
    const content = await getContent(palette.id);

    const title = content?.title || `Color Palette ${colors.join(" ")}`;
    const description =
      content?.description ||
      `A beautiful color palette featuring ${colors.join(", ")}. Copy color codes and get inspired.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
      },
    };
  } catch {
    return { title: "Color Palette" };
  }
}

export default async function PalettePage({ params }: PageProps) {
  const { slug } = await params;

  let palette;
  let content;
  let related: { id: string; slug: string; colors: string[]; likesCount: number }[] = [];

  try {
    palette = await getPalette(slug);
    if (!palette) notFound();

    content = await getContent(palette.id);
    related = await getRelated(palette.id);
  } catch {
    // Fallback for local dev without D1
    const demo = demoPalettes.find((p) => p.slug === slug);
    if (!demo) notFound();
    palette = demo;
    content = null;
    related = demoPalettes.filter((p) => p.slug !== slug).slice(0, 4);
  }

  const colors = typeof palette.colors === "string"
    ? (JSON.parse(palette.colors) as string[])
    : palette.colors;

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Palette detail — above the fold (clean UI) */}
        <PaletteDetail colors={colors} />

        {/* Like button */}
        <div className="flex justify-end mt-4">
          <LikeButton
            paletteId={palette.id}
            initialCount={palette.likesCount}
          />
        </div>

        {/* Mockup preview + Contrast checker */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SiteMockup colors={colors} />
          <ContrastChecker colors={colors} />
        </div>

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: content?.title || `Color Palette ${colors.join(" ")}`,
              description:
                content?.description ||
                `A color palette featuring ${colors.join(", ")}`,
              datePublished: palette.publishedAt
                ? new Date(
                    typeof palette.publishedAt === "number"
                      ? palette.publishedAt * 1000
                      : palette.publishedAt
                  ).toISOString()
                : undefined,
            }),
          }}
        />

        {/* SEO content — below the fold */}
        {content && (
          <PaletteContent
            title={content.title}
            description={content.description}
            applications={content.applications}
            psychology={content.psychology}
          />
        )}

        {/* Related palettes */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">
              Related Palettes
            </h2>
            <PaletteGrid palettes={related} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

const demoPalettes = [
  { id: "1", slug: "ff6b6b-4ecdc4-45b7d1-96ceb4", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"], likesCount: 42, publishedAt: null, status: "published" as const },
  { id: "2", slug: "2c3e50-e74c3c-ecf0f1-3498db", colors: ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB"], likesCount: 38, publishedAt: null, status: "published" as const },
  { id: "3", slug: "f8b500-ff6f61-5b5ea6-9b2335", colors: ["#F8B500", "#FF6F61", "#5B5EA6", "#9B2335"], likesCount: 35, publishedAt: null, status: "published" as const },
  { id: "4", slug: "fad0c4-ffd1ff-a1c4fd-c2e9fb", colors: ["#FAD0C4", "#FFD1FF", "#A1C4FD", "#C2E9FB"], likesCount: 31, publishedAt: null, status: "published" as const },
  { id: "5", slug: "0f0c29-302b63-24243e-1a1a2e", colors: ["#0F0C29", "#302B63", "#24243E", "#1A1A2E"], likesCount: 28, publishedAt: null, status: "published" as const },
];
