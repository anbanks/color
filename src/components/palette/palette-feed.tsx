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
      <div className="flex">
        {/* Sidebar — sticky com scroll próprio */}
        <div className="w-[200px] shrink-0 hidden md:block pl-6 pr-2">
          <div className="sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto scrollbar-hide pt-6 pb-8">
            <Suspense>
              <Sidebar />
            </Suspense>
          </div>
        </div>

        {/* Feed — scroll da página */}
        <main className="flex-1 min-w-0 pt-6 pb-16 px-5">
          <PaletteGridInteractive palettes={palettes} />
        </main>

        {/* Right panel — sticky */}
        <div className="w-[320px] shrink-0 hidden xl:block pr-6 pl-2">
          <div className="sticky top-[60px] pt-6">
            <Suspense>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
