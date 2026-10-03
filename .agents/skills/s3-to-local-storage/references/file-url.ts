/**
 * Build the authenticated URL for a stored file.
 * DB keys (e.g. "uploads/reports/details/x.webp") are served through the
 * auth-protected /api/files route — never a raw filesystem path.
 *
 * Absolute URLs (http/https) pass through unchanged, so switching between
 * backends (S3 returned absolute URLs, local returns relative) does not break
 * components that render whatever is stored.
 */
export function fileUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const clean = filePath.replace(/^\/+/, "");
  const encoded = clean
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/files/${encoded}`;
}
