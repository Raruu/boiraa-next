import { NextRequest } from "next/server";
import {
  apiResponse,
  errorResponse,
} from "@/lib/api-utils";
import {
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth-cookies";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/jwt";
import { AuthService } from "@/server/services";

/**
 * POST /api/auth/refresh
 * Verifies `rt`, then issues a fresh `at` + `rt` pair (rotation).
 */
export async function POST(req: NextRequest) {
  try {
    const rt = getRefreshToken(req);
    if (!rt) return errorResponse("No refresh token", 401);

    const sub = await verifyRefreshToken(rt);
    if (!sub) {
      const res = errorResponse("Sesi berakhir, silakan login ulang", 401);
      clearAuthCookies(res);
      return res;
    }

    const payload = await AuthService.getById(sub);
    if (!payload) {
      const res = errorResponse("Sesi berakhir, silakan login ulang", 401);
      clearAuthCookies(res);
      return res;
    }

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload.sub),
    ]);

    const res = apiResponse(null, "Token diperbarui");
    setAuthCookies(res, { accessToken, refreshToken });
    return res;
  } catch (err) {
    console.error("[POST /api/auth/refresh]", err);
    return errorResponse("Gagal memperbarui token", 500);
  }
}
