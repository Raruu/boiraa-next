import { BaseRepository } from "@/server/repositories/base.repository";
import type { Role } from "@/generated/prisma/client";

export class RoleRepository extends BaseRepository<Role> {
  protected modelName = "role";

  async findByCode(code: string): Promise<Role | null> {
    return this.model.findFirst({
      where: { code, deletedAt: null },
    });
  }
}
