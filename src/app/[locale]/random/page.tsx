import { PaletteFeed } from "@/components/palette/palette-feed";
import { getRandomPalettes } from "@/lib/get-palettes";

export default async function RandomPage() {
  const palettes = await getRandomPalettes();
  return <PaletteFeed palettes={palettes} sort="random" />;
}
