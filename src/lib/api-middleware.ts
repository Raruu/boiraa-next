import { NextRequest, NextResponse } from "next/server";
import type { RoleCode } from "@/constants/common";

/**
 * API route guards. Wrap a handler to require authentication and/or a role:
 *
 *   export const GET = role(ADMIN_ROLES, async (req, ctx, authUser) => { ... });
 *
 * `auth` and `silentAuth` are the other two guards. Never check auth inside
 * the handler body — pick the guard instead.
 */

export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
  role: string;
}

type RouteContext = { params?: Promise<Record<string, string>> };

type AuthenticatedHandler = (
  req: NextRequest,
  ctx: RouteContext,
  authUser: AuthUser,
) => Promise<NextResponse | Response>;

type OptionalAuthHandler = (
  req: NextRequest,
  ctx: RouteContext,
  authUser: AuthUser | null,
) => Promise<NextResponse | Response>;

/** Resolve the current user from the `at` cookie or an Authorization: Bearer header. */
async function resolveUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get("Authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice("Bearer ".length);
  }

  if (!token) {
    const { getAccessToken } = await import("@/lib/auth-cookies");
    token = getAccessToken(req);
  }

  if (!token) return null;

  const { verifyAccessToken } = await import("@/lib/jwt");
  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    fullname: payload.fullname,
    role: payload.role,
  };
}

/**
 * auth — mandatory authentication. Returns 401 when the access token is
 * missing or invalid. The client's api-client refreshes and retries on 401.
 */
export function auth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, ctx: RouteContext = {}) => {
    const authUser = await resolveUser(req);
    if (!authUser) {
      return NextResponse.json(
        { message: "Unauthorized", statusCode: 401 },
        { status: 401 },
      );
    }
    return handler(req, ctx, authUser);
  };
}

/**
 * role — RBAC on top of `auth`. Pass allowed roles from constants
 * (ADMIN_ROLES, MENTOR_ROLES, …). 401 if unauthenticated, 403 if role not allowed.
 */
export function role(allowedRoles: RoleCode[], handler: AuthenticatedHandler) {
  return auth(async (req, ctx, authUser) => {
    if (!authUser.role || !allowedRoles.includes(authUser.role as RoleCode)) {
      return NextResponse.json(
        { message: "Forbidden", statusCode: 403 },
        { status: 403 },
      );
    }
    return handler(req, ctx, authUser);
  });
}

/** silentAuth — optional auth; authUser is null when the token is missing/invalid. */
export function silentAuth(handler: OptionalAuthHandler) {
  return async (req: NextRequest, ctx: RouteContext = {}) => {
    const authUser = await resolveUser(req);
    return handler(req, ctx, authUser);
  };
}
