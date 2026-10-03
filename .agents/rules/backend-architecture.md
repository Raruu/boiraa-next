# Backend Architecture

> **PROTECTED — see `AGENTS.md` → "Instruction File Protection".**
> Edit only when the user explicitly asks. Don't rewrite on your own initiative.

Server-side code follows a layered clean architecture. Every new domain must
walk the layers in order — never skip one, never call across layers.

```
prisma/schema.prisma          (1) Model definition
    ↓
server/repositories/          (2) Data access (extends BaseRepository)
    ↓
server/services/              (3) Business logic (static methods)
    ↓
server/validators/            (4) Zod input validation
    ↓
app/api/[domain]/route.ts     (5) HTTP handler: parse → validate → service → respond
```

---

## 1. Prisma Model

- All models live in `prisma/schema.prisma`.
- Always add `@@map("table_name")` with a plural snake_case name.
- Soft delete: add `deletedAt DateTime?`. Every query must filter
  `{ deletedAt: null }`.
- After editing the schema run:
  ```bash
  npx prisma generate   # regenerate the client
  npm run db:migrate    # apply the migration
  ```
  In Prisma v7 `migrate dev` no longer runs `generate` for you.

```prisma
model Article {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@map("articles")
}
```

### Prisma v7 specifics (read before touching Prisma code)

- The client is generated to `src/generated/prisma` and imported from
  `@/generated/prisma/client`. **Never** import from `@prisma/client`.
- The database URL is configured in `prisma.config.ts`, not in
  `datasource.url` (removed in v7).
- A driver adapter (`@prisma/adapter-pg`) is required. The adapter owns the
  connection pool, so pool settings belong on the adapter.
- Model types: `import type { Article } from "@/generated/prisma/client"`.
  For enum-only imports prefer `@/generated/prisma/enums` (tree-shakeable).
  Never import from `@/generated/prisma/internal/*`.

---

## 2. Repository

- Location: `src/server/repositories/[domain]/[domain].repository.ts`
- Extend `BaseRepository<ModelType>` from
  `@/server/repositories/base.repository`.
- Set `protected modelName` to the Prisma delegate key in camelCase
  (e.g. `"article"`, `"user"`).
- **ALL Prisma queries live here** — services and routes must not call
  `prisma` directly.
- Always include `{ deletedAt: null }` in the where clause.
- Register the repository in `src/server/repositories/index.ts`.

```typescript
// src/server/repositories/article/article.repository.ts
import { BaseRepository } from "@/server/repositories/base.repository";
import type { Article } from "@/generated/prisma/client";

export class ArticleRepository extends BaseRepository<Article> {
  protected modelName = "article";

  async findBySlug(slug: string): Promise<Article | null> {
    return this.model.findFirst({
      where: { slug, deletedAt: null },
    });
  }
}
```

### BaseRepository methods

| Method       | Signature                                            |
| ------------ | ---------------------------------------------------- |
| `findMany`   | `(options: PaginationOptions) → PaginatedResult<T>`  |
| `findAll`    | `(options?) → T[]`                                   |
| `findById`   | `(id, options?) → T \| null`                         |
| `findFirst`  | `(where, options?) → T \| null`                      |
| `create`     | `(data, options?) → T`                               |
| `update`     | `(id, data, options?) → T`                           |
| `delete`     | `(id) → T`                                           |
| `softDelete` | `(id) → T`                                           |
| `count`      | `(where?) → number`                                  |
| `upsert`     | `(where, create, update) → T`                        |

---

## 3. Service

- Location: `src/server/services/[domain]/[domain].service.ts`
- Every method is **static**.
- Business logic lives here: duplicate checks, cross-relation validation,
  data shaping. Validators only check shape and format.
- Throw `new Error("message")` for business errors — the route turns it into
  an `errorResponse`.
- Register the service in `src/server/services/index.ts`.

