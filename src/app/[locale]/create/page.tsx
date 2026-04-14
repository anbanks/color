import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { PaletteCreator } from "@/components/palette/palette-creator";
import { Suspense } from "react";

export const metadata = {
  title: "Create Palette",
};

export default function CreatePage() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="flex">
        <div className="min-w-[200px] shrink-0 hidden md:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)] overflow-y-auto scrollbar-hide">
            <Suspense>
              <Sidebar />
            </Suspense>
          </div>
        </div>
        <main className="flex-1 min-w-0 px-5 py-8 box-border">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-8">
            Create a Palette
          </h1>
          <PaletteCreator />
        </main>
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
