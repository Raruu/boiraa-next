import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "@/lib/api-utils";
import { auth } from "@/lib/api-middleware";
import { uploadFile, uploadFiles, deleteFile } from "@/lib/upload";

/**
 * File upload endpoints — backed by S3 (see src/lib/upload.ts).
 *
 * POST /api/upload   multipart: `file` (single) or `files` (multiple) + `folder`
 * DELETE /api/upload  json: { key }
 */
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* POST /api/upload — Upload single or multiple files to S3 */
export const POST = auth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const folder = (formData.get("folder") as string) || "uploads";
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    /* Multiple files */
    if (files.length > 0) {
      const results = await uploadFiles(files, {
        folder,
        allowedTypes: ALLOWED_TYPES,
        maxSize: MAX_SIZE,
      });

      const data = results.map((r) => ({ key: r.key, url: r.url }));
      return apiResponse(data, "Upload berhasil", 201);
    }

    /* Single file */
    if (singleFile) {
      const result = await uploadFile(singleFile, {
        folder,
        allowedTypes: ALLOWED_TYPES,
        maxSize: MAX_SIZE,
      });

      return apiResponse(
        { key: result.key, url: result.url },
        "Upload berhasil",
        201,
      );
    }

    return errorResponse("File wajib disertakan", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal upload file";
    console.error("[POST /api/upload]", err);
    return errorResponse(message, 400);
  }
});

/* DELETE /api/upload — Delete file from S3 by key */
export const DELETE = auth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const key = body.key as string;

    if (!key) {
      return errorResponse("Key file wajib disertakan", 400);
    }

    await deleteFile(key);
    return apiResponse(null, "File berhasil dihapus");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus file";
    console.error("[DELETE /api/upload]", err);
    return errorResponse(message, 400);
  }
});
