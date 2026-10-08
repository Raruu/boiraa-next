# Removing the database

Used when the user answers "no database" to question 3. **Confirm before
executing** — this deletes a lot.

## Consequence map

The database currently holds four unrelated things. Removing it means deciding
what happens to each:

| Depends on the DB | Files | Outcome |
| --- | --- | --- |
| Auth (bcrypt + `users` table) | `auth.service.ts`, `user.repository.ts`, `/api/auth/*` | Removed — see `remove-auth.md` |
| User CRUD | `/api/users`, `use-users.ts`, `user-service.ts`, `types/user.ts` | Removed |
| Queue audit log (`QueueJob` model) | `queue.service.ts`, `queue.repository.ts`, `queue-recovery.ts` | Removed — see `remove-queue.md` |
| Dashboard identity | `dashboard/page.tsx` | Reworked (no role/email to display) |

## Files to delete

```
prisma/                              (schema.prisma, seed.ts, seeds/, migrations/)
prisma.config.ts
src/generated/prisma/
src/lib/prisma.ts
src/server/repositories/             (entire directory, incl. base.repository.ts)
src/server/services/user/
src/server/services/queue/           (if not already removed)
src/app/api/users/
src/hooks/use-users.ts
src/services/user-service.ts
src/types/user.ts
```

## Files to edit

| File | Change |
| --- | --- |
| `src/server/services/index.ts` | Drop the `UserService` (and queue) exports |
| `package.json` | Remove the `db:*` scripts; `build` becomes plain `next build` (no `prisma generate`); drop the `prisma.seed` block if present |
| `.env.example` | Remove `DATABASE_URL` |
| `.gitignore` | Remove the `prisma/migrations/*` and `/src/generated/` blocks |
| `.agents/rules/backend-architecture.md` | Rewrite the Prisma and Repository sections — the layered pattern still applies, but the data-access layer no longer exists |
| `.agents/rules/security.md` | Adjust the Database Security section |
| `AGENTS.md` | Remove `prisma generate` from the build command; update the stack list and the non-negotiables about repositories and `deletedAt` |
| `README.md` | Drop the Prisma section, the `db:*` scripts, and the database quick-start steps |

## Dependencies to uninstall

```bash
npm uninstall @prisma/client @prisma/adapter-pg pg prisma
npm uninstall @types/pg dotenv
```

`bcryptjs` also goes if auth is removed — check `prisma/seed.ts` was the only
other consumer before dropping it.

## Verify

```bash
grep -rn "prisma\|Prisma" --include="*.ts" --include="*.tsx" src/ | grep -v generated
```

Should return nothing outside of comments. Then `npm run build`, `npm test`,
`npm run lint`.

## If the user wants a different ORM

Same deletion list, but instead of leaving `src/server/repositories/` empty,
keep `base.repository.ts` as the interface and reimplement its methods against
the new ORM. The rule that matters — **all queries live in the repository
layer, never in services or routes** — survives the swap; only the
implementation changes.
