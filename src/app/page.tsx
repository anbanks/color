import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Palette grid — Story 3.1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl shadow-sm overflow-hidden">
              <div className="h-16" style={{ backgroundColor: `hsl(${i * 45}, 70%, 60%)` }} />
              <div className="h-16" style={{ backgroundColor: `hsl(${i * 45 + 90}, 60%, 50%)` }} />
              <div className="h-16" style={{ backgroundColor: `hsl(${i * 45 + 180}, 50%, 70%)` }} />
              <div className="h-16" style={{ backgroundColor: `hsl(${i * 45 + 270}, 65%, 55%)` }} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
