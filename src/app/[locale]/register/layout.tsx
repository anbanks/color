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
    path: "register",
    title: t.auth.signUp,
    description: t.site.description,
    robots: { index: false, follow: true },
  });
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
