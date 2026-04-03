import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
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
      <div className="px-5 sm:px-8 py-8 flex gap-0">
        <Suspense>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0">
          <PaletteGridInteractive palettes={palettes} />
        </main>
      </div>
      <Footer />
    </>
  );
}
