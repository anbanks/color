import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/en/login");
  }

  // TODO: enable role check when more users exist
  // if ((session.user as { role?: string }).role !== "admin") {
  //   redirect("/en");
  // }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Admin</h1>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
            Moderation
          </span>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
