import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Native Node packages must not be bundled by the server compiler. */
  serverExternalPackages: ["bullmq", "ioredis", "nodemailer"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
