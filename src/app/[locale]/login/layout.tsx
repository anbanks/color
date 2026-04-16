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
    path: "login",
    title: t.auth.signIn,
    description: t.site.description,
    robots: { index: false, follow: true },
  });
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
