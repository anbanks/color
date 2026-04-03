import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Create a Palette
        </h1>
        <PaletteCreator />
      </main>
      <Footer />
    </>
  );
}
