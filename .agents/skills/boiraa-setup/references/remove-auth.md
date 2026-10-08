# Removing auth

Follows from "no database" — auth verifies credentials against the `users`
table, so it has nothing left to stand on. **Confirm before executing.**

## Files to delete

```
src/lib/jwt.ts                  (jose sign/verify)
src/lib/auth-cookies.ts         (at/rt cookie helpers)
src/lib/auth-config.ts          (TTLs, JWT_ISSUER, demo credential)
src/server/services/auth/       (AuthService)
src/app/api/auth/               (login, logout, me, refresh)
src/app/login/                  (the login page)
src/hooks/use-auth.ts           (useMe, useLogin, useLogout)
src/services/auth-service.ts
src/types/auth.ts
src/proxy.ts                    (route protection)
```

## Files to edit — this is the part that is easy to get wrong

**`src/lib/api-middleware.ts` is not auth-only.** It also guards `/api/upload`
and `/api/users`. Deleting it breaks those routes' imports.

| File | Change |
| --- | --- |
| `src/lib/api-middleware.ts` | Either delete it and remove the guard wrapper from every route, or keep it as a pass-through that always calls the handler. Pick one and be consistent. |
| `src/app/api/upload/route.ts` | Currently wrapped in `auth(...)`. Becomes public — see "Endpoints left open" below. |
| `src/app/api/users/route.ts`, `[id]/route.ts` | Deleted with the database. |
| `src/lib/api-client.ts` | Remove the 401 interceptor: the `tryRefresh` helper, the retry branch, and the redirect to `/login`. |
| `src/app/dashboard/page.tsx` | Remove `useMe`; render a static dashboard instead of role/email cards. |
| `src/components/dashboard/topbar.tsx` | Remove `useMe`; the avatar falls back to a static initial or a generic icon. |
| `src/components/dashboard/sidebar.tsx` | Remove `useLogout` and the logout button. |
| `src/server/services/index.ts` | Drop the `AuthService` export. |
| `.env.example` | Remove `AUTH_JWT_SECRET`, `AUTH_DEMO_EMAIL`, `AUTH_DEMO_PASSWORD`. |

## Dependencies to uninstall

```bash
npm uninstall jose bcryptjs
```

`bcryptjs` is also used by `prisma/seed.ts` — but that file is deleted along
with the database, so there is no remaining consumer.

## Endpoints left open

After this, `/api/upload` (and anything else that used a guard) is public. That
is a legitimate outcome for a project with no auth — but it must be **recorded
as a decision**, not left as a surprise. Add a line to `AGENTS.md`, near the
API section:

> This project has no authentication. `/api/upload` and the other API routes
> are intentionally public. If you add auth later, restore a guard on them.

Offer the user a middle ground too: a static API key checked against an
environment variable. It is a few lines and covers the "someone finds my upload
endpoint" case without reintroducing sessions.

## Verify

```bash
grep -rn "useMe\|useLogin\|useLogout\|api-middleware\|jose\|bcrypt" \
  --include="*.ts" --include="*.tsx" src/
```

Should return nothing. Then `npm run build`, `npm test`, `npm run lint`, and
check that `/dashboard` loads without redirecting to a login page that no
longer exists.
