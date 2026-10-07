---
name: s3-to-local-storage
description: Switch file uploads from S3 to local disk storage, or back. Use when the user asks to remove the AWS dependency, store files locally, serve files from the server filesystem, or migrate storage backends.
license: MIT
metadata:
  audience: maintainers
  workflow: storage-migration
---

# S3 → Local Storage

Swaps the file storage backend from S3 to the local filesystem, keeping every
caller untouched. The public API of `src/lib/upload.ts` is preserved, so routes
and services that import `uploadFile` / `uploadFiles` / `deleteFile` /
`deleteFiles` keep working without edits.

## When to use me

- "Switch from S3 to local storage" / "remove AWS"
- "Store uploads on disk" / "serve files from the server"
- Migrating a fresh clone that has no S3 bucket to a self-contained setup
- Reverting local storage back to S3 (reverse the same steps)

## What changes

| File | Action |
| --- | --- |
| `src/lib/upload.ts` | Replace with `references/local-upload.ts` |
| `src/lib/file-url.ts` | **New** — from `references/file-url.ts` |
| `src/app/api/files/[...path]/route.ts` | **New** — from `references/files-route.ts` |
| `.env.example` | Add `STORAGE_DIR`, drop the `AWS_*` block |
| `.gitignore` | Ignore the runtime storage directory |
| `package.json` | Remove `@aws-sdk/client-s3` |
| `src/lib/s3.ts` | Delete — **after** confirming with the user |

## Steps

1. **Read before writing.** Read the current `src/lib/upload.ts` and
   `src/app/api/upload/route.ts` so you know what the callers expect. Note the
   exported names: `uploadFile`, `uploadFiles`, `deleteFile`, `deleteFiles`,
   `buildFileUrl`, and the `UploadResult` / `UploadOptions` types.

2. **Confirm the destination with the user.** Ask whether files should live
   under `storage/` (private, served through the auth-protected `/api/files`
   route — the recommended default) or `public/uploads/` (served directly by
   Next.js, no auth). The reference files implement the private variant.

3. **Replace `src/lib/upload.ts`** with `references/local-upload.ts`. It keeps
   the same exported surface plus `resolveStoragePath` / `resolvePublicPath`,
   which the file-serving route needs.

4. **Add `src/lib/file-url.ts`** from `references/file-url.ts`. This turns a DB
   key into a URL. With private storage it returns `/api/files/<key>`.

5. **Add the serving route** `src/app/api/files/[...path]/route.ts` from
   `references/files-route.ts`. It resolves keys against the storage root
   (then the public root as a fallback), rejects traversal, and serves only
   allow-listed content types.

6. **Update `.env.example`**: add `STORAGE_DIR="storage"`, remove the `AWS_*`
   entries. See `references/env-and-gitignore.md`.

7. **Update `.gitignore`**: ignore `/storage/*` but keep `/storage/seed-media/`
   if you version seed assets. Also ignore `/public/uploads/` when using the
   public variant.

8. **Remove the AWS dependency** — only after the user confirms:
   ```bash
   npm uninstall @aws-sdk/client-s3
   ```
   Then delete `src/lib/s3.ts`. If anything still imports it, the build will
   tell you.

9. **Record the decision in memory.** This is expected, not optional — write a
   full entry so the reason for the migration survives the session.

   Create `.agents/memory/storage-local-disk.md`:
   ```markdown
   # Storage moved from S3 to local disk

   - **Decision:** Uploads write to `storage/`, served via `/api/files`.
   - **Why:** <the user's reason — cost, no AWS, self-contained deploy, ...>
   - **Impact:** `@aws-sdk/client-s3` removed; `STORAGE_DIR` replaces `AWS_*`.
     <anything you could not verify, e.g. pre-existing S3 objects are not migrated>
   ```

   Then add one index line to `MEMORY.md`:
   ```
   [storage] <YYYY-MM-DD> — S3 → local disk: uploads in `storage/`, served via `/api/files` → `memory/storage-local-disk.md`
   ```

   Both files need no approval — see the write policy at the top of `MEMORY.md`
   and the "Memory" section of `AGENTS.md`.

10. **Offer to update the rules — do not do it silently.** This migration
    changes documented behavior, so after the code works, ask:
    > "Storage now runs on local disk. Want me to update
    > `.agents/rules/backend-architecture.md` (the File Upload section) and
    > `AGENTS.md` to match?"

    Only proceed if the user says yes. Report the doc change as its own diff —
    separate from the memory entry, which you already wrote in step 9.

11. **Verify.**
    ```bash
    npm run build
    npm test
    npm run lint
    ```
    Then exercise the upload path if a dev server is available:
    ```bash
    npm run dev
    # POST a file to /api/upload, then GET the returned key via /api/files/...
    ```

## Guardrails

- **Never delete `src/lib/s3.ts` or uninstall the AWS SDK before the user
  confirms.** They may want to keep S3 as a fallback.
- **Never edit `.agents/rules/*` or `AGENTS.md` without explicit approval.**
  Offer the update and wait — this is enforced by the protection rules in
  `AGENTS.md`. Memory (`MEMORY.md` + `.agents/memory/`) is the exception:
  write it directly in step 9.
- **Don't touch callers.** If you find yourself editing routes or services,
  you've changed the interface. Put the compatibility back in `upload.ts`.
- **Keep the `key` contract.** DB rows store the key (`uploads/...`), never a
  full URL. `fileUrl()` derives the URL on read — this is what makes the
  backend swappable.
- **Path traversal is the main risk here.** The reference code sanitizes every
  segment and verifies the resolved path stays inside the storage root. Don't
  simplify that away.

## Notes

- `storage/` lives outside `public/`, so files are private by default and only
  reachable through the authenticated `/api/files` route.
- The route serves an allow-list of extensions; extend `CONTENT_TYPES` in
  `references/files-route.ts` when you need another file type.
- Uploads written before the migration (S3 keys) still resolve as URLs only if
  the objects still exist in the bucket. There is no automatic data migration —
  tell the user that explicitly if the app already has production files.
