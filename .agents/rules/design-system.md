# Design System

> **PROTECTED — see `AGENTS.md` → "Instruction File Protection".**
> Edit only when the user explicitly asks. Don't rewrite on your own initiative.

All base UI components live in `src/components/ui/`. **ALWAYS** use them before
creating anything new. If a component is missing, add it there as a reusable
component.

Live preview: [http://localhost:3000/internal/components](http://localhost:3000/internal/components) (development only).

---

## Core principles

1. **Reuse first** — check `src/components/ui/` before building anything.
2. **Compose** — combine base components into bigger UI.
3. **Extend** — add props/variants to the base component, don't fork it.
4. **Stay consistent** — follow existing prop naming, variant systems, and
   `className` pass-through.

---

## Component catalog

### Button

**Import:** `import { Button } from "@/components/ui/button"`

| Prop      | Type                                                            | Default     |
| --------- | --------------------------------------------------------------- | ----------- |
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"primary"` |
| `size`    | `"sm" \| "md" \| "lg" \| "icon"`                                | `"md"`      |

```tsx
<Button>Simpan</Button>
<Button variant="outline" size="sm">Batal</Button>
<Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
```

### Input & Textarea

**Import:** `import { Input, Textarea } from "@/components/ui/input"`

| Prop       | Type      | Default | Notes                          |
| ---------- | --------- | ------- | ------------------------------ |
| `label`    | `string`  | —       | Label above the input          |
| `error`    | `string`  | —       | Error message (turns red)      |
| `hint`     | `string`  | —       | Helper text (hidden on error)  |
| `disabled` | `boolean` | `false` | Disabled state                 |

Textarea adds `maxLength` and `showCount`.

```tsx
<Input label="Email" error={errors.email?.message} id="email" {...register("email")} />
<Textarea label="Deskripsi" maxLength={500} showCount hint="Maks 500 karakter" />
```

### Badge

**Import:** `import { Badge } from "@/components/ui/badge"`

| Prop      | Type                                                            | Default     |
| --------- | --------------------------------------------------------------- | ----------- |
| `variant` | `"brand" \| "warning" \| "info" \| "default" \| "error"`        | `"default"` |

```tsx
<Badge variant="brand">Aktif</Badge>
<Badge variant="error">Ditolak</Badge>
<Badge variant="warning">Pending</Badge>
```

### Card

**Import:** `import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Judul</CardTitle>
    <CardDescription>Deskripsi singkat</CardDescription>
  </CardHeader>
</Card>
```

### Table

**Import:**
```tsx
import {
  Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, Pagination,
} from "@/components/ui/table";
```

`Pagination` props: `page`, `perPage`, `total`, `onPageChange`, `onPerPageChange`.

### Checkbox / Radio / Switch

**Import:** `@/components/ui/checkbox`, `@/components/ui/radio`, `@/components/ui/switch`

- `Checkbox` — fill & outline variants, `indeterminate` support.
- `Radio` + `RadioGroup` — single selection groups.
- `Switch` — fill & outline variants.

### DatePicker

**Import:** `import { DatePicker } from "@/components/ui/date-picker"`

`mode="single" | "range"`, `size="sm" | "md"`, controlled via
`value`/`onChange` or `startDate`/`endDate`/`onRangeChange`.

### FileUpload

**Import:**
```tsx
import { FileUpload, FilePreviewModal } from "@/components/ui/file-upload";
import type { FileUploadFile } from "@/components/ui/file-upload";
```

Drag-drop, multi/single, preview modal. Thumbnails come from
`public/icon/*.svg` by extension.

### RichEditor

**Import:** `import { RichEditor } from "@/components/ui/rich-editor"`

Quill-based WYSIWYG. Pass `onImageUpload(file) => Promise<string>` to wire
image uploads (return the stored URL).

### Feedback: Skeleton & LoadingIndicator

**Import:** `@/components/ui/skeleton`, `@/components/ui/loading-indicator`

- `Skeleton` — placeholder for loading **content**.
- `LoadingIndicator` — spinner for buttons and inline actions.

### Accordion & Stepper

**Import:** `@/components/ui/accordion`, `@/components/ui/stepper`

- `Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionContent`
- `Stepper` takes a `steps` array and a `current` index.

---

## Color system

Colors are defined in `src/app/globals.css`, split into four layers:

| Layer         | Prefix                                              | Purpose                              | Example class       |
| ------------- | --------------------------------------------------- | ------------------------------------ | ------------------- |
| **Brand**     | `brand-*`                                           | Brand identity. Rebrand = edit this. | `bg-brand-500`      |
| **Neutral**   | `neutral-*`                                         | Text, borders, neutral backgrounds   | `text-neutral-700`  |
| **Functional**| `success-*`, `warning-*`, `error-*`, `info-*`       | Status & feedback                    | `text-error-600`    |
| **Extended**  | `orange-*`, `purple-*`, `pink-*`, `teal-*`          | Badges, categories, decoration       | `bg-purple-500`     |

### Semantic tokens (most used)

Semantic tokens reference the brand palette, so a brand change propagates.

| Token                 | Purpose                       | Example class              |
| --------------------- | ----------------------------- | -------------------------- |
| `primary` / `primary-*` | CTA, links, main elements   | `bg-primary`, `text-primary-700` |
| `secondary`           | Light background              | `bg-secondary`             |
| `muted`               | Subtle background, muted text | `bg-muted`, `text-muted-foreground` |
| `accent`              | Hover / active                | `bg-accent`                |
| `destructive`         | Delete, error actions         | `bg-destructive`           |
| `success`             | Success, active               | `text-success`             |
| `warning`             | Warnings                      | `text-warning`             |
| `info`                | Informational                 | `text-info`                |
| `border`              | Default border                | `border-border`            |
| `card`                | Card background               | `bg-card`                  |
| `sidebar`             | Sidebar background            | `bg-sidebar`               |

### Rules

- **ALWAYS** use semantic tokens for functional UI.
- **MAY** use brand directly (`bg-brand-50`, `text-brand-900`) for specific
  customization.
- **NEVER** hardcode a hex value in a className.
- To rebrand, edit **only** the `BRAND COLOR PALETTE` section in
  `src/app/globals.css`. `primary-*` follows `brand-*` automatically.

### Current brand palette (Blue Ocean)

```
brand-50:  #EAF4F9   (lightest — background)
brand-100: #D6E8F3   (hover light)
brand-200: #ACD1E8   (border, divider)
brand-300: #83BADC   (light accent)
brand-400: #59A3D1   (active)
brand-500: #308CC5   (★ main brand color)
brand-600: #26709E   (hover on brand)
brand-700: #1D5476   (dark accent)
brand-800: #13384F   (dark background)
brand-900: #0A1C27   (foreground/text)
brand-950: #050E14   (darkest)
```

---

## Typography

- Font: **Onest** (Google Fonts, loaded via `next/font` in `src/app/layout.tsx`).
- Tailwind class: `font-sans` (mapped to `--font-onest`).
- Don't add another font without being asked.

---

## Icons

- Use `lucide-react` exclusively.
- Default size in controls: `h-4 w-4`; standalone: `h-5 w-5`.
