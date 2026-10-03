import {
  UserRepository,
  USER_SAFE_SELECT,
} from "@/server/repositories/user/user.repository";
import { parseSortParam } from "@/lib/api-utils";

const userRepo = new UserRepository();

/**
 * User business logic.
 *
 * Every read that reaches an API response selects `USER_SAFE_SELECT` so the
 * bcrypt hash never leaves the server. `findByEmail` (which needs the hash) is
 * only used by AuthService.
 */
export class UserService {
  static async getAll(options: {
    page: number;
    limit: number;
    sort?: string;
    search?: string;
  }) {
    const { page, limit, sort, search } = options;

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { fullname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    return userRepo.findMany({
      page,
      limit,
      sort: parseSortParam(sort),
      where,
      select: USER_SAFE_SELECT,
    });
  }

  static async getById(id: string) {
    const user = await userRepo.findByIdSafe(id);
    if (!user || user.deletedAt) return null;
    return user;
  }

  static async update(id: string, data: Record<string, unknown>) {
    const existing = await userRepo.findById(id);
    if (!existing || existing.deletedAt) throw new Error("User tidak ditemukan");

    const updateData: Record<string, unknown> = {};
    if (data.fullname !== undefined) updateData.fullname = data.fullname;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.province !== undefined) updateData.province = data.province;

    return userRepo.update(id, updateData, { select: USER_SAFE_SELECT });
  }

  static async delete(id: string) {
    const user = await userRepo.findById(id);
    if (!user || user.deletedAt) throw new Error("User tidak ditemukan");
    await userRepo.softDelete(id);
  }
}
