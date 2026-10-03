import { BaseRepository } from "@/server/repositories/base.repository";
import type { User } from "@/generated/prisma/client";

/**
 * Columns safe to expose over the API.
 *
 * `password` (the bcrypt hash) must never leave the server — every read that
 * feeds a response uses this select. `findByEmail` deliberately bypasses it
 * because the auth service needs the hash to compare.
 */
export const USER_SAFE_SELECT = {
  id: true,
  roleId: true,
  username: true,
  email: true,
  fullname: true,
  phone: true,
  city: true,
  province: true,
  avatar: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  role: true,
} as const;

export type SafeUser = Omit<User, "password"> & {
  role?: { id: string; code: string; name: string };
};

export class UserRepository extends BaseRepository<User> {
  protected modelName = "user";

  /** Includes the password hash — for authentication only. */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findFirst({
      where: { email, deletedAt: null },
    });
  }

  /** Password-free read for API responses. */
  async findByIdSafe(id: string): Promise<SafeUser | null> {
    return this.model.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });
  }
}
