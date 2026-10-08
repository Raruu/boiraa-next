# Boiraa Next

A full-stack Next.js boilerplate with layered architecture, a complete design
system, and AI-agent instructions built in.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → set DATABASE_URL and AUTH_JWT_SECRET

# 3. Generate the Prisma client
npm run db:generate

# 4. Create the tables
npm run db:migrate

# 5. Seed roles + the demo admin
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Log in with the seeded demo account: **admin@demo.com** / **password**
(override with `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD`).

---

## Scripts

```bash
npm run dev          # development server
npm run build        # prisma generate && next build
npm start            # production server
npm run lint         # eslint
npm test             # vitest (run once)
npm run test:watch   # vitest (watch)
npm run db:generate  # generate the Prisma client
npm run db:migrate   # create + apply a migration
npm run db:push      # push the schema directly (prototyping)
npm run db:studio    # Prisma Studio (database GUI)
npm run db:seed      # run prisma/seed.ts
```

---

## Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                 |
| Database  | PostgreSQL via Prisma 7 + `@prisma/adapter-pg`     |
| Validation| Zod 4                                              |
| Data      | React Query 5, React Hook Form                     |
| Styling   | Tailwind CSS 4, Onest font, semantic design tokens |
| Auth      | Local JWT (`at` + `rt` in httpOnly cookies)        |
| Storage   | S3 (swappable to local disk — see below)           |
| Jobs      | BullMQ + Redis (opt-in via `QUEUE_ENABLED`)        |
| Email     | Nodemailer over SMTP                               |
| Tests     | Vitest 5                                           |

### Version pins that matter

Some majors are deliberately held back — don't "upgrade" them blindly:

| Package    | Pinned | Why                                                     |
| ---------- | ------ | ------------------------------------------------------- |
| `typescript` | 6.x  | `typescript-eslint` 8.x does not support TypeScript 7   |
| `eslint`     | 9.x  | `eslint-config-next` breaks on ESLint 10                |
| `jsdom`      | 29.x | jsdom 30 requires Node ≥ 22.22.2 / ≥ 24.15              |

---

## Architecture

### Backend layers

```
prisma/schema.prisma      → model definitions
server/repositories/      → data access (extends BaseRepository)
server/services/          → business logic (static methods)
server/validators/        → Zod input validation
app/api/[domain]/route.ts → HTTP handler
```

### Frontend layers

```
types/                    → TypeScript types
services/                 → API callers (wrap @/lib/api-client)
hooks/                    → React Query hooks
components/ + app/        → UI
```

### API response contract

```jsonc
// success (single)
{ "data": {}, "message": "OK", "statusCode": 200 }

// success (list)
{ "data": [], "page": 1, "total": 100, "perPage": 10, "lastPage": 10,
  "nextPage": 2, "previousPage": null, "statusCode": 200, "message": "OK" }

// error
{ "message": "Pesan error", "statusCode": 400 }

// validation error (422)
{ "message": "Validasi gagal", "statusCode": 422,
  "errors": [{ "rule": "too_small", "field": "name", "message": "Nama wajib diisi" }] }
```

Full details: `.agents/rules/backend-architecture.md`.

---

## Prisma v7 notes

- The database URL lives in **`prisma.config.ts`**, not in `datasource.url`
  (that field was removed in v7).
- The client is generated into `src/generated/prisma` — import from
  `@/generated/prisma/client`, never `@prisma/client`.
- A driver adapter (`@prisma/adapter-pg`) is required. It owns the connection
  pool.
- `prisma migrate dev` no longer runs `prisma generate`; the `build` script
  handles generation explicitly.
- Seeding is no longer automatic — run `npm run db:seed`.

---

## Design system

All base components live in `src/components/ui/`. Preview them in development
at [http://localhost:3000/internal/components](http://localhost:3000/internal/components)
(returns 404 outside development).

**Rebranding:** edit only the `BRAND COLOR PALETTE` section in
`src/app/globals.css`. Every semantic token (`primary`, `accent`, `ring`, …)
derives from it.

Full component API: `.agents/rules/design-system.md`.

---

## Storage backends

Uploads go through `src/lib/upload.ts`. Today it writes to S3.

Swapping the backend (for example to a private `storage/` directory served
through an auth-protected `/api/files` route) only requires reimplementing that
module — the exported surface (`uploadFile`, `uploadFiles`, `deleteFile`,
`deleteFiles`, `buildFileUrl`) is the contract, so callers stay untouched.

---

## Background jobs

`QUEUE_ENABLED=false` (the default) runs jobs inline — no Redis required, so a
fresh clone works with zero infrastructure.

Set `QUEUE_ENABLED=true` and provide `REDIS_URL` to route jobs through BullMQ,
run the worker, and enable the stuck-job recovery poller.

---

## AI agent instructions

This repo is set up for AI coding agents:

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Entry point: non-negotiables, stack, working style, and instruction-file protection rules |
| `MEMORY.md` | Index of project memory — agent may append and prune freely |
| `.agents/memory/` | Full memory entries, loaded on demand from the index |
| `.agents/rules/` | Detailed architecture, design system, security, and git standards |
| `.agents/skills/` | Task skills, loaded on demand (currently: `boiraa-setup`) |

`AGENTS.md`, `.agents/rules/`, and the skill files are protected: agents must
ask before rewriting them. Memory is the deliberate exception — `MEMORY.md` is
a capped index and `.agents/memory/` holds the full entries, so decisions and
gotchas survive across sessions without an approval round trip. See
"Instruction File Protection" in `AGENTS.md`.

---

## Testing

```bash
npm test
```

Tests live next to the code they cover (`src/**/*.test.ts`). The default
environment is `node`; add `// @vitest-environment jsdom` at the top of a file
for DOM tests.

`src/lib/example.test.ts` is a placeholder that proves the setup works — it is
explicitly safe to delete once you add real tests.
