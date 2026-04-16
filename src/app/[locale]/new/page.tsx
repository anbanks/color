import { PaletteFeed } from "@/components/palette/palette-feed";
import { getNewPalettes } from "@/lib/get-palettes";
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
    path: "new",
    title: `${t.nav.new} — ${t.site.title}`,
    description: t.site.description,
  });
}

export default async function NewPage() {
  const palettes = await getNewPalettes();
  return <PaletteFeed palettes={palettes} />;
}
