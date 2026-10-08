---
name: boiraa-setup
description: One-time setup of this boilerplate — rename the project, choose storage backend, database/ORM, queue/email, and UI library, then adapt rules and memory. Run ONLY when the user explicitly asks to set up, initialize, or scaffold this project. Never trigger it as part of another task.
license: MIT
metadata:
  audience: maintainers
  workflow: project-initialization
---

# Boiraa Setup

Turns this boilerplate into a specific project: renames it, lets the user
choose the backend stack, storage, and UI library, then updates the rules and
memory so the documentation matches the result.

This is a **one-time, interactive** skill. It changes many files at once and
deletes things, so it always asks before acting.

## When to use me

- "Set up this project" / "initialize this boilerplate" / "scaffold a new
  project from here"
- "I want to use Drizzle instead of Prisma"
- "Remove the database, this is a frontend-only app"
- "Use shadcn/ui instead of these components"

## When NOT to use me

- Any other task. The user must invoke this explicitly. If you are mid-task and
  notice the project still has boilerplate defaults, **finish your task first**
  and mention this skill — do not run it.
- Changing only the storage backend on an already-configured project. Use
  "Partial re-run" below instead.

## Asking the questions

Use your harness's interactive question tool if it has one — OpenCode:
`question`; Claude Code: `AskUserQuestion`. Batch the independent questions
into a single call. If your harness has no such tool, ask them as plain text
and wait for answers.

**Never proceed on assumed defaults without asking.** The whole point is that
the user decides.

### Batch 1 — independent questions, ask all at once

| # | Question | Options |
| --- | --- | --- |
| 1 | Project name | free text (also derive a kebab-case package name) |
| 2 | File storage | S3 (default) · local disk · not sure yet |
| 3 | Database | Prisma 7 + PostgreSQL (default) · different ORM · no database |
| 5 | UI library | none, keep the built-in components (default) · shadcn/ui · other |

### Batch 2 — ask only what Batch 1 made relevant

| # | Question | Ask only when |
| --- | --- | --- |
| 4 | Background jobs & email | the user kept a database |
| 6 | Replace all components? + what to do with `/internal/components` | the user named a UI library |
| — | Confirm each destructive cascade | anything will be deleted |

Skipping an irrelevant question is deliberate: if the database is gone, the
queue must go too, so asking about it would be noise.

## Decision tree — question 3

```
Keep a database?
├─ Yes → ORM: Prisma 7 (default) / Drizzle / other
│        DB:  PostgreSQL (default) / MySQL / SQLite
└─ No
   ├─ Auth → removed entirely (see references/remove-auth.md)
   ├─ /api/users → removed
   ├─ Queue & email → MUST be removed (QueueJob depends on the DB)
   ├─ /api/upload and other endpoints → left open, recorded in AGENTS.md
   └─ Dashboard → reworked (no role/email to show)
```

## Order of operations

Follow this order. Later steps depend on earlier ones — reordering breaks
things, especially step 7.

```
1  Idempotency check
2  Project name            → references/rename-map.md
3  Backend (DB / ORM)      → references/remove-db.md if removed
4  Auth                     → references/remove-auth.md if DB was removed
5  Queue & email            → references/remove-queue.md if DB was removed
6  Storage                  → references/local-upload.ts etc. if local disk
7  UI library               → references/replace-ui.md
8  Metadata & docs          → README, AGENTS.md, .agents/rules, .env.example
9  Sidebar dead links       → fix MENU + LABEL_MAP
10 Verify                   → build + test + lint
11 Memory                   → MEMORY.md index + .agents/memory/<slug>.md
12 Ask about committing
```

**Why the DB comes before auth:** auth reads the `users` table. Removing the
database first tells you exactly what auth has left to stand on.

**Why the UI library comes last:** `/internal/components` imports most of
`src/components/ui/*`. Replacing components before deciding that page's fate
leaves the showcase broken in the middle of the run.

### 1. Idempotency check

Before asking anything, check whether this project has already been set up:

```bash
grep -n "NEXT_PUBLIC_APP_NAME" .env.example
grep -n '"name"' package.json
grep -rn "Boiraa" --include="*.tsx" --include="*.ts" src/ | head
```

If the name is no longer `Boiraa` / `boiraa-next`, the project was configured
before. Stop and ask whether to re-run a specific step or leave it alone —
never silently overwrite earlier decisions.

### 2. Project name

`references/rename-map.md` lists every place the name appears. **Memory files
are excluded on purpose** — entries are written to stay project-neutral.

### 3–5. Backend changes

Read the matching reference before deleting anything:

| Situation | Reference |
| --- | --- |
| Database removed | `references/remove-db.md` |
| Auth removed (follows from the above) | `references/remove-auth.md` |
| Queue & email removed | `references/remove-queue.md` |

