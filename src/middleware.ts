import { auth } from "@/auth";
import { NextResponse } from "next/server";

const locales = ["en", "pt", "es"];
const defaultLocale = "en";

const protectedPaths = ["/create", "/collections"];
const adminPaths = ["/admin"];

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  const first = segments[1];
  return locales.includes(first) ? first : null;
}

function detectLocale(acceptLang: string): string {
  for (const locale of locales) {
    if (acceptLang.includes(locale)) return locale;
  }
  return defaultLocale;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip API, _next, static files, and locale-agnostic routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/extension" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathLocale = getLocaleFromPath(pathname);

  // No locale in path — redirect with detected locale
  if (!pathLocale) {
    const acceptLang = req.headers.get("accept-language") || "";
    const detected = detectLocale(acceptLang);
    return NextResponse.redirect(new URL(`/${detected}${pathname}`, req.url));
  }

  // Strip locale to check protected paths
  const pathWithoutLocale = pathname.replace(`/${pathLocale}`, "") || "/";

  // Protected routes
  const isProtected = protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathWithoutLocale.startsWith(p));

  if ((isProtected || isAdmin) && !req.auth) {
    return NextResponse.redirect(new URL(`/${pathLocale}/login`, req.url));
  }

  if (isAdmin && req.auth) {
    const role = (req.auth.user as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL(`/${pathLocale}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
