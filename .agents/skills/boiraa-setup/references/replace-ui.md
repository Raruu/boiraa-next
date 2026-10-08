# Replacing the UI components

Read this before swapping `src/components/ui/*` for another library. The audit
below is the point: **most components are only referenced by the showcase
page**, so replacing them all blindly is wasted work.

## Audit — who actually uses what

Run these again if the codebase has moved on since this was written:

```bash
# What the app's own pages import
for f in src/app/page.tsx src/app/login/page.tsx src/app/dashboard/page.tsx \
         src/app/dashboard/layout.tsx src/app/not-found.tsx \
         src/components/dashboard/*.tsx; do
  grep -oE 'from "@/components/ui/[a-z-]+"' "$f" 2>/dev/null
done | sort -u

# What the showcase imports
grep -oE 'from "@/components/ui/[a-z-]+"' src/app/internal/components/page.tsx | sort -u
```

At the time of writing:

| Group | Components | Count |
| --- | --- | --- |
| Used by app pages | `badge`, `button`, `input`, `skeleton` | **4** |
| Only the showcase uses them | `accordion`, `card`, `checkbox`, `date-picker`, `file-upload`, `loading-indicator`, `radio`, `rich-editor`, `stepper`, `switch`, `table` | 11 |
| Internal helper | `rich-editor-inner` (loaded by `rich-editor`, not a public component) | 1 |

**The consequence:** if the showcase page is deleted, the 11 showcase-only
components can be deleted with it. You then only need replacements for 4.

## Ask first — the showcase decision drives everything

| Option | Result |
| --- | --- |
| **Delete the showcase** | 11 components go with it. Replace 4. Fastest path. |
| **Keep the showcase** | Either replace all 15, or rewrite the showcase to demonstrate the new library's own components. |

Rewriting the showcase against the new library is usually better than
translating the old one component-by-component — the point of the page is to
show what *this* project has, not to preserve the old inventory.

## Replacing the 4 that the app actually uses

| Component | Imported by | Notes |
| --- | --- | --- |
| `button` | `login`, `not-found`, `sidebar`, `topbar` | Six call sites. If the new library has a Button, map the variants 1:1. |
| `input` | `login` (with `label` and `error` props) | The new one needs those two props, or the call site changes. |
| `badge` | `page.tsx` (home) | Variants: brand, warning, info, default, error. |
| `skeleton` | `dashboard/page.tsx`, and `rich-editor`'s loading state | Plain placeholder; any library has an equivalent. |

## Dependency cleanup

Deleting components usually makes a dependency unused. Check each one:

| Dependency | Used by | Safe to remove when |
| --- | --- | --- |
| `react-quill-new` | `rich-editor-inner` only | `rich-editor` is replaced or deleted |
| `src/styles/rich-editor.css` | `rich-editor-inner` only | same |
| `lucide-react` | many components **and** app pages (`sidebar`, `topbar`, `not-found`) | only if the new library replaces the icon set everywhere |
| `clsx`, `tailwind-merge` | `cn()` in `src/lib/utils.ts` | only if the new library ships its own class merger |

Verify before uninstalling:

```bash
grep -rn "react-quill-new" --include="*.ts" --include="*.tsx" src/
```

## Keep the design tokens

The new components should consume the existing semantic tokens from
`src/app/globals.css` (`bg-primary`, `text-muted-foreground`, `border-border`,
…) rather than hardcoding their own palette. That is what keeps a future rebrand
a one-section edit, and it is a non-negotiable in `AGENTS.md`.

If the chosen library ships its own theme system (shadcn/ui does), map its
variables onto the existing tokens instead of adopting its palette wholesale.

## Update the rules when done

`AGENTS.md` and `.agents/rules/design-system.md` both describe the built-in
component library — the component catalog, the import paths, the "check
`src/components/ui/` before building anything" rule. After a swap they are
wrong.

Offer to update them (see the skill's guardrail on protected files) and report
the doc diff separately from the code changes.
