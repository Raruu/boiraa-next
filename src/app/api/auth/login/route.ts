import { NextRequest } from "next/server";
import { apiResponse, errorResponse, zodIssuesToErrors } from "@/lib/api-utils";
import { loginSchema } from "@/server/validators";
import { AuthService } from "@/server/services";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/auth-cookies";

/**
 * POST /api/auth/login  { email, password }
 * Verifies the credential, then sets the `at` + `rt` httpOnly cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Validasi gagal",
        422,
        zodIssuesToErrors(parsed.error.issues),
      );
    }

    const payload = await AuthService.authenticate(
      parsed.data.email,
      parsed.data.password,
    );
    // Generic message on purpose — don't reveal which field was wrong
    if (!payload) return errorResponse("Email atau password salah", 401);

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload.sub),
    ]);

    const res = apiResponse(
      {
        id: payload.sub,
        email: payload.email,
        fullname: payload.fullname,
        role: payload.role,
      },
      "Login berhasil",
    );
    setAuthCookies(res, { accessToken, refreshToken });
    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return errorResponse("Gagal memproses login", 500);
  }
}
