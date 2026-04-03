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
      <div className="flex pl-6 pr-6">
        {/* Sidebar — sticky, sem scroll proprio */}
        <div className="w-[160px] shrink-0 hidden md:block">
          <div className="sticky top-[68px] pt-6">
            <Suspense>
              <Sidebar />
            </Suspense>
          </div>
        </div>

        {/* Feed — scroll normal da pagina */}
        <main className="flex-1 min-w-0 px-6 pt-6 pb-16">
          <PaletteGridInteractive palettes={palettes} />
        </main>

        {/* Right panel — sticky, sem scroll proprio */}
        <div className="w-[280px] shrink-0 hidden xl:block">
          <div className="sticky top-[68px] pt-6">
            <Suspense>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
