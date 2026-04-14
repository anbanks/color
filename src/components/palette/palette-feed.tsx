import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { PaletteGridInteractive } from "@/components/palette/palette-grid-interactive";
import { Suspense } from "react";

interface PaletteFeedProps {
  palettes: {
    id: string;
    slug: string;
    colors: string[];
    likesCount: number;
    liked?: boolean;
    saved?: boolean;
    createdAt?: string;
    publishedAt?: string;
  }[];
  sort?: string;
}

export function PaletteFeed({ palettes, sort = "new" }: PaletteFeedProps) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="flex">
        {/* Sidebar — 200px, sticky, scroll próprio */}
        <div className="min-w-[200px] shrink-0 hidden md:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)] overflow-y-auto scrollbar-hide">
            <Suspense>
              <Sidebar />
            </Suspense>
          </div>
        </div>

        {/* Feed */}
        <main className="flex-1 min-w-0 box-border">
          <PaletteGridInteractive palettes={palettes} sort={sort} />
        </main>

        {/* Right panel — 340px, sticky */}
        <div className="min-w-[340px] max-w-[340px] shrink-0 hidden xl:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)]">
            <Suspense>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