```typescript
// src/server/services/article/article.service.ts
import { ArticleRepository } from "@/server/repositories";
import { parseSortParam } from "@/lib/api-utils";

const articleRepo = new ArticleRepository();

export class ArticleService {
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
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    return articleRepo.findMany({
      page,
      limit,
      sort: parseSortParam(sort),
      where,
    });
  }

  static async getById(id: string) {
    const article = await articleRepo.findById(id);
    if (!article || article.deletedAt) return null;
    return article;
  }

  static async create(data: Record<string, unknown>) {
    return articleRepo.create(data);
  }

  static async update(id: string, data: Record<string, unknown>) {
    const existing = await articleRepo.findById(id);
    if (!existing || existing.deletedAt) throw new Error("Data tidak ditemukan");
    return articleRepo.update(id, data);
  }

  static async delete(id: string) {
    const existing = await articleRepo.findById(id);
    if (!existing || existing.deletedAt) throw new Error("Data tidak ditemukan");
    return articleRepo.softDelete(id);
  }
}
```

---

## 4. Validator (Zod v4)

- Location: `src/server/validators/[domain].validator.ts`
- Import from `"zod"` — v4 is the installed major, so the `/v4` subpath is not
  needed. (`import { z } from "zod"` resolves to v4 here.)
- Only shape & format validation, never business rules.
- Export inferred types with `z.infer<typeof schema>`.
- Register in `src/server/validators/index.ts`.

```typescript
// src/server/validators/article.validator.ts
import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  content: z.string().min(1, "Konten wajib diisi"),
  isPublished: z.boolean().optional().default(false),
});

export const updateArticleSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
```

---

## 5. API Route

- Location: `src/app/api/[domain]/route.ts` and
  `src/app/api/[domain]/[id]/route.ts`
- Responsibility: parse input → validate → call service → return response.
- **MUST** use helpers from `@/lib/api-utils`: `apiResponse`,
  `paginatedResponse`, `errorResponse`, `zodIssuesToErrors`. **Never** return
  `NextResponse.json()` directly.
- **MUST** protect with an auth middleware: `auth`, `role`, or `silentAuth`
  from `@/lib/api-middleware`.

```typescript
// src/app/api/articles/route.ts
import { NextRequest } from "next/server";
import { ArticleService } from "@/server/services";
import { createArticleSchema } from "@/server/validators";
import {
  apiResponse,
  paginatedResponse,
  errorResponse,
  parseQueryParams,
  zodIssuesToErrors,
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

    const result = await ArticleService.getAll({ page, limit, sort, search: searchStr });
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  } catch (err) {
    console.error("[GET /api/articles]", err);
    return errorResponse("Gagal mengambil data", 500);
  }
});

export const POST = role(ADMIN_ROLES, async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validasi gagal", 422, zodIssuesToErrors(parsed.error.issues));
    }

    const article = await ArticleService.create(parsed.data as Record<string, unknown>);
    return apiResponse(article, "Data berhasil dibuat", 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat data";
    return errorResponse(message, 400);
  }
});
```

---

## API Response Contract

**IMPORTANT:** The client expects these exact shapes — do not change them.

### Success — Single Item

```json
{ "data": {}, "message": "OK", "statusCode": 200 }
```

### Success — Paginated List

```json
{
  "data": [],
  "page": 1,
  "total": 100,
  "perPage": 10,
  "lastPage": 10,
  "nextPage": 2,
  "previousPage": null,
  "statusCode": 200,
  "message": "OK"
}
```

### Error — General

```json
{ "message": "Pesan error", "statusCode": 400 }
```

### Error — Validation (422)

```json
{
  "message": "Validasi gagal",
  "statusCode": 422,
  "errors": [
    { "rule": "too_small", "field": "name", "message": "Nama wajib diisi" }
  ]
}
```

---

## Query / Filter Contract

URL query params supported by `parseQueryParams()` from `@/lib/api-utils`:

