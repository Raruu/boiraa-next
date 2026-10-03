import { S3Client } from "@aws-sdk/client-s3";

/**
 * S3 client singleton.
 *
 * Only `src/lib/upload.ts` should import this. Application code calls
 * `uploadFile` / `deleteFile` from `@/lib/upload` instead.
 *
 * Set AWS_ENDPOINT_URL to target an S3-compatible service (MinIO, R2,
 * DigitalOcean Spaces); path-style addressing is enabled automatically.
 */
const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
};

export const s3 =
  globalForS3.s3 ??
  new S3Client({
    region: process.env.AWS_REGION || "ap-southeast-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    ...(process.env.AWS_ENDPOINT_URL && {
      endpoint: process.env.AWS_ENDPOINT_URL,
      forcePathStyle: true,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;
