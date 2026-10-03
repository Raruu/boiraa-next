import { ROLE_CODE } from "@/constants/common";

/**
 * Local JWT auth config (no SSO).
 *
 * Two short-lived, signed tokens kept in httpOnly cookies:
 *   at (access)  — 5 minutes — carries identity + role, checked on every API call
 *   rt (refresh) — 5 days    — only used to mint a new pair at /api/auth/refresh
 *
 * Stateless: there is no session table. Logout just clears the cookies; a
 * still-valid `at` keeps working until it expires (max 5 min). If you need
 * hard revocation, add a refresh-token store + rotation here.
 */

export const COOKIE_AT = "at";
export const COOKIE_RT = "rt";

// seconds
export const ACCESS_TOKEN_TTL = 60 * 5; // 5 minutes
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 5; // 5 days

export const JWT_ISSUER = "boiraa-next";
export const JWT_ALG = "HS256";

/** HMAC secret for signing both tokens. MUST be overridden in production. */
export const AUTH_SECRET =
  process.env.AUTH_JWT_SECRET || "dev-only-insecure-secret-change-me";

/**
 * Demo credential used by the seed script and the login form.
 * Replace `AuthService.authenticate` with a real DB lookup when you wire up
 * actual accounts — the seeded admin uses this email/password.
 */
export const DEMO_CREDENTIAL = {
  email: process.env.AUTH_DEMO_EMAIL || "admin@demo.com",
  password: process.env.AUTH_DEMO_PASSWORD || "password",
};

export const DEMO_USER = {
  id: "demo-admin",
  email: DEMO_CREDENTIAL.email,
  fullname: "Demo Admin",
  role: ROLE_CODE.ADMIN as string,
};

export type AuthTokenPayload = {
  /** user id */
  sub: string;
  email: string;
  fullname: string;
  role: string;
};
