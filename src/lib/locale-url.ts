import { SITE_URL } from "./site";

const DEFAULT_LOCALE = "en";

// Returns the URL path prefix for a locale. EN returns "" (no prefix).
export function localePrefix(locale: string): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

// Builds a full absolute URL for a given locale + path.
export function localeUrl(locale: string, path: string = ""): string {
  const prefix = localePrefix(locale);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${prefix}${cleanPath === "/" ? "" : cleanPath}`;
}

// Builds alternates map for hreflang (EN = no prefix, others = prefix).
export function localeAlternates(
  locales: readonly string[],
  path: string = ""
): Record<string, string> {
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  const result: Record<string, string> = {};
  for (const l of locales) {
    const prefix = l === DEFAULT_LOCALE ? "" : `/${l}`;
    result[l] = `${SITE_URL}${prefix}${cleanPath}`;
  }
  result["x-default"] = `${SITE_URL}${cleanPath}`;
  return result;
}
