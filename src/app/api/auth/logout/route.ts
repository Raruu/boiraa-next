import { apiResponse } from "@/lib/api-utils";
import { clearAuthCookies } from "@/lib/auth-cookies";

/**
 * POST /api/auth/logout
 * Stateless: just clears the auth cookies. A still-valid `at` keeps working
 * until it expires (max 5 min).
 */
export async function POST() {
  const res = apiResponse(null, "Logout berhasil");
  clearAuthCookies(res);
  return res;
}
