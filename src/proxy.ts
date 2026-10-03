import { NextRequest, NextResponse } from "next/server";
import { COOKIE_AT, COOKIE_RT } from "@/lib/auth-config";

/**
 * Next.js 16 calls this convention `proxy` (it replaced `middleware`).
 *
 * Routes that require authentication
 */
const PROTECTED_PATHS = ["/dashboard", "/admin"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  // Presence check only — the real verification happens per-request at the API
  // layer. If only `rt` is present the page still loads and the client's
  // api-client refreshes on the first 401.
  const hasToken =
    req.cookies.get(COOKIE_AT)?.value || req.cookies.get(COOKIE_RT)?.value;
  if (hasToken) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
