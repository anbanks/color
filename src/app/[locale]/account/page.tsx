import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { AccountClient } from "@/components/account/account-client";
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
    path: "account",
    title: t.account.title,
    description: t.account.subtitle,
    robots: { index: false, follow: false },
  });
}

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}?auth=login`);
  }

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
        <main className="flex-1 min-w-0 pt-[6px] pb-8 px-5 box-border">
          <AccountClient
            user={{
              name: session.user.name ?? null,
              email: session.user.email ?? null,
              image: session.user.image ?? null,
            }}
          />
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
