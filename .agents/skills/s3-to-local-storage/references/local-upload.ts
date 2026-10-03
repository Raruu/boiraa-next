/**
 * File storage — local filesystem backend.
 *
 * Drop-in replacement for the S3 version: the exported surface is identical
 * (`uploadFile`, `uploadFiles`, `deleteFile`, `deleteFiles`, `buildFileUrl`,
 * `UploadResult`, `UploadOptions`), so callers need no changes.
 *
 * Files are written under `STORAGE_ROOT` (default `storage/`, configurable via
 * `STORAGE_DIR`) — a private directory outside `public/`. Only the relative
 * `key` is persisted in the database; the URL is derived on read via
 * `fileUrl()` and served through the auth-protected `/api/files` route.
 *
 * Add `src/lib/file-url.ts` alongside this file (see the skill's references).
 */
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileUrl } from "@/lib/file-url";

/** Storage root — private directory outside public/, configurable via STORAGE_DIR */
export const STORAGE_ROOT = path.join(
  process.cwd(),
  process.env.STORAGE_DIR || "storage",
);
/** Public root — static files served by Next.js */
export const PUBLIC_ROOT = path.join(process.cwd(), "public");

export type UploadResult = {
  key: string;
  url: string;
  size: number;
  contentType: string;
};

export type UploadOptions = {
  /** Target folder path inside storage/uploads (e.g. "reports/logbooks") */
  folder?: string;
  /** Custom filename — defaults to random hex + original extension */
  filename?: string;
  /** Allowed MIME types (e.g. ["image/png", "image/*"]) — skips check if empty */
  allowedTypes?: string[];
  /** Max file size in bytes — skips check if 0 */
  maxSize?: number;
};

/** Magic-byte signatures for supported file types */
const MAGIC_BYTES: { mime: string; bytes: number[]; offset?: number }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  {
    mime: "image/png",
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
];

/** Match a MIME type against an allow list that supports `type/*` wildcards */
function isAllowedMime(mime: string, allowedTypes: string[]): boolean {
  return allowedTypes.some((entry) =>
    entry.endsWith("/*") ? mime.startsWith(entry.slice(0, -1)) : mime === entry,
  );
}

/**
 * Verify the file header (magic bytes) matches its declared MIME type.
 * Returns `null` when the MIME has no known signature (e.g. Word, zip) so the
 * caller can skip the check instead of rejecting a valid allowed type.
 */
function matchesMagicBytes(buffer: Buffer, mime: string): boolean | null {
  const signature = MAGIC_BYTES.find((entry) => entry.mime === mime);
  if (!signature) return null;
  const offset = signature.offset ?? 0;
  return signature.bytes.every(
    (byte, index) => buffer[offset + index] === byte,
  );
}

/**
 * Upload a single file to local storage.
 * Returns the stored key (relative path) and the URL served by /api/files.
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const { folder, filename, allowedTypes, maxSize } = options;

  /* Validate declared MIME type (supports `type/*` wildcards) */
  if (allowedTypes?.length && !isAllowedMime(file.type, allowedTypes)) {
    throw new Error(
      `Tipe file tidak diizinkan: ${file.type || "tidak diketahui"}. Allowed: ${allowedTypes.join(", ")}`,
    );
  }

  /* Validate file size */
  if (maxSize && file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new Error(`Ukuran file melebihi batas maksimum ${maxMB}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  /* Content check against the declared type, when a signature is known */
  if (allowedTypes?.length) {
    const matched = matchesMagicBytes(buffer, file.type);
    if (matched === false) {
      throw new Error("Isi file tidak sesuai dengan tipe yang diizinkan");
    }
  }

  /* Sanitize folder: no traversal, no absolute paths */
  const safeFolder = (folder || "")
    .split(/[/\\]+/)
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");

  const ext = extractExtension(file.name);
  const safeName = filename
    ? `${sanitizeFilename(filename).replace(/\.[^.]+$/, "")}${ext}`
    : `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;

  /* Key includes the "uploads/" prefix so DB filePath matches repo convention */
  const key = safeFolder
    ? `uploads/${safeFolder}/${safeName}`
    : `uploads/${safeName}`;

  const targetPath = path.join(STORAGE_ROOT, ...key.split("/"));
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buffer, { mode: 0o644 });

  return {
    key,
    url: fileUrl(key),
    size: buffer.length,
    contentType: file.type,
  };
}

/**
 * Upload multiple files to local storage.
 * Returns array of upload results in the same order.
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {},
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadFile(file, options)));
}

/**
 * Delete a file from local storage by its key.
 * Accepts keys with or without the leading "uploads/" segment.
 * Silently ignores missing files.
 */
export async function deleteFile(key: string): Promise<void> {
  const resolved = resolveStoragePath(key);
  if (!resolved) return;

  await fs.unlink(resolved).catch(() => undefined);
}

/**
 * Resolve a DB file key to an absolute path inside STORAGE_ROOT.
 * Returns null when the key is empty or escapes the storage root.
 */
export function resolveStoragePath(key: string): string | null {
  const segments = key
    .split(/[/\\]+/)
    .filter((part) => part && part !== "." && part !== "..");
  if (segments.length === 0) return null;

  const targetPath = path.join(STORAGE_ROOT, ...segments);

  /* Ensure the resolved path stays inside the storage root */
  const root = path.resolve(STORAGE_ROOT);
  const resolved = path.resolve(targetPath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolved;
}

/**
 * Resolve a file key to an absolute path inside PUBLIC_ROOT.
 * Returns null when the key is empty or escapes the public root.
 */
export function resolvePublicPath(key: string): string | null {
  const segments = key
    .split(/[/\\]+/)
    .filter((part) => part && part !== "." && part !== "..");
  if (segments.length === 0) return null;

  const targetPath = path.join(PUBLIC_ROOT, ...segments);

  /* Ensure the resolved path stays inside the public root */
  const root = path.resolve(PUBLIC_ROOT);
  const resolved = path.resolve(targetPath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolved;
}

/**
 * Delete multiple files from local storage.
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteFile(key)));
}

/* Build the public URL for a stored key */
export function buildFileUrl(key: string): string {
  return fileUrl(key);
}

/* Extract file extension including the dot */
function extractExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot !== -1 ? filename.slice(dot).toLowerCase() : "";
}

/* Sanitize a filename for safe storage */
function sanitizeFilename(filename: string): string {
  const ext = extractExtension(filename);
  const name = filename.slice(0, filename.length - ext.length);
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${safe || crypto.randomBytes(8).toString("hex")}${ext}`;
}
