import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/create", "/collections"];
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check protected routes
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (isAdmin && !req.auth) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/create/:path*", "/collections/:path*", "/admin/:path*"],
};
