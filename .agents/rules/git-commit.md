# Git & Commit Standards

> **PROTECTED — see `AGENTS.md` → "Instruction File Protection".**
> Edit only when the user explicitly asks. Don't rewrite on your own initiative.

---

## Commit message format

```
type(scope): short message
```

### Type

| Type       | When to use                            |
| ---------- | -------------------------------------- |
| `feat`     | New feature                            |
| `fix`      | Bug fix                                |
| `refactor` | Refactor with no behavior change       |
| `style`    | Formatting, whitespace, semicolons     |
| `docs`     | Documentation                          |
| `chore`    | Config, dependencies, tooling          |
| `perf`     | Performance improvement                |
| `test`     | Add/change tests                       |

### Scope

The module/domain that changed. Examples: `auth`, `user`, `article`, `ui`,
`config`, `prisma`.

### Examples

```
feat(article): add CRUD API routes
fix(auth): token expiry check
refactor(user): extract validation to service
chore(prisma): add Article model
style(ui): fix button padding
docs(readme): update setup instructions
```

### Rules

- All lowercase
- No trailing period
- ~50 characters max (short and clear)
- English
- One line describing the change — no essays

---

## Build check (MANDATORY before push)

```bash
npm run build
```

If the build fails, **DO NOT push**. Fix the error first.

---

## Test check (MANDATORY before push)

```bash
npm test
```

The suite must pass. The placeholder test in `src/lib/example.test.ts` is
expected to pass; delete it once you have real tests (it is explicitly safe to
delete).

---

## Standards compliance check (MANDATORY)

Before committing, confirm the change follows every architecture standard.

### Frontend (`.agents/rules/frontend-architecture.md`)

- [ ] Uses components from `src/components/ui/` — nothing hand-rolled
- [ ] Colors use semantic tokens — no hardcoded hex
- [ ] Focus ring = brand color, error = red
- [ ] Hooks use `"use client"` + the React Query pattern
- [ ] Services use `api` from `@/lib/api-client`
- [ ] Toasts via `sonner`

### Backend (`.agents/rules/backend-architecture.md`)

- [ ] Database queries ONLY in repositories
- [ ] Service methods are `static`
- [ ] Validators import from `"zod"` and use `.safeParse()`
- [ ] Routes use `apiResponse`/`paginatedResponse`/`errorResponse`
- [ ] Soft-delete filter `{ deletedAt: null }` in every query
- [ ] Error detail only in `console.error`, never in the response body
- [ ] Auth middleware on every route that needs protection

### Security (`.agents/rules/security.md`)

- [ ] No `console.log` — `console.error` only in catch blocks
- [ ] No hardcoded secrets
- [ ] Input validated server-side
- [ ] Sensitive fields excluded from API responses

---

## Push

- Push to the branch that is **currently active**.
- Use `git push origin HEAD` so it targets the current branch.
- Don't switch or create branches unless asked.
- Never force push unless explicitly asked.

---

## Full flow

```bash
npm run build                              # 1. Build must pass
npm test                                   # 2. Tests must pass
git add .                                  # 3. Stage changes
git commit -m "type(scope): message"       # 4. Commit
git push origin HEAD                       # 5. Push current branch
```

---

## Examples

```bash
npm run build && npm test
git add .
git commit -m "feat(article): add repository and service layer"
git push origin HEAD
```

```bash
npm run build && npm test
git add src/app/api/users/
git commit -m "fix(user): handle soft delete filter in getAll"
git push origin HEAD
```
