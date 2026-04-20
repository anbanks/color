import { auth } from "@/auth";
import { NextResponse } from "next/server";

const locales = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"];
const defaultLocale = "en";
const nonDefaultLocales = locales.filter((l) => l !== defaultLocale);

const protectedPaths = ["/create", "/collections"];
const adminPaths = ["/admin"];

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  const first = segments[1];
  return locales.includes(first) ? first : null;
}

function detectLocale(acceptLang: string): string {
  for (const locale of nonDefaultLocales) {
    if (acceptLang.includes(locale)) return locale;
  }
  return defaultLocale;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip static assets and special routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/extension" ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathLocale = getLocaleFromPath(pathname);

  // /en/* → 301 redirect to /* (strip default locale from URL)
  if (pathLocale === defaultLocale) {
    const stripped = pathname.replace(`/${defaultLocale}`, "") || "/";
    const url = new URL(stripped, req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url, 301);
  }

  // Non-default locale in path (/pt/*, /es/*, etc.) — pass through
  if (pathLocale) {
    const forwardHeaders = new Headers(req.headers);
    forwardHeaders.set("x-locale", pathLocale);

    const pathWithoutLocale = pathname.replace(`/${pathLocale}`, "") || "/";
    const isProtected = protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
    const isAdmin = adminPaths.some((p) => pathWithoutLocale.startsWith(p));

    if ((isProtected || isAdmin) && !req.auth) {
      return NextResponse.redirect(new URL(`/${pathLocale}?auth=login`, req.url));
    }
    if (isAdmin && req.auth) {
      const role = (req.auth.user as { role?: string } | undefined)?.role;
      if (role !== "admin") {
        return NextResponse.redirect(new URL(`/${pathLocale}`, req.url));
      }
    }

    return NextResponse.next({ request: { headers: forwardHeaders } });
  }

  // No locale in path — this is the default (EN) or needs detection
  const acceptLang = req.headers.get("accept-language") || "";
  const detected = detectLocale(acceptLang);

  // If detected language is NOT default → redirect to /{locale}/path
  if (detected !== defaultLocale) {
    return NextResponse.redirect(new URL(`/${detected}${pathname}`, req.url));
  }

  // Default locale (EN): rewrite internally to /en/* but keep URL clean
  const forwardHeaders = new Headers(req.headers);
  forwardHeaders.set("x-locale", defaultLocale);

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if ((isProtected || isAdmin) && !req.auth) {
    return NextResponse.redirect(new URL("/?auth=login", req.url));
  }
  if (isAdmin && req.auth) {
    const role = (req.auth.user as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Rewrite /path → /en/path internally (URL stays without /en/)
  return NextResponse.rewrite(
    new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}`, req.url),
    { request: { headers: forwardHeaders } }
  );
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
