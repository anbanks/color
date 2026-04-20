"use client";

import { useLocale } from "@/lib/locale-context";

const DEFAULT_LOCALE = "en";

// Returns a function that builds locale-aware paths.
// EN returns "/path", others return "/{locale}/path".
export function useLocalePath() {
  const { locale } = useLocale();
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  return (path: string = "") => {
    if (!path || path === "/") return prefix || "/";
    return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
  };
}
