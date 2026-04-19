import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { PaletteDetail } from "@/components/palette/palette-detail";
import { PaletteContent } from "@/components/seo/palette-content";
import { LikeButton } from "@/components/palette/like-button";
import { ContrastChecker } from "@/components/palette/contrast-checker";
import { SiteMockup } from "@/components/preview/site-mockup";
import { PaletteCard } from "@/components/palette/palette-card";
import { PaletteExport } from "@/components/palette/palette-export";
import { PaletteShare } from "@/components/palette/palette-share";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, ne, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PaletteActions } from "@/components/palette/palette-actions";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import { SITE_URL, SITE_NAME } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getPalette(slug: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const results = await db.select().from(palettes).where(eq(palettes.slug, slug)).limit(1);
  return results[0] || null;
}

async function getContent(paletteId: string, locale: Locale = "en") {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const results = await db.select().from(paletteContent).where(and(eq(paletteContent.paletteId, paletteId), eq(paletteContent.locale, locale))).limit(1);
  return results[0] || null;
}

async function getRelated(paletteId: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const results = await db.select().from(palettes).where(and(eq(palettes.status, "published"), ne(palettes.id, paletteId))).orderBy(desc(palettes.likesCount)).limit(4);
  return results.map((p) => ({
    id: p.id, slug: p.slug, colors: JSON.parse(p.colors) as string[], likesCount: p.likesCount,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  try {
    const palette = await getPalette(slug);
    if (!palette) return { title: "Palette Not Found" };
    const colors = JSON.parse(palette.colors) as string[];
    const safeLocale = (locales as readonly string[]).includes(locale)
      ? (locale as Locale)
      : "en";
    const content = await getContent(palette.id, safeLocale);
    const title = content?.title || `Color Palette ${colors.join(" ")}`;
    const description =
      content?.description ||
      `A beautiful color palette featuring ${colors.join(", ")}.`;
    const canonical = `${SITE_URL}/${safeLocale}/palette/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: {
          ...Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/palette/${slug}`])
          ),
          "x-default": `${SITE_URL}/en/palette/${slug}`,
        },
      },
      openGraph: {
        type: "article",
        siteName: SITE_NAME,
        url: canonical,
        title,
        description,
        locale: safeLocale,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: "Color Palette" };
  }
}

export default async function PalettePage({ params }: PageProps) {
  const { slug, locale } = await params;

  let palette;
  let content;
  let related: { id: string; slug: string; colors: string[]; likesCount: number }[] = [];

  try {
    palette = await getPalette(slug);
    if (!palette) notFound();
    content = await getContent(palette.id, locale as Locale);
    related = await getRelated(palette.id);
  } catch {
    const demo = demoPalettes.find((p) => p.slug === slug);
    if (!demo) notFound();
    palette = demo;
    content = null;
    related = demoPalettes.filter((p) => p.slug !== slug).slice(0, 4);
  }

  const colors = typeof palette.colors === "string"
    ? (JSON.parse(palette.colors) as string[])
    : palette.colors;

  const t = getDictionary(locale as Locale);

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="flex">
        {/* Sidebar — 200px, sticky, scroll próprio (same as feed) */}
        <div className="min-w-[200px] shrink-0 hidden md:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)] overflow-y-auto scrollbar-hide">
            <Suspense>
              <Sidebar />
            </Suspense>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pt-[6px] pb-16 box-border">
          {/* Palette expanded */}
          <div className="max-w-[820px] mx-auto px-5">
            {/* Palette card large */}
            <div className="rounded-[10px] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
              {colors.map((color, i) => (
                <div key={i} className="h-[100px]" style={{ backgroundColor: color }} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <LikeButton paletteId={palette.id} initialCount={palette.likesCount} />
              <PaletteActions slug={slug} colors={colors} />
              <PaletteExport paletteId={palette.id} />
              <PaletteShare slug={slug} />
              <span className="ml-auto text-[13px] text-gray-400">
                {palette.publishedAt ? new Date(typeof palette.publishedAt === "number" ? palette.publishedAt * 1000 : palette.publishedAt).toLocaleDateString() : ""}
              </span>
            </div>

            {/* Color circles */}
            <div className="flex items-center justify-center gap-6 mt-8">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color.toUpperCase()}
                />
              ))}
            </div>

            {/* Mockup + Contrast */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SiteMockup colors={colors} />
              <ContrastChecker colors={colors} />
            </div>

            {/* Schema.org */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify([
                  {
                    "@context": "https://schema.org",
                    "@type": "CreativeWork",
                    inLanguage: locale,
                    name: content?.title || `Color Palette ${colors.join(" ")}`,
                    description:
                      content?.description ||
                      `A color palette featuring ${colors.join(", ")}`,
                    url: `${SITE_URL}/${locale}/palette/${slug}`,
                    author: { "@type": "Organization", name: SITE_NAME },
                    publisher: { "@type": "Organization", name: SITE_NAME },
                    keywords: colors.join(", "),
                  },
                  {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                      {
                        "@type": "ListItem",
                        position: 1,
                        name: SITE_NAME,
                        item: `${SITE_URL}/${locale}`,
                      },
                      {
                        "@type": "ListItem",
                        position: 2,
                        name: t.single.relatedPalettes,
                        item: `${SITE_URL}/${locale}`,
                      },
                      {
                        "@type": "ListItem",
                        position: 3,
                        name: content?.title || `Color Palette ${colors.join(" ")}`,
                        item: `${SITE_URL}/${locale}/palette/${slug}`,
                      },
                    ],
                  },
                ]),
              }}
            />

            {/* SEO content */}
            {content && (
              <PaletteContent
                title={content.title}
                description={content.description}
                applications={content.applications}
                psychology={content.psychology}
              />
            )}
          </div>

          {/* Related — same layout as normal listing (full main width) */}
          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 px-5 mb-3">{t.single.relatedPalettes}</h2>
              <div className="feed-grid">
                {related.map((p) => (
                  <PaletteCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    colors={p.colors}
                    likesCount={p.likesCount}
                  />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Right panel — 340px, sticky (same as feed) */}
        <div className="min-w-[340px] max-w-[340px] shrink-0 hidden xl:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)]">
            <Suspense>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

const demoPalettes = [
  { id: "1", slug: "ff6b6b-4ecdc4-45b7d1-96ceb4", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"], likesCount: 42, publishedAt: null, status: "published" as const },
  { id: "2", slug: "2c3e50-e74c3c-ecf0f1-3498db", colors: ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB"], likesCount: 38, publishedAt: null, status: "published" as const },
  { id: "3", slug: "f8b500-ff6f61-5b5ea6-9b2335", colors: ["#F8B500", "#FF6F61", "#5B5EA6", "#9B2335"], likesCount: 35, publishedAt: null, status: "published" as const },
  { id: "4", slug: "fad0c4-ffd1ff-a1c4fd-c2e9fb", colors: ["#FAD0C4", "#FFD1FF", "#A1C4FD", "#C2E9FB"], likesCount: 31, publishedAt: null, status: "published" as const },
];
