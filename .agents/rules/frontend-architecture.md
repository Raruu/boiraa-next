# Frontend Architecture

> **PROTECTED — see `AGENTS.md` → "Instruction File Protection".**
> Edit only when the user explicitly asks. Don't rewrite on your own initiative.

Client-side code follows the same layered discipline as the backend.

```
types/[domain].ts             (1) TypeScript types
    ↓
services/[domain]-service.ts  (2) API caller (wraps @/lib/api-client)
    ↓
hooks/use-[domain].ts         (3) React Query hooks ("use client")
    ↓
components / pages            (4) UI
```

---

## 1. TypeScript Types

- Location: `src/types/[domain].ts`
- Define interfaces that match the API response.
- Import `PaginatedResponse` and `ApiSingleResponse` from `@/types/api`.

```typescript
// src/types/article.ts
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
```

Shared response envelopes already exist in `src/types/api.ts`:
`PaginatedResponse<T>`, `ApiSingleResponse<T>`, `ApiValidationError`,
`QueryParams`.

---

## 2. Client Service

- Location: `src/services/[domain]-service.ts`
- Use `api` from `@/lib/api-client` — **never** raw `fetch`.
- Return types are explicit via generics.
- File name kebab-case, exported object camelCase.

```typescript
// src/services/article-service.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse, ApiSingleResponse } from "@/types/api";
import type { Article } from "@/types/article";

export const articleService = {
  getArticles: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Article>>("/api/articles", params),

  getArticleById: (id: string) =>
    api.get<ApiSingleResponse<Article>>(`/api/articles/${id}`),

  createArticle: (data: Record<string, unknown>) =>
    api.post<ApiSingleResponse<Article>>("/api/articles", data),

  updateArticle: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.put<ApiSingleResponse<Article>>(`/api/articles/${id}`, data),

  deleteArticle: (id: string) => api.delete(`/api/articles/${id}`),
};
```

### api-client methods

| Method       | Signature                              |
| ------------ | -------------------------------------- |
| `api.get`    | `<T>(url, params?) → Promise<T>`       |
| `api.post`   | `<T>(url, body?) → Promise<T>`         |
| `api.put`    | `<T>(url, body?) → Promise<T>`         |
| `api.patch`  | `<T>(url, body?) → Promise<T>`         |
| `api.delete` | `<T>(url) → Promise<T>`                |
| `api.upload` | `<T>(url, formData, method?) → Promise<T>` |

Supported query params: `page`, `limit`, `sort`, `search`, `filter`.

```typescript
articleService.getArticles({
  page: 1,
  limit: 10,
  sort: "-createdAt",
  search: "keyword",
  filter: { isPublished: { eq: "true" } },
});
```

The client refreshes the token pair once on a 401 and retries; if the refresh
fails it redirects to `/login`. Don't reimplement that in components.

---

## 3. React Query Hooks

- Location: `src/hooks/use-[domain].ts`
- **MUST** start with `"use client"`.
- `useQuery` for reads, `useMutation` for writes.
- `queryKey` must be descriptive and include the params used.
- `onSuccess`: toast + invalidate related queries.
- `onError`: surface `error.data?.message` via toast.
- Toast uses `sonner` — `toast.success()`, `toast.error()`.

```typescript
// src/hooks/use-articles.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articleService } from "@/services/article-service";
import { toast } from "sonner";

/* Fetch list */
export function useArticles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: () => articleService.getArticles(params),
  });
}

/* Fetch single */
export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => articleService.getArticleById(id!),
    enabled: !!id,
  });
}

/* Create */
export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      articleService.createArticle(data),
    onSuccess: () => {
      toast.success("Berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: Error & { data?: Record<string, unknown> }) => {
      toast.error((error.data?.message as string) || "Gagal membuat data");
    },
  });
}

/* Update */
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      articleService.updateArticle({ id, data }),
    onSuccess: () => {
      toast.success("Berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: Error & { data?: Record<string, unknown> }) => {
      toast.error((error.data?.message as string) || "Gagal update data");
    },
  });
}

/* Delete */
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articleService.deleteArticle(id),
    onSuccess: () => {
      toast.success("Berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: Error & { data?: Record<string, unknown> }) => {
      toast.error((error.data?.message as string) || "Gagal menghapus data");
    },
  });
}
```

---

## 4. UI Components