| Parameter       | Format                   | Example                                |
| --------------- | ------------------------ | -------------------------------------- |
| Pagination      | `?page=1&limit=10`       | Default page=1, limit=10               |
| Sort ASC        | `?sort=name`             | `ORDER BY name ASC`                    |
| Sort DESC       | `?sort=-name`            | `ORDER BY name DESC` — leading `-`     |
| Search simple   | `?search=keyword`        | Match across the fields you pass       |
| Search specific | `?search[email]=keyword` | Match on the `email` field             |
| Filter operator | `?field[operator]=value` | See operator table below               |

### Filter operators

| Operator     | SQL equivalent    | Example                |
| ------------ | ----------------- | ---------------------- |
| `[eq]`       | `= value`         | `?status[eq]=active`   |
| `[ne]`       | `!= value`        | `?status[ne]=banned`   |
| `[gt]`       | `> value`         | `?age[gt]=18`          |
| `[gte]`      | `>= value`        | `?age[gte]=18`         |
| `[lt]`       | `< value`         | `?price[lt]=100`       |
| `[lte]`      | `<= value`        | `?price[lte]=100`      |
| `[contains]` | `ILIKE '%value%'` | `?name[contains]=john` |
| `[in]`       | `IN (values)`     | `?id[in]=1,2,3`        |

### Usage in a service

```typescript
const { page, limit, sort, search, filter } = parseQueryParams(req);
const sortObj = parseSortParam(sort);              // { name: "asc" }
const filterObj = parseFilterConditions(filter);   // { status: "active" }
const searchObj = buildSearchCondition(
  typeof search === "string" ? search : search?.value,
  ["name", "email"],
);                                                 // { OR: [...] }

const where = { ...filterObj, ...searchObj, deletedAt: null };
```

---

## Auth

- `src/lib/jwt.ts` signs/verifies the `at` (access, 5 min) and `rt`
  (refresh, 5 days) tokens.
- `src/lib/auth-cookies.ts` sets/clears the httpOnly cookies.
- `src/lib/api-middleware.ts` exposes `auth`, `role`, `silentAuth`.
- Routes never verify tokens by hand — pick the right middleware.
- `src/server/services/auth/auth.service.ts` is the single place that turns
  credentials into a token payload. Extend it for SSO, don't bypass it.

---

## File Upload

- All uploads go through `src/lib/upload.ts` (`uploadFile`, `uploadFiles`,
  `deleteFile`, `deleteFiles`). Never call the S3 client directly.
- Only the storage `key` is persisted in the database; the URL is derived.
- `POST /api/upload` and `DELETE /api/upload` are the ready-made endpoints.
- To switch storage backends (S3 → local disk), use the
  `s3-to-local-storage` skill in `.agents/skills/` instead of editing
  callers by hand.

---

## Background Jobs

- `QUEUE_ENABLED=false` (default): jobs run inline, synchronously, no Redis.
- `QUEUE_ENABLED=true`: BullMQ + Redis, a worker consumes jobs, and a recovery
  poller re-dispatches stuck DB rows.
- Dispatch through `QueueService.dispatch(type, payload)` — never touch BullMQ
  directly from a route.
- Every job gets a `QueueJob` audit row (source of truth for recovery).
- Add new job types to `QueuePayload` in
  `src/server/services/queue/queue.service.ts` and handle them in
  `src/server/workers/`.

---

## New Domain Checklist (Backend)

- [ ] Model added to `prisma/schema.prisma` with `@@map` + `deletedAt`
- [ ] `npx prisma generate` + `npm run db:migrate` run
- [ ] Repository in `src/server/repositories/[domain]/`, extends `BaseRepository`
- [ ] Repository registered in `src/server/repositories/index.ts`
- [ ] Service with static methods in `src/server/services/[domain]/`
- [ ] Service registered in `src/server/services/index.ts`
- [ ] Zod schemas in `src/server/validators/[domain].validator.ts` + registered
- [ ] API routes use `auth`/`role`/`silentAuth` and the `api-utils` helpers
- [ ] Soft-delete filter applied everywhere
- [ ] No `console.log` — `console.error` only inside catch blocks
