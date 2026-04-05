export function PaletteSkeleton() {
  return (
    <div className="item animate-pulse">
      <div className="palette bg-gray-100" />
      <div className="flex items-center justify-between">
        <div className="h-[38px] w-[80px] bg-gray-100 rounded-[10px]" />
        <div className="h-[14px] w-[50px] bg-gray-50 rounded" />
      </div>
    </div>
  );
}

export function PaletteSkeletonGrid() {
  return (
    <div className="feed-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <PaletteSkeleton key={i} />
      ))}
    </div>
  );
}
