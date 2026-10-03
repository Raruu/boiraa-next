import * as jose from "jose";
import {
  AUTH_SECRET,
  JWT_ALG,
  JWT_ISSUER,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  type AuthTokenPayload,
} from "@/lib/auth-config";

const secret = new TextEncoder().encode(AUTH_SECRET);

/* Sign helpers ---------------------------------------------------------- */

export async function signAccessToken(
  payload: AuthTokenPayload,
): Promise<string> {
  return new jose.SignJWT({ ...payload, typ: "at" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuer(JWT_ISSUER)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(secret);
}

export async function signRefreshToken(sub: string): Promise<string> {
  return new jose.SignJWT({ typ: "rt" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuer(JWT_ISSUER)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL}s`)
    .sign(secret);
}

/* Verify helpers ------------------------------------------------------- */

export async function verifyAccessToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      clockTolerance: 5,
    });
    if (payload.typ !== "at" || !payload.sub) return null;
    return {
      sub: payload.sub,
      email: (payload.email as string) || "",
      fullname: (payload.fullname as string) || "",
      role: (payload.role as string) || "",
    };
  } catch {
    return null;
  }
}

/** Returns the subject (user id) if the refresh token is valid, else null. */
export async function verifyRefreshToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      clockTolerance: 5,
    });
    if (payload.typ !== "rt" || !payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