Each one lists the files to delete, the files to edit, the dependencies to
uninstall, and the environment variables to drop. **Confirm with the user
before each cascade** — these are irreversible without git.

### 6. Storage

| Choice | Action |
| --- | --- |
| S3 (default) | nothing to do |
| Local disk | follow "Partial re-run" below |

### 7. UI library

Read `references/replace-ui.md`. It contains an audit of which components are
actually used where — replacing all of them blindly wastes effort, because most
are only referenced by the showcase page.

### 8. Metadata & docs

Update: `README.md`, `AGENTS.md` (title, stack section, non-negotiables),
`.agents/rules/*.md` where they name a removed technology, `.env.example`.

**These files are protected** (see `AGENTS.md` → "Instruction File
Protection"). Invoking this skill **is** the user's authorization to edit them
— but report the doc changes as their own diff, separate from the code changes,
so they are reviewable on their own.

### 9. Sidebar dead links

`src/components/dashboard/sidebar.tsx` ships with menu entries for
`/dashboard/pengguna` and `/dashboard/pengaturan`, but neither page exists —
they 404. Trim `MENU` to the pages that exist, and keep
`src/components/dashboard/breadcrumb.tsx`'s `LABEL_MAP` in sync. If the user
wants those sections, offer to scaffold the pages instead.

### 10. Verify

```bash
npm run build
npm test
npm run lint
```

All three must pass. Then exercise the routes if a dev server is available:
the home page, `/login` (if auth survives), `/dashboard`, and the 404 page.

### 11. Memory

Record what was decided, following `AGENTS.md` → "Memory":

- Append one index line to `MEMORY.md`.
- Write the full entry to `.agents/memory/<slug>.md`.

Suggested tags: `[db]`, `[auth]`, `[storage]`, `[ui]`, `[build]`.

Both files need no approval. **Do not rename the project inside memory
entries** — describe things by role instead.

### 12. Commit

Ask before committing. If the user agrees, suggest a message and follow
`.agents/rules/git-commit.md`. The build/test/lint gate in step 10 is the
pre-push check; do not commit before it is green.

## Partial re-run — storage only

For changing the storage backend after setup (for example S3 → local disk
later). Skip every other step.

1. Confirm the destination: private `storage/` served through the
   auth-protected `/api/files` route (recommended), or `public/uploads/`
   served directly by Next.js. The reference code implements the private one.
2. Read the current `src/lib/upload.ts` and `src/app/api/upload/route.ts` so
   you preserve the exported surface: `uploadFile`, `uploadFiles`,
   `deleteFile`, `deleteFiles`, `buildFileUrl`, `UploadResult`, `UploadOptions`.
3. Replace `src/lib/upload.ts` with `references/local-upload.ts`. It keeps the
   same exports and adds `resolveStoragePath` / `resolvePublicPath`.
4. Add `src/lib/file-url.ts` from `references/file-url.ts`.
5. Add `src/app/api/files/[...path]/route.ts` from `references/files-route.ts`.
6. Update `.env.example` and `.gitignore` per
   `references/env-and-gitignore.md`.
7. Remove the AWS dependency — only after the user confirms:
   `npm uninstall @aws-sdk/client-s3`, then delete `src/lib/s3.ts`.
8. Verify with build + test + lint, then exercise `/api/upload` and
   `/api/files/...` against a dev server.
9. Record the change in memory, and offer to update the File Upload section of
   `.agents/rules/backend-architecture.md`.

## Guardrails

- **Never run without an explicit request.** The description gates this; honor it.
- **Never overwrite a previous setup silently.** Run the idempotency check first.
- **Confirm before every deletion cascade.** Auth, database, and queue removals
  are hard to undo without git.
- **Report doc changes separately.** Editing `AGENTS.md` and `.agents/rules/`
  is authorized by invoking this skill, but must be its own diff.
- **Never rename the project inside memory.** Entries stay project-neutral.
- **Keep `upload.ts`'s interface stable** when swapping storage — if you find
  yourself editing routes or services, the compatibility layer is wrong.
- **Path traversal is the main storage risk.** The reference code sanitizes
  every path segment and verifies the resolved path stays inside the storage
  root. Do not simplify that away.
- **Verify before committing.** build + test + lint, always.
- **Left-open endpoints must be recorded.** If auth is removed, note in
  `AGENTS.md` that `/api/upload` and other endpoints are intentionally public,
  so it reads as a decision rather than an oversight.

## Notes

- Storage keys in the database are relative (`uploads/...`), never full URLs.
  `fileUrl()` derives the URL on read — that is what makes the backend
  swappable.
- `QUEUE_ENABLED=false` runs jobs inline with no Redis. Removing the queue is
  only necessary when the database goes away, since `QueueJob` is a Prisma model.
- Pre-existing S3 objects are **not** migrated by the storage swap. Say so
  explicitly if the project already has files in production.
