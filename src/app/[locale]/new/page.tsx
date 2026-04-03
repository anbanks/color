import { PaletteFeed } from "@/components/palette/palette-feed";
import { getNewPalettes } from "@/lib/get-palettes";

export default async function NewPage() {
  const palettes = await getNewPalettes();
  return <PaletteFeed palettes={palettes} />;
}
