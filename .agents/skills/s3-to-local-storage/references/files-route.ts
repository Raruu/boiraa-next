import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { errorResponse } from "@/lib/api-utils";
import { auth } from "@/lib/api-middleware";
import { resolveStoragePath, resolvePublicPath } from "@/lib/upload";

/**
 * GET /api/files/*path
 * Serves stored files to authenticated users only.
 *
 * Resolution order:
 *   1. the private storage root (STORAGE_DIR)
 *   2. the public root (covers versioned seed media, legacy public/uploads)
 *   3. the same two roots with an "uploads/" prefix prepended
 *
 * Traversal and null bytes are rejected before any filesystem access, and the
 * resolved path is verified to stay inside its root (see resolveStoragePath).
 */

/** Extension → Content-Type allow list (served inline) */
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const GET = auth<{ path: string[] }>(async (req: NextRequest, ctx) => {
  try {
    const params = await ctx.params;
    const segments = params?.path ?? [];
    if (segments.length === 0) {
      return errorResponse("File tidak ditemukan", 404);
    }

    /* Reject traversal / null bytes before resolving */
    const raw = segments.join("/");
    if (
      raw.includes("\0") ||
      raw.split("/").some((part) => part === ".." || part === ".")
    ) {
      return errorResponse("File tidak ditemukan", 404);
    }

    const ext = path.extname(raw).slice(1).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) {
      return errorResponse("Tipe file tidak didukung", 415);
    }

    const download = req.nextUrl.searchParams.get("download") === "1";
    const fileName = segments[segments.length - 1];
    const contentDisposition = download
      ? `attachment; filename="${fileName}"`
      : "inline";

    // 1. Try the storage root first
    let resolved = resolveStoragePath(raw);
    let data: Buffer | null = null;
    if (resolved) {
      data = await fs.readFile(resolved).catch(() => null);
    }

    // 2. Fall back to the public root (seed media, legacy public/uploads)
    if (!data) {
      const publicResolved = resolvePublicPath(raw);
      if (publicResolved) {
        data = await fs.readFile(publicResolved).catch(() => null);
        if (data) resolved = publicResolved;
      }
    }

    // 3. If raw lacks the "uploads/" prefix, retry with it in both roots
    if (!data && !raw.startsWith("uploads/")) {
      const storWithUploads = resolveStoragePath(`uploads/${raw}`);
      if (storWithUploads) {
        data = await fs.readFile(storWithUploads).catch(() => null);
        if (data) resolved = storWithUploads;
      }
      if (!data) {
        const pubWithUploads = resolvePublicPath(`uploads/${raw}`);
        if (pubWithUploads) {
          data = await fs.readFile(pubWithUploads).catch(() => null);
          if (data) resolved = pubWithUploads;
        }
      }
    }

    if (!resolved || !data) {
      return errorResponse("File tidak ditemukan", 404);
    }

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(data.length),
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[GET /api/files/:path]", err);
    return errorResponse("Gagal mengambil file", 500);
  }
});
