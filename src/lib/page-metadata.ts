import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";
import { SITE_URL, SITE_NAME } from "./site";

interface RouteMetaInput {
  locale: string;
  path: string;
  title: string;
  description: string;
  robots?: Metadata["robots"];
}

// Builds the standard Metadata object (canonical, hreflang for 9 locales +
// x-default, OpenGraph, Twitter) for any locale-prefixed route.
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
  const canonical = `${SITE_URL}/${safeLocale}${suffix}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`])
        ),
        "x-default": `${SITE_URL}/en${suffix}`,
      },
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
