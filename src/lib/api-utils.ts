import { NextRequest, NextResponse } from "next/server";

/**
 * API response contract — keep these shapes stable, the client depends on them.
 *
 * Success (single):  { data, message, statusCode }
 * Success (list):    { data, page, total, perPage, lastPage, nextPage,
 *                      previousPage, statusCode, message }
 * Error:             { message, statusCode, errors? }
 */

export type ValidationErrorDetail = {
  rule: string;
  field: string;
  message: string;
};

export function apiResponse<T>(data: T, message = "OK", statusCode = 200) {
  return NextResponse.json({ data, message, statusCode }, { status: statusCode });
}

export class ValidationError extends Error {
  public errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    super("Validasi gagal");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
  message = "OK",
) {
  const lastPage = Math.ceil(total / perPage);
  return NextResponse.json({
    data,
    page,
    total,
    perPage,
    lastPage,
    nextPage: page < lastPage ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
    statusCode: 200,
    message,
  });
}

export function errorResponse(
  message: string,
  statusCode = 400,
  errors?: ValidationErrorDetail[],
) {
  return NextResponse.json(
    { message, statusCode, ...(errors ? { errors } : {}) },
    { status: statusCode },
  );
}

/** Map Zod issues to the wire format used by the client. */
export function zodIssuesToErrors(
  issues: { code: string; path: PropertyKey[]; message: string }[],
): ValidationErrorDetail[] {
  return issues.map((issue) => ({
    rule: issue.code,
    field: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

/**
 * Parse supported query params:
 *   ?page=1&limit=10
 *   ?sort=-createdAt
 *   ?search=keyword            or   ?search[email]=keyword
 *   ?status[eq]=active         (see FILTER_OPERATORS below)
 */
export function parseQueryParams(req: NextRequest) {
  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const sort = url.searchParams.get("sort") || undefined;

  let search: string | { fields: string; value: string } | undefined =
    url.searchParams.get("search") || undefined;

  url.searchParams.forEach((value, key) => {
    const searchMatch = key.match(/^search\[(.+)\]$/);
    if (searchMatch) search = { fields: searchMatch[1], value };
  });

  const filter: Record<string, Record<string, unknown>> = {};
  url.searchParams.forEach((value, key) => {
    const match = key.match(/^(.+)\[(.+)\]$/);
    if (!match) return;
    const [, field, operator] = match;
    if (field === "search") return;
    if (!filter[field]) filter[field] = {};
    filter[field][operator] = value;
  });

  return {
    page,
    limit,
    sort,
    search,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  };
}

/** `sort=name` → ASC, `sort=-name` → DESC. */
export function parseSortParam(
  sort: string | undefined,
  defaultSort: Record<string, "asc" | "desc"> = { createdAt: "desc" },
): Record<string, "asc" | "desc"> {
  if (!sort) return defaultSort;
  if (sort.startsWith("-")) return { [toCamelCase(sort.slice(1))]: "desc" };
  return { [toCamelCase(sort)]: "asc" };
}

/** Translate `field[operator]=value` params into a Prisma `where` fragment. */
export function parseFilterConditions(
  filter: Record<string, Record<string, unknown>> | undefined,
): Record<string, unknown> {
  if (!filter) return {};

  const conditions: Record<string, unknown> = {};
  Object.entries(filter).forEach(([field, operators]) => {
    const camelField = toCamelCase(field);
    Object.entries(operators).forEach(([op, value]) => {
      switch (op) {
        case "eq":
          conditions[camelField] = value;
          break;
        case "ne":
          conditions[camelField] = { not: value };
          break;
        case "gt":
          conditions[camelField] = { gt: value };
          break;
        case "gte":
          conditions[camelField] = { gte: value };
          break;
        case "lt":
          conditions[camelField] = { lt: value };
          break;
        case "lte":
          conditions[camelField] = { lte: value };
          break;
        case "contains":
          conditions[camelField] = {
            contains: value as string,
            mode: "insensitive",
          };
          break;
        case "in":
          conditions[camelField] = {
            in: typeof value === "string" ? value.split(",") : value,
          };
          break;
      }
    });
  });
  return conditions;
}

/** Build a case-insensitive OR search across the given fields. */
export function buildSearchCondition(
  search: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (!search || !fields.length) return undefined;
  return {
    OR: fields.map((field) => ({
      [toCamelCase(field)]: { contains: search, mode: "insensitive" },
    })),
  };
}

/** Every soft-deletable query must exclude rows where `deletedAt` is set. */
export function softDeleteFilter() {
  return { deletedAt: null };
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
