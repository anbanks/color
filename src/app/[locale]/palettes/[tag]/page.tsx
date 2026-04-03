import { PaletteFeed } from "@/components/palette/palette-feed";
import { getPalettesByTag } from "@/lib/get-palettes";
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

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const palettes = await getPalettesByTag(tag);
  return <PaletteFeed palettes={palettes} />;
}
