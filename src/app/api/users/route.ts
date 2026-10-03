import { NextRequest } from "next/server";
import { UserService } from "@/server/services";
import {
  paginatedResponse,
  errorResponse,
  parseQueryParams,
} from "@/lib/api-utils";
import { role } from "@/lib/api-middleware";
import { ADMIN_ROLES } from "@/constants/common";

export const GET = role(ADMIN_ROLES, async (req: NextRequest) => {
  try {
    const { page, limit, sort, search } = parseQueryParams(req);
    const searchStr =
      typeof search === "string"
        ? search
        : (search as { fields: string; value: string } | undefined)?.value;

    const result = await UserService.getAll({
      page,
      limit,
      sort,
      search: searchStr,
    });
    return paginatedResponse(
      result.data,
      result.total,
      result.page,
      result.limit,
    );
  } catch (err) {
    console.error("[GET /api/users]", err);
    return errorResponse("Gagal mengambil data user", 500);
  }
});