> **IMPORTANT:** Base components, the color palette, and typography are already
> set up. Preview them at [http://localhost:3000/internal/components](http://localhost:3000/internal/components)
> (development only).
>
> **ALWAYS** check `src/components/ui/` before creating a component. If the one
> you need is missing, add it there as a reusable component — never inline or
> one-off.

Available in `src/components/ui/`:

| Component           | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `accordion.tsx`     | Expandable content (single/multiple)         |
| `badge.tsx`         | Label/tag (brand, warning, info, error)      |
| `button.tsx`        | The only button primitive, with variants     |
| `card.tsx`          | Card container                               |
| `checkbox.tsx`      | Checkbox (fill/outline, indeterminate)       |
| `date-picker.tsx`   | Date picker (single/range, sm/md)            |
| `file-upload.tsx`   | Drag-drop upload + preview modal             |
| `input.tsx`         | Input & Textarea (label, error, char counter)|
| `loading-indicator.tsx` | Spinner (sm/md/lg)                       |
| `radio.tsx`         | Radio & RadioGroup                           |
| `rich-editor.tsx`   | WYSIWYG Quill editor + image upload          |
| `skeleton.tsx`      | Loading placeholder                          |
| `stepper.tsx`       | Multi-step progress                          |
| `switch.tsx`        | Toggle switch (fill/outline)                 |
| `table.tsx`         | Table + Pagination                           |

### Design tokens

- **Focus ring** → always `ring` (= brand color)
- **Error state** → border `error-500`, message `text-error-600`
- **Colors** → semantic tokens only (`bg-primary`, `text-muted-foreground`,
  `border-border`). **Never** hardcode hex, never `bg-[#xxx]`.
- See `.agents/rules/design-system.md` for the full component API.

### Page title (metadata)

- Every page needs a browser tab title.
- The root layout uses the template `%s | APP_NAME` (from
  `NEXT_PUBLIC_APP_NAME`) — set only the page-specific part.

**Rule:**
- Server component → export `metadata` in `page.tsx`.
- Client component (`"use client"`) → put `metadata` in a `layout.tsx` in the
  same folder.

```typescript
// Server component — directly in page.tsx
// src/app/articles/page.tsx
export const metadata = { title: "Artikel" };
export default function ArticlesPage() { ... }
```

```typescript
// Client component — metadata goes in layout.tsx
// src/app/dashboard/layout.tsx
export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// src/app/dashboard/page.tsx
"use client";
export default function DashboardPage() { ... }
```

### Loading states

- Use `<Skeleton />` from `@/components/ui/skeleton` for **content** loading
  (cards, table rows, lists) — not for whole pages.
- Headers, sidebar, and static chrome stay visible while data loads.
- Use `<LoadingIndicator />` from `@/components/ui/loading-indicator` for
  submit buttons (`isPending`) and inline actions.

```tsx
// Skeleton — only the data area
if (isLoading) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Artikel</h1> {/* stays visible */}
      <div className="space-y-3 mt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// LoadingIndicator — submit button
<Button disabled={isPending}>
  {isPending ? <LoadingIndicator size="sm" /> : "Simpan"}
</Button>
```

### Page pattern

```tsx
"use client";

import { useArticles, useDeleteArticle } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus } from "lucide-react";

export default function ArticlesPage() {
  const { data, isLoading } = useArticles({ page: 1, limit: 10 });
  const { mutate: deleteArticle } = useDeleteArticle();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button>
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {data?.data.map((article) => (
        <div key={article.id} className="flex items-center justify-between p-4 border rounded">
          <span>{article.title}</span>
          <Button variant="destructive" size="sm" onClick={() => deleteArticle(article.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
```

---

## State Management

| Library         | When to use                                   |
| --------------- | --------------------------------------------- |
| React Query     | Server state (anything from the API)          |
| Zustand         | Client state (UI state, form wizards, ...)    |
| React Hook Form | Form state & validation                       |

---

## Form pattern (React Hook Form + Zod)

Reuse the **server** validator schemas so client and server agree.

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createArticleSchema, type CreateArticleInput } from "@/server/validators";
import { useCreateArticle } from "@/hooks/use-articles";

export function ArticleForm() {
  const { mutate: create, isPending } = useCreateArticle();
  const form = useForm<CreateArticleInput>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: { title: "", content: "", isPublished: false },
  });

  const onSubmit = (data: CreateArticleInput) => create(data);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("title")} placeholder="Judul" />
      {form.formState.errors.title && (
        <p className="text-error-600 text-sm">{form.formState.errors.title.message}</p>
      )}

      <textarea {...form.register("content")} placeholder="Konten" />

      <button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
```

---

## Frontend error handling

The API client throws an error shaped like this:

```typescript
{
  message: string;        // from response.message
  status: number;         // HTTP status
  data: {                 // full response body
    message: string;
    statusCode: number;
    errors?: { rule: string; field: string; message: string }[];
  }
}
```

Map validation errors back onto the form fields:

```typescript
onError: (error: Error & { data?: ApiValidationError }) => {
  if (error.data?.errors) {
    error.data.errors.forEach((err) => {
      form.setError(err.field as keyof FormData, { message: err.message });
    });
  } else {
    toast.error(error.data?.message || "Terjadi kesalahan");
  }
},
```

For a generic handler use `handleApiError(err, "fallback message")` from
`@/lib/error-handler` — it toasts every validation message individually.

---

## Responsiveness

- Mobile-first. Every UI change must be checked on a narrow viewport.
- Use `w-full`, `max-w-*`, `sm:*`, `md:*`, `lg:*` instead of fixed widths.
- Watch for horizontal overflow, tap target size, and scroll comfort.

---

## New Domain Checklist (Frontend)

- [ ] Types in `src/types/[domain].ts`
- [ ] Client service in `src/services/[domain]-service.ts` using `api`
- [ ] Hooks in `src/hooks/use-[domain].ts` with `"use client"`
- [ ] `queryKey` consistent and descriptive
- [ ] Toast via `sonner`
- [ ] Correct query invalidation after mutations
- [ ] Errors surface `error.data?.message`
- [ ] Checked `src/components/ui/` before building anything new
- [ ] Icons from `lucide-react`
- [ ] Page exports `metadata` with a `title`
- [ ] Colors use semantic tokens — no hardcoded hex
