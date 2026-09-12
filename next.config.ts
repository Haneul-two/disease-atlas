import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Persistent build cache reused stale global CSS during local verification.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
