import { PaletteFeed } from "@/components/palette/palette-feed";
import { getPopularPalettes } from "@/lib/get-palettes";

export default async function PopularPage() {
  const palettes = await getPopularPalettes();
  return <PaletteFeed palettes={palettes} sort="popular" />;
}
