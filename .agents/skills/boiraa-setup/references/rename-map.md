# Rename map

Every place the boilerplate's name appears. `Boiraa` is the display name,
`boiraa-next` is the package/repo name.

## Files to edit

| File | What to change |
| --- | --- |
| `package.json` | `"name"` → kebab-case project name |
| `ecosystem.config.cjs` | `apps[0].name` (the pm2 process name) |
| `AGENTS.md` | The `# Boiraa Next — Agent Instructions` heading |
| `README.md` | The `# Boiraa Next` heading |
| `.env.example` | `NEXT_PUBLIC_APP_NAME=Boiraa` |
| `src/app/layout.tsx` | The `process.env.NEXT_PUBLIC_APP_NAME \|\| "Boiraa"` fallback |
| `src/app/page.tsx` | Same fallback |
| `src/app/login/page.tsx` | Same fallback |
| `src/app/dashboard/layout.tsx` | Same fallback in the metadata template |
| `src/components/dashboard/sidebar.tsx` | Same fallback |
| `src/lib/auth-config.ts` | `JWT_ISSUER = "boiraa-next"` → the new name |
| `src/app/internal/components/page.tsx` | The accordion copy ("Apa itu Boiraa?") — or drop it if the page is being deleted |

A quick way to find them all again:

```bash
grep -rn "boiraa\|Boiraa" --include="*.ts" --include="*.tsx" --include="*.json" \
  --include="*.md" --include="*.mjs" --include="*.cjs" . \
  | grep -v node_modules | grep -v package-lock
```

## Do NOT rename in these places

| Path | Why |
| --- | --- |
| `.agents/memory/*.md` | Entries are written to stay project-neutral — they describe roles ("this project", "an unrelated app"), not names. Renaming here would leak the new name into memory that may be shared. |
| `MEMORY.md` | Same reason. |
| `src/generated/prisma/**` | Generated code. Regenerate instead of editing. |
| `prisma/migrations/**` | Historical migrations. |

## Order

Rename the metadata first (`package.json`, `ecosystem.config.cjs`), then the
display strings, then run `npm run build` — a missed import or a stale
identifier shows up immediately.
