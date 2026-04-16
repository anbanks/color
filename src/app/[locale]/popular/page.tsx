import { PaletteFeed } from "@/components/palette/palette-feed";
import { getPopularPalettes } from "@/lib/get-palettes";
import { buildRouteMetadata } from "@/lib/page-metadata";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return buildRouteMetadata({
    locale,
    path: "popular",
    title: `${t.nav.popular} — ${t.site.title}`,
    description: t.site.description,
  });
}

export default async function PopularPage() {
  const palettes = await getPopularPalettes();
  return <PaletteFeed palettes={palettes} sort="popular" />;
}
