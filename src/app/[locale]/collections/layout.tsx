import { buildRouteMetadata } from "@/lib/page-metadata";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return buildRouteMetadata({
    locale,
    path: "collections",
    title: t.collections.title,
    description: t.collections.empty,
    robots: { index: false, follow: false },
  });
}

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
