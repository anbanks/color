import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";
import { SITE_NAME } from "./site";
import { localeUrl, localeAlternates } from "./locale-url";

interface RouteMetaInput {
  locale: string;
  path: string;
  title: string;
  description: string;
  robots?: Metadata["robots"];
}

export function buildRouteMetadata({
  locale,
  path,
  title,
  description,
  robots,
}: RouteMetaInput): Metadata {
  const safeLocale = (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : "en";
  const trimmed = path.replace(/^\/+/, "");
  const suffix = trimmed ? `/${trimmed}` : "";
  const canonical = localeUrl(safeLocale, suffix);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localeAlternates(locales, suffix),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      locale: safeLocale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(robots ? { robots } : {}),
  };
}
