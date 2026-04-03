import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
  weight?: number;
}

export function MaterialIcon({
  name,
  className,
  filled = false,
  size = 24,
  weight = 300,
}: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-rounded select-none", className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
}
