# Security Standards (OWASP)

> **PROTECTED — see `AGENTS.md` → "Instruction File Protection".**
> Edit only when the user explicitly asks. Don't rewrite on your own initiative.

Reference: OWASP Secure Coding Practices.

---

## 1. Input Validation

- All user input **MUST** be validated server-side (client validation is UX,
  not security).
- Use an **allow list** (permit only what's expected), never a block list.
- Validate type, string length, numeric range, and encoding (UTF-8).
- Use Zod `.safeParse()` — never `.parse()`, which throws.
- File uploads: validate the MIME type from the file header (magic bytes),
  not just the extension.

### Checklist

- [ ] Input validated server-side
- [ ] Validation uses an allow list
- [ ] Type and length checked
- [ ] Failures handled and reported

---

## 2. Output Encoding

- Encode all output before rendering.
- **NEVER** use `dangerouslySetInnerHTML` without sanitizing (use DOMPurify).
- React escapes by default — don't bypass it.
- Treat everything from the database/API/files as untrusted.

### Checklist

- [ ] Output encoded
- [ ] Framework auto-escaping intact
- [ ] No unsanitized `innerHTML` / `dangerouslySetInnerHTML`

---

## 3. Authentication & Password Management

- Passwords **MUST** be hashed with bcrypt (saltRounds: 10) — never MD5/SHA-1.
- Never store plaintext passwords.
- Failed login: generic message ("Email atau password salah") — don't reveal
  which field was wrong.
- Password policy: min 8 characters, mixed case, digits, symbols.
- Sessions must expire automatically.

This boilerplate already implements the generic message and bcrypt compare in
`src/server/services/auth/auth.service.ts`.

### Checklist

- [ ] Passwords hashed (bcrypt/argon2)
- [ ] Password policy enforced (min 8, mixed characters)
- [ ] Generic failure message
- [ ] Sessions expire automatically

---

## 4. Session Management

- Never put a session ID in the URL or logs.
- Session cookies **MUST** be `secure: true`, `httpOnly: true`,
  `sameSite: strict|lax`.
- Session timeout: 15–30 minutes of inactivity.
- Regenerate the session ID after login.
- Always use HTTPS for cookie transmission.

This boilerplate: `at` (5 min) + `rt` (5 days) in httpOnly cookies, see
`src/lib/auth-cookies.ts`.

### Checklist

- [ ] Cookies carry Secure, HttpOnly, SameSite
- [ ] Session IDs are random and long enough
- [ ] Session expires after idle time
- [ ] Session ID regenerated after login

---

## 5. Access Control (Authorization)

- **Deny by default** — reject everything not explicitly allowed.
- Authorization checks **MUST** be server-side, not just hidden in the UI.
- Check ownership before update/delete: users may only touch their own data
  (unless admin).
- Use RBAC via the `role()` middleware.
- Prevent IDOR: always scope by `authUser.id` where relevant.

```typescript
// Ownership check in the service
static async update(id: string, data: Record<string, unknown>, authUserId: string) {
  const record = await repo.findById(id);
  if (!record) throw new Error("Data tidak ditemukan");
  if (record.authorId !== authUserId) throw new Error("Tidak memiliki akses");
  return repo.update(id, data);
}
```

### Checklist

- [ ] Every sensitive function checks permissions
- [ ] Authorization server-side, not UI-only
- [ ] Users cannot reach other users' data by changing an ID

---

## 6. Cryptographic Practices

- **NEVER** invent your own crypto.
- Use industry standards: AES-256 for encryption, bcrypt for hashing.
- Keys live in `.env`, never in source.
- Use `crypto.randomBytes()` for randomness — never `Math.random()`.
- Tokens and salts come from a cryptographically secure RNG.

### Checklist

- [ ] Industry-standard algorithms (AES, RSA, bcrypt)
- [ ] Keys outside source control
- [ ] Cryptographic RNG for randomness

---

## 7. Error Handling & Logging

- **NEVER** expose stack traces, file names, or database details to the client.
- Client-facing errors are generic and user-friendly.
- Detail goes to `console.error()` only.
- Log important events: failed logins, denied access, system errors.
- **NEVER** log passwords or sensitive data.

```typescript
catch (err) {
  console.error("[POST /api/articles]", err); // detail stays in server log
  return errorResponse("Gagal memproses", 500); // generic to client
}
```

### Checklist

- [ ] User-visible errors are generic
- [ ] Details in server logs
- [ ] Logs contain no sensitive data

---

## 8. Data Protection

- Encrypt sensitive data at rest.
- Delete temporary files as soon as they're no longer needed.
- **Least privilege** — the minimum access necessary.
- Never ship passwords, API keys, or connection strings to the browser.
- Exclude sensitive fields from API responses (`select`/`omit` in the
  repository).

```typescript
// Exclude password from the response
async findById(id: string) {
  return this.model.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
```

### Checklist

- [ ] Sensitive data encrypted at rest
- [ ] Temporary files deleted promptly
- [ ] Sensitive fields excluded from responses
- [ ] No secrets in client-side code

---

## 9. Communication Security

- All connections **MUST** be HTTPS/TLS — not just the login page.
- No fallback to HTTP if TLS fails.
- Certificates valid and unexpired.
- Configure HSTS.

### Checklist

- [ ] Whole app over HTTPS
- [ ] Valid SSL certificate
- [ ] No HTTP fallback

---

## 10. System Configuration

- `.env` **MUST** be gitignored — never commit it.
- Disable debug mode in production (`NODE_ENV=production`).
- Disable directory listing.
- Replace all default passwords.
- Keep servers, frameworks, and libraries on patched versions.
- Don't leak server details in response headers.

### Checklist

- [ ] Debug off in production
- [ ] Sensitive config out of version control
- [ ] Libraries up to date
- [ ] Response headers don't expose server info

---

## 11. Database Security

- Parameterized queries are mandatory — Prisma does this by default.
- Never bypass with `$queryRawUnsafe`. For raw SQL use the `Prisma.sql`
  tagged template.

```typescript
// WRONG — SQL injection risk
prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

// RIGHT — parameterized
prisma.$queryRaw(Prisma.sql`SELECT * FROM users WHERE email = ${email}`);
```

- Database accounts get minimum privileges (not root).
- Connection strings live in `.env`, never hardcoded.
- The Prisma singleton handles connection lifecycle — don't create new clients.

### Checklist

- [ ] All queries parameterized
- [ ] Limited DB account privileges
- [ ] Connection string not in source
- [ ] Database errors handled safely

---

## 12. File Management

- Validate file type from **magic bytes**, not just the extension.
- Rename uploaded files with random names (`crypto.randomBytes`).
- Store outside the web root or in cloud storage (S3).
- Disable execute permission on upload folders.
- Enforce a server-side size limit.
- Scan files before further processing when feasible.

The boilerplate's `src/lib/upload.ts` handles MIME validation and slugified
names; `/api/upload` enforces size and type limits.

### Checklist

- [ ] File type validated from content (magic bytes)
- [ ] Random file names
- [ ] Stored in a non-executable location
- [ ] Size limited

---

## 13. Memory Management

- Bound every input (max length validation).
- Close resources (file handles, connections) explicitly.
- Limit API payload size.
- Stream large files instead of loading them fully into memory.

### Checklist

- [ ] All inputs length-bounded
- [ ] Resources released
- [ ] Payload size limited

---

## 14. General Coding Practices

- **NEVER** use `eval()` or other dynamic execution.
- Use `JSON.parse()` to parse data, not eval.
- Initialize variables at declaration.
- Keep TypeScript strict mode on.
- Third-party libraries: review the source, pin versions.
- Never build queries or commands by string concatenation.

### Checklist

- [ ] No `eval()` or dynamic execution
- [ ] All variables initialized
- [ ] Libraries from trusted sources, up to date
- [ ] No race conditions on shared resources

---

## 15. API Security & Rate Limiting

- Rate limit sensitive endpoints (login, register, forgot password, upload).
- Stricter limit for login: 5 requests per 15 minutes.
- CORS strict — **NEVER** `Access-Control-Allow-Origin: *` in production.
- Allow only known domains.
- Consider CAPTCHA on endpoints prone to brute force.

### Checklist

- [ ] Sensitive endpoints rate limited
- [ ] CORS allows only known domains
- [ ] No wildcard origin in production

---

## 16. Token Management (Access & Refresh Token)

- **Access token**: short-lived (≤ 15 min), in memory or a cookie.
- **Refresh token**: longer-lived (7–30 days), in an HttpOnly cookie.
- Rotation: every refresh issues a new pair and invalidates the old one.
- Revoke all tokens on logout or password change.
- Use a strong JWT algorithm (HS256 with a long secret, or RS256).

```typescript
// Access token — short TTL
const accessToken = await signAccessToken(payload);

// Refresh token — HttpOnly cookie
response.cookies.set("rt", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});
```

### Checklist

- [ ] Access token TTL ≤ 15 minutes
- [ ] Refresh token extends the session
- [ ] Tokens revoked on logout/password change
- [ ] Refresh token in an HttpOnly cookie

---

## Secrets handling

- All secrets live in `.env`; `.env.example` documents the shape with empty or
  placeholder values.
- `AUTH_JWT_SECRET` **MUST** be a long random string in production.
- Never log secrets, tokens, or credentials — including in error objects.
- Rotate credentials immediately if one is ever committed.

### Checklist

- [ ] No secret in source or client bundles
- [ ] `.env` gitignored
- [ ] Production secrets distinct from development
