import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-utils";
import { auth } from "@/lib/api-middleware";

/**
 * GET /api/auth/me
 * Returns the current user, read straight from the verified access token.
 */
export const GET = auth(async (_req: NextRequest, _ctx, authUser) => {
  return apiResponse({
    id: authUser.id,
    email: authUser.email,
    fullname: authUser.fullname,
    role: authUser.role,
  });
});
