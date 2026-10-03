import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_AT,
  COOKIE_RT,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "@/lib/auth-config";

export { COOKIE_AT, COOKIE_RT };

const SECURE = process.env.NODE_ENV === "production";

const baseOpts = {
  httpOnly: true,
  secure: SECURE,
  sameSite: "lax" as const,
  path: "/",
};

/** Set the access (at) + refresh (rt) token cookies on a response. */
export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(COOKIE_AT, tokens.accessToken, {
    ...baseOpts,
    maxAge: ACCESS_TOKEN_TTL,
  });
  response.cookies.set(COOKIE_RT, tokens.refreshToken, {
    ...baseOpts,
    maxAge: REFRESH_TOKEN_TTL,
  });
}

/** Expire both auth cookies. */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(COOKIE_AT, "", { ...baseOpts, maxAge: 0 });
  response.cookies.set(COOKIE_RT, "", { ...baseOpts, maxAge: 0 });
}

export function getAccessToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_AT)?.value;
}

export function getRefreshToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_RT)?.value;
}
