import { ColorStrip } from "./color-strip";
import { LikeButton } from "./like-button";
import { SaveButton } from "./save-button";
import Link from "next/link";

interface PaletteCardProps {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
  liked?: boolean;
}

export function PaletteCard({ id, slug, colors, likesCount, liked }: PaletteCardProps) {
  return (
    <div className="group">
      <Link href={`/palette/${slug}`}>
        <div className="rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {colors.map((color, i) => (
            <ColorStrip
              key={color + i}
              color={color}
              isFirst={i === 0}
              isLast={i === colors.length - 1}
            />
          ))}
        </div>
      </Link>
      <div className="flex items-center justify-between mt-2 px-1">
        <SaveButton paletteId={id} />
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
      </div>
    </div>
  );
}
