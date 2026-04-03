import { PaletteCard } from "./palette-card";

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
}

interface PaletteGridProps {
  palettes: Palette[];
}

export function PaletteGrid({ palettes }: PaletteGridProps) {
  if (palettes.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No palettes yet</p>
        <p className="text-sm mt-1">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {palettes.map((palette) => (
        <PaletteCard
          key={palette.id}
          id={palette.id}
          slug={palette.slug}
          colors={palette.colors}
          likesCount={palette.likesCount}
        />
      ))}
    </div>
  );
}
