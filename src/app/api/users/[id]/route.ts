import { NextRequest } from "next/server";
import { UserService } from "@/server/services";
import { updateUserSchema } from "@/server/validators";
import {
  apiResponse,
  errorResponse,
  zodIssuesToErrors,
} from "@/lib/api-utils";
import { role } from "@/lib/api-middleware";
import { ADMIN_ROLES } from "@/constants/common";

export const GET = role(ADMIN_ROLES, async (_req: NextRequest, ctx) => {
  try {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const user = await UserService.getById(id);
    if (!user) return errorResponse("User tidak ditemukan", 404);
    return apiResponse(user);
  } catch (err) {
    console.error("[GET /api/users/:id]", err);
    return errorResponse("Gagal mengambil data user", 500);
  }
});

export const PUT = role(ADMIN_ROLES, async (req: NextRequest, ctx) => {
  try {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Validasi gagal",
        422,
        zodIssuesToErrors(parsed.error.issues),
      );
    }

    const user = await UserService.update(
      id,
      parsed.data as Record<string, unknown>,
    );
    return apiResponse(user, "User berhasil diperbarui");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memperbarui user";
    return errorResponse(message, 400);
  }
});

export const DELETE = role(ADMIN_ROLES, async (_req: NextRequest, ctx) => {
  try {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    await UserService.delete(id);
    return apiResponse(null, "User berhasil dihapus");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus user";
    return errorResponse(message, 400);
  }
});
