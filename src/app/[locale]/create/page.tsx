import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { PaletteCreator } from "@/components/palette/palette-creator";
import { Suspense } from "react";
import { buildRouteMetadata } from "@/lib/page-metadata";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return buildRouteMetadata({
    locale,
    path: "create",
    title: t.creator.title,
    description: t.creator.subtitle,
  });
}

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
