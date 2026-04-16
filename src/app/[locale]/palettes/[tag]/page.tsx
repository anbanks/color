import { PaletteFeed } from "@/components/palette/palette-feed";
import { getPalettesByTag } from "@/lib/get-palettes";
import { locales } from "@/lib/i18n";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag, locale } = await params;
  const title = tag.charAt(0).toUpperCase() + tag.slice(1);
  const canonical = `${SITE_URL}/${locale}/palettes/${tag}`;
  return {
    title: `${title} Color Palettes`,
    description: `Discover beautiful ${tag} color palettes for your next design project.`,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/palettes/${tag}`])
        ),
        "x-default": `${SITE_URL}/en/palettes/${tag}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: canonical,
      title: `${title} Color Palettes`,
      description: `Discover beautiful ${tag} color palettes for your next design project.`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const palettes = await getPalettesByTag(tag);
  return <PaletteFeed palettes={palettes} />;
}
