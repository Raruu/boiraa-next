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
| `MEMORY.md` (index) | Writeable — append & prune lines freely |
| `.agents/memory/*.md` (full entries) | Writeable — append & prune freely |
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
7. **`MEMORY.md` and `.agents/memory/*.md` are the only freely-writeable
   instruction files.** Append and update without asking. Keep the index within
   the cap in "Pruning" below: prune lines that are stale, superseded, or no
   longer true — git history is the archive. A wrong entry is worse than no
   entry.
8. **Never use memory to bypass approval.** A new convention is a rule, and
   rules go in `.agents/rules/` with approval. Recording a rule in memory to
   avoid asking is a violation of this section. (Constraints *derived from* a
   recorded decision are fine — see "Memory" below.)

## Load the right rule file, don't read everything

Read on demand, based on the task at hand:

| When you are about to... | Read |
| --- | --- |
| Write or change a model, repository, service, validator, or API route | `.agents/rules/backend-architecture.md` |
| Write or change a hook, client service, page, or component | `.agents/rules/frontend-architecture.md` |
| Build UI, pick colors, or add a component | `.agents/rules/design-system.md` |
| Touch auth, uploads, validation, secrets, or user input | `.agents/rules/security.md` |
| Commit, push, or run the pre-push checks | `.agents/rules/git-commit.md` |
| Start non-trivial work, or wonder why something is the way it is | `MEMORY.md` (index) |
| An index line looks relevant to your task | the linked `.agents/memory/<slug>.md` |

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

Memory is a **working set, not an archive** — git history is the archive. It
has two parts:

| Part | What it holds | When it is read |
| --- | --- | --- |
| `MEMORY.md` | One index line per entry, tagged | Always, before non-trivial work |
| `.agents/memory/<slug>.md` | The full entry | Only when the index line is relevant |

This split exists so cost scales with *relevance*, not with how much memory
accumulated. The index stays small enough to read in full every time.

### Index line format

```
[tag] YYYY-MM-DD — one-line summary → memory/<slug>.md
```

### Tags

`[env]` machine/environment gotchas · `[db]` database & schema · `[auth]`
authentication & authorization · `[storage]` file storage · `[build]` tooling,
dependencies, version pins · `[api]` API contract decisions · `[ui]` design
system & components · `[deploy]` deployment, infra, CI

Use an existing tag. Add a new one only if it will clearly recur.

### Entry format (`.agents/memory/<slug>.md`)

```markdown
# Short title

- **Decision:** what was decided.
- **Why:** the reasoning, including alternatives rejected and why. This is the
  part that cannot be re-derived by reading the code — spend your words here.
- **Impact:** what follows from it, including constraints, open questions, and
  anything you could not verify. "Verified by X, not by Y" is worth writing down.
```

### Record an entry only if ALL three hold

1. **Not derivable** — reading the code or docs would not reveal it.
2. **Will recur** — not a one-off event.
3. **Costly to forget** — wastes real time or breaks something.

### Never record

Anything already in `.agents/rules/`, task progress or TODOs, behaviour that
is readable from the source, one-off trivia.

### Constraints inside entries are allowed

An entry may carry guidance derived from its decision (e.g. *"do not un-scope
`.display` — it is prefixed on purpose"*). Splitting a constraint from the
reasoning that produced it destroys its value. Only rules that must be
**enforced across the project** get promoted to `.agents/rules/` — and that
promotion needs approval.

### Pruning

Keep `MEMORY.md` at or under **7168 bytes** — the single source of truth for
the cap. Check it with `wc -c MEMORY.md`. Every other mention of the cap points
here; never restate the number elsewhere.

When it grows past that: merge duplicates, drop the least-recurring entries,
delete anything that is no longer true. Prune the entry file too when its index
line goes.

### Reading mid-task

The index is small enough to read in full at the start. Mid-task, grep it
rather than re-reading: `grep '^\[env\]' MEMORY.md`. Open the linked entry file
only when that line bears on what you are doing.

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
