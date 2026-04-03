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
    <div className="h-screen flex flex-col overflow-hidden">
      <Suspense>
        <Header />
      </Suspense>
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[170px] shrink-0 hidden md:block overflow-y-auto pl-6 pr-2 pt-6 pb-8 scrollbar-hide">
          <Suspense>
            <Sidebar />
          </Suspense>
        </div>

        {/* Feed */}
        <main className="flex-1 min-w-0 overflow-y-auto px-6 pt-6 pb-8">
          <PaletteGridInteractive palettes={palettes} />
        </main>

        {/* Right panel */}
        <div className="w-[280px] shrink-0 hidden xl:block overflow-y-auto pr-6 pl-4 pt-6 pb-8">
          <Suspense>
            <RightPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
