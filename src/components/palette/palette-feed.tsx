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
    createdAt?: string;
  }[];
}

export function PaletteFeed({ palettes }: PaletteFeedProps) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="max-w-[1540px] mx-auto flex min-h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <div className="w-[170px] shrink-0 hidden md:block overflow-y-auto scrollbar-hide pl-5 pr-2 pt-6 pb-8">
          <Suspense>
            <Sidebar />
          </Suspense>
        </div>

        {/* Feed */}
        <main className="flex-1 min-w-0 pt-6 pb-16 px-4">
          <PaletteGridInteractive palettes={palettes} />
        </main>

        {/* Right panel */}
        <div className="w-[280px] shrink-0 hidden xl:block pt-6 pb-8 pr-5 pl-2">
          <div className="sticky top-[68px]">
            <Suspense>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
