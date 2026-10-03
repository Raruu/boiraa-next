import { prisma } from "@/lib/prisma";
import { softDeleteFilter } from "@/lib/api-utils";

export type PaginationOptions = {
  page: number;
  limit: number;
  sort?: Record<string, "asc" | "desc">;
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Base Repository — generic data-access layer for Prisma models.
 * Subclasses set `modelName` to the Prisma delegate key (e.g. "user").
 *
 * ALL Prisma queries live in repositories. Services and routes must never
 * touch `prisma` directly.
 */
export abstract class BaseRepository<T = unknown> {
  protected abstract modelName: string;

  protected get prisma() {
    return prisma;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected get model(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any)[this.modelName];
  }

  async findMany(options: PaginationOptions): Promise<PaginatedResult<T>> {
    const { page, limit, sort, where = {}, include, select } = options;

    const queryOptions: Record<string, unknown> = {
      where,
      orderBy: sort || { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    };
    if (include) queryOptions.include = include;
    if (select) queryOptions.select = select;

    const [data, total] = await Promise.all([
      this.model.findMany(queryOptions),
      this.model.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAll(
    options: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
      orderBy?: Record<string, "asc" | "desc">;
    } = {},
  ): Promise<T[]> {
    const { where = {}, include, select, orderBy } = options;
    const queryOptions: Record<string, unknown> = { where };
    if (include) queryOptions.include = include;
    if (select) queryOptions.select = select;
    if (orderBy) queryOptions.orderBy = orderBy;
    return this.model.findMany(queryOptions);
  }

  async findById(
    id: string,
    options: {
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    } = {},
  ): Promise<T | null> {
    const queryOptions: Record<string, unknown> = { where: { id } };
    if (options.include) queryOptions.include = options.include;
    if (options.select) queryOptions.select = options.select;
    return this.model.findUnique(queryOptions);
  }

  async findFirst(
    where: Record<string, unknown>,
    options: {
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    } = {},
  ): Promise<T | null> {
    const queryOptions: Record<string, unknown> = { where };
    if (options.include) queryOptions.include = options.include;
    if (options.select) queryOptions.select = options.select;
    return this.model.findFirst(queryOptions);
  }

  async create(
    data: Record<string, unknown>,
    options: { include?: Record<string, unknown> } = {},
  ): Promise<T> {
    const queryOptions: Record<string, unknown> = { data };
    if (options.include) queryOptions.include = options.include;
    return this.model.create(queryOptions);
  }

  async update(
    id: string,
    data: Record<string, unknown>,
    options: {
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    } = {},
  ): Promise<T> {
    const queryOptions: Record<string, unknown> = { where: { id }, data };
    if (options.include) queryOptions.include = options.include;
    if (options.select) queryOptions.select = options.select;
    return this.model.update(queryOptions);
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where: Record<string, unknown> = {}): Promise<number> {
    return this.model.count({ where });
  }

  async upsert(
    where: Record<string, unknown>,
    create: Record<string, unknown>,
    update: Record<string, unknown>,
  ): Promise<T> {
    return this.model.upsert({ where, create, update });
  }

  protected softDeleteFilter() {
    return softDeleteFilter();
  }
}
