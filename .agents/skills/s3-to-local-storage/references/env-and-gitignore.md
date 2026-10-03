# Env & gitignore changes for local storage

## `.env.example`

Remove the `AWS_*` block:

```diff
-# AWS S3
-AWS_REGION="ap-southeast-1"
-AWS_ACCESS_KEY_ID=""
-AWS_SECRET_ACCESS_KEY=""
-AWS_S3_BUCKET=""
-# AWS_ENDPOINT_URL=""  # uncomment for S3-compatible (MinIO, DigitalOcean Spaces, etc.)
```

Add:

```diff
+# Storage (private file storage root, served via /api/files — outside public/)
+STORAGE_DIR="storage"
```

## `.gitignore`

Keep the runtime directory out of git, but version seed assets if you have
them:

```diff
+# storage (runtime uploads are private & ignored; seed media is versioned)
+/storage/*
+!/storage/seed-media/
+
+# uploaded files (only when using the public/uploads variant)
+/public/uploads/
```

If you chose the `public/uploads/` variant instead of private `storage/`,
ignore `/public/uploads/` and skip the `STORAGE_DIR` variable — the reference
upload implementation writes to `storage/` and serves through `/api/files`.

## Migration checklist

- [ ] `STORAGE_DIR` documented in `.env.example`
- [ ] `storage/` (or `public/uploads/`) added to `.gitignore`
- [ ] `.env` still holds `DATABASE_URL` and auth secrets (untouched)
- [ ] No `AWS_*` keys remain in `.env.example`
- [ ] Team told that existing S3 objects are not migrated automatically
