---
name: memory-purge
description: Audit project memory for conflicts, stale entries, and structural problems, then resolve them with the user. Run ONLY when the user explicitly asks to purge, audit, or check memory. Accepts an optional `deep` argument to verify every entry against the codebase before reporting.
license: MIT
metadata:
  audience: maintainers
  workflow: memory-maintenance
---

# Memory Purge

Audits `MEMORY.md` (the index) and `.agents/memory/*.md` (the entries) for
conflicts and structural problems, reports what it finds, and resolves the
issues the user chooses.

Memory is written freely and pruned by hand as it grows — this skill is the
periodic check that keeps that from drifting. It reads first and always, and
deletes only on an explicit instruction.

## When to use me

- "Purge memory" / "audit memory" / "check memory" / "clean up memory"
- After a large refactor, to find entries that no longer match the code
- When `MEMORY.md` is approaching its ~3 KB cap

## When NOT to use me

- Any other task. Run this only on an explicit request.
- A single known-stale entry — just fix it; the audit machinery is overkill.

## Modes

Read the user's message for an argument:

| Argument | Mode |
| --- | --- |
| *(none)* | **Audit** — load, analyze, report, then offer next steps |
| `deep` | **Deep audit** — same, but verify every entry against the codebase *before* reporting |

On a harness that exposes skills as slash commands this reads as
`/memory-purge` and `/memory-purge deep`. On a harness that uses the `skill`
tool, take the argument from the user's message.

In deep mode, do **not** offer a deep search as a follow-up — you already ran
it. Report results directly.

## 1. Load

```bash
cat MEMORY.md
ls .agents/memory/
```

Read every entry file in full. You need the complete text to judge conflicts —
an index line is a summary and hides the details that contradict.

## 2. Structural check

| Problem | How to spot it | Resolution |
| --- | --- | --- |
| **Dangling** | An index line points at `memory/<slug>.md` that does not exist | Delete the line, or write the missing entry |
| **Orphan** | An entry file exists with no index line pointing at it | Add the line, or delete the file |
| **Cap breach** | `MEMORY.md` is over ~3 KB (`wc -c MEMORY.md`) | Merge duplicates, prune the least-recurring lines |
| **Inclusion violation** | Entry fails one of the three conditions in `AGENTS.md` → "Memory" | Delete it |
| **Format drift** | Index line missing its `[tag]`, date, or arrow link | Rewrite the line in the documented format |
| **Unknown tag** | Tag is outside the eight in `AGENTS.md` | Retag, unless it clearly recurs and deserves promotion |

The three inclusion conditions, for reference: **not derivable** from reading
the code or docs, **will recur**, and **costly to forget**. An entry that fails
any one of them does not belong.

## 3. Conflict check

| Conflict | What it looks like |
| --- | --- |
| **Contradiction** | Two entries assert facts that cannot both be true |
| **Supersession** | A newer entry has replaced an older one, but the older line and file are still there |
| **Staleness** | An entry names a file, command, dependency, or process that no longer exists |
| **Duplication** | Two entries cover the same ground |
| **Scope violation** | An entry carries a *rule* (its home is `.agents/rules/`) or one-off trivia |

### Scope violations are a judgment call

`AGENTS.md` explicitly allows an entry to carry **constraints derived from its
decision** — for example "do not un-scope `.display`, it is prefixed on
purpose". Splitting a constraint from the reasoning that produced it destroys
its value, so that is not a violation.

What *is* a violation: a rule that must be **enforced across the project** and
has nothing to do with a recorded decision. Those belong in `.agents/rules/`.

Report it as a finding and **offer** promotion. Do not perform the promotion —
that touches a protected file and needs its own approval.

## 4. Deep verification (deep mode)

For each entry, extract its checkable claims and test them:

| Claim type | How to verify |
| --- | --- |
| File path | `test -f <path>` |
| npm script | `grep '"<script>"' package.json` |
| Dependency | `grep '"<pkg>"' package.json` |
| A decision still reflected in code | grep for the pattern the entry describes |
| A running process or port | check the process table, or the file the entry names |

Classify each: **Confirmed**, **Contradicted**, or **Unverifiable**.

**Unverifiable is not a reason to delete.** Not being able to confirm a claim
in this environment says nothing about whether it is true. Report it and move
on.

## 5. Report

One table, findings numbered. If the audit is clean, say so plainly and stop —
do not manufacture findings to look useful.

```
## Memory audit — <N> entries, <X> B index (cap ~3 KB)

### Structural
| # | Type | Item | Finding | Options |
|---|------|------|---------|---------|
| 1 | Orphan | memory/foo.md | no index line | add line · delete file |

### Conflicts
| # | Type | Entries | Finding | Options |
|---|------|---------|---------|---------|
| 2 | Contradiction | a.md, b.md | both claim port 3000 is free | deep · delete a · delete b |

### Deep results
| Entry | Claim | Status | Evidence |
|-------|-------|--------|----------|
| a.md | `.next/dev/lock` holds the pid | Confirmed | file present, keys match |
```

In **audit** mode, add a closing offer:

> Want me to deep-search any of these against the code before deciding?

## 6. Apply

Ask for a batch selection rather than one prompt per finding:

> Which should I act on? For example `1, 3, 5`, `all except 2`, or `none`.

Then apply exactly what was selected. Anything not selected stays untouched.

## 7. Verify

```bash
wc -c MEMORY.md          # under ~3 KB
ls .agents/memory/       # index and files agree
```

Every remaining index line must resolve to a file, and every file must have a
line. Report the memory changes as a single diff.

## Guardrails

- **Never delete without an explicit instruction.** Report first; act on the
  selection the user gives.
- **Never touch `.agents/rules/`.** Offer promotions; the user approves them.
- **Never rename the project inside an entry.** Entries stay project-neutral
  (see `AGENTS.md` → "Memory").
- **Never delete an `Unverifiable` entry.** Inability to verify is not evidence
  of being wrong.
- **Never invent findings.** A clean audit is a valid result.
- **Report memory changes as one diff** — index and entry files together, since
  they must stay in sync.
- **Run only when asked.** The description gates this; honor it.
