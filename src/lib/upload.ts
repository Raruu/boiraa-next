import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

/**
 * File storage — currently backed by S3.
 *
 * All uploads go through this module; never call the S3 client directly from
 * routes or services. Only the DB `key` is persisted, the public URL is
 * derived on read.
 *
 * The exported surface is the contract: keep `uploadFile`, `uploadFiles`,
 * `deleteFile`, `deleteFiles`, and `buildFileUrl` stable so the backend can be
 * swapped without touching callers.
 */

const BUCKET = process.env.AWS_S3_BUCKET || "";

export type UploadResult = {
  key: string;
  url: string;
  bucket: string;
  contentType: string;
  size: number;
};

export type UploadOptions = {
  /** Target folder path inside the bucket (e.g. "avatars", "documents/reports") */
  folder?: string;
  /** Custom filename — defaults to timestamped original name */
  filename?: string;
  /** Allowed MIME types (e.g. ["image/png", "image/jpeg"]) — skips check if empty */
  allowedTypes?: string[];
  /** Max file size in bytes — skips check if 0 */
  maxSize?: number;
};

/**
 * Upload a single file (from API route FormData) to S3.
 * Returns the stored key and public URL.
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const { folder, filename, allowedTypes, maxSize } = options;

  /* Validate MIME type */
  if (allowedTypes?.length && !allowedTypes.includes(file.type)) {
    throw new Error(
      `Tipe file tidak diizinkan: ${file.type}. Allowed: ${allowedTypes.join(", ")}`,
    );
  }

  /* Validate file size */
  if (maxSize && file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new Error(`Ukuran file melebihi batas maksimum ${maxMB}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = filename || `${Date.now()}-${slugify(file.name)}`;
  const key = folder ? `${folder}/${safeName}` : safeName;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    }),
  );

  return {
    key,
    url: buildFileUrl(key),
    bucket: BUCKET,
    contentType: file.type,
    size: file.size,
  };
}

/**
 * Upload multiple files to S3.
 * Returns array of upload results in the same order.
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {},
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadFile(file, options)));
}

/**
 * Delete a file from S3 by its key.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}

/**
 * Delete multiple files from S3.
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteFile(key)));
}

/* Build the public URL for a stored S3 key */
export function buildFileUrl(key: string): string {
  if (process.env.AWS_ENDPOINT_URL) {
    return `${process.env.AWS_ENDPOINT_URL}/${BUCKET}/${key}`;
  }
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || "ap-southeast-1"}.amazonaws.com/${key}`;
}

/* Extract file extension including the dot */
function extractExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot !== -1 ? filename.slice(dot) : "";
}

/* Slugify a filename for safe storage */
function slugify(filename: string): string {
  const ext = extractExtension(filename);
  const name = filename.slice(0, filename.length - ext.length);
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + ext
  );
}
