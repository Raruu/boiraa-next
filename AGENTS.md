<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Boiraa Next — Agent Instructions

Boilerplate instructions for AI agents. Read this file first, then load only
the rule files relevant to your task.

## Instruction File Protection

These rules govern every instruction file in this repo. They exist so that
documented decisions stay stable and auditable.

**Protected files:**

| File | Protection level |
| --- | --- |
| `AGENTS.md` (this file, outside the managed block) | User-approval required |
| `.agents/rules/*.md` | User-approval required |
| `.agents/skills/*/SKILL.md` + references | User-approval required |
| `MEMORY.md` | Writeable — append/update freely; don't delete history |
| `README.md`, `.env.example` | Update freely when the change is factual |

**Rules:**

1. **Never rewrite a protected file on your own initiative.** Not as cleanup,
   not as a "while I was there" edit, not because you think the wording is
   better.
2. **Edit only when the user explicitly asks.** "Switch from S3 to local
   storage" is an explicit instruction that justifies updating the storage
   docs. "I refactored the upload module" is not.
3. **If a change implies a doc update, ask first.** Offer it as a separate,
   clearly-labeled step — for example: *"This changes how uploads work. Want me
   to update `.agents/rules/backend-architecture.md` to match?"* Then wait.
4. **When adding a dependency or a new pattern, offer a NEW rule file** rather
   than editing an existing one. Example: adding a payments integration →
   offer `.agents/rules/payments.md`. Don't fold it into
   `backend-architecture.md` unless the user says so.
5. **Report every instruction-file change as its own diff.** Never bundle a
   doc rewrite into a feature commit without calling it out explicitly.
6. **The `nextjs-agent-rules` block above is managed by Next.js.** Don't fight
   it; leave it in place. Edit content outside the markers only.
7. **`MEMORY.md` is the only freely-writeable instruction file.** Append
   decisions and update existing entries without asking. Never delete entries
   or rewrite the file wholesale — memory is append-mostly.
8. **Never use `MEMORY.md` to bypass approval.** A new convention is a rule,
   and rules go in `.agents/rules/` with approval. Recording a rule in
   `MEMORY.md` to avoid asking is a violation of this section.

## Load the right rule file, don't read everything

Read on demand, based on the task at hand:

| When you are about to... | Read |
| --- | --- |
| Write or change a model, repository, service, validator, or API route | `.agents/rules/backend-architecture.md` |
| Write or change a hook, client service, page, or component | `.agents/rules/frontend-architecture.md` |
| Build UI, pick colors, or add a component | `.agents/rules/design-system.md` |
| Touch auth, uploads, validation, secrets, or user input | `.agents/rules/security.md` |
| Commit, push, or run the pre-push checks | `.agents/rules/git-commit.md` |
| Switch the storage backend | `.agents/skills/s3-to-local-storage/SKILL.md` |
| Start non-trivial work, or wonder why something is the way it is | `MEMORY.md` |

## Stack (locked versions — see package.json)

- **Next.js 16** — App Router. `middleware.ts` is now **`proxy.ts`**.
- **Prisma 7** — `prisma.config.ts` holds the DB URL; client is generated to
  `src/generated/prisma` and imported from `@/generated/prisma/client`; a
  driver adapter (`@prisma/adapter-pg`) is required.
- **Zod 4** — `import { z } from "zod"` (v4 is the installed major).
- **React Query 5** — all client data fetching.
- **Tailwind CSS 4** — tokens in `src/app/globals.css`.
- **Vitest 5** — `npm test`, config in `vitest.config.ts`.
- **sonner** — all toasts. **lucide-react** — all icons.

Don't upgrade a major version without asking. Some majors are deliberately
pinned (for example, `typescript` is on 6.x because `typescript-eslint` does
not yet support 7.x, and `eslint` is on 9.x because `eslint-config-next`
breaks on 10.x).

## Commands

```bash
npm run dev        # dev server
npm run build      # prisma generate && next build
npm test           # vitest run
npm run lint       # eslint
npm run db:migrate # prisma migrate dev
npm run db:seed    # prisma db seed
```

## Working style

- Be direct. Match reply length to the weight of the question: a one-line
  question gets a one-line answer; finished work gets a short report of what
  changed, what's verified, and what's left — never a replay of the process.
- No filler ("Great question", "I'd be happy to"), no restating the request
  back, no re-summarizing what you already said, no narrating tool calls the
  user can see.
- Plain claims over adjectives. When unsure, say so plainly.
- Depth is earned — give it when the user asks for detail, teaches, or the
  stakes demand it. Not by default.
- Agree because it's right, not because the user said it. Push back clearly
  when an idea is weak, with the reason.
- Report what you verified (build, tests, lint, runtime) and how. If you
  didn't verify something, say so instead of implying it works.
- If a task is blocked, say what's blocking it and what you need.
- Never claim a test passed without running it.

## Memory

Read `MEMORY.md` for past decisions and context before starting non-trivial
work — it records why things are the way they are. Append to it when you make
a decision worth remembering, discover a gotcha, or find that an earlier
assumption no longer holds. It needs no approval; see the write policy at the
top of that file.

## Non-negotiables

1. Prisma queries live **only** in repositories.
2. Service methods are `static`.
3. Every API route uses `auth` / `role` / `silentAuth` and the response
   helpers from `@/lib/api-utils`.
4. Soft delete: filter `{ deletedAt: null }` everywhere.
5. Never hardcode a color — use semantic tokens.
6. Check `src/components/ui/` before building any component.
7. No `console.log` in production code — `console.error` only in catch blocks.
8. `npm run build` and `npm test` must pass before you push.
9. Ask before touching a protected instruction file — `MEMORY.md` is the only
   exception, and only for appending or updating entries.

## When something isn't covered here

Prefer the existing pattern over inventing a new one. If no pattern exists,
pick the smallest reasonable approach, do the work, and then **offer** to
document it as a new rule file — don't document it unilaterally.
