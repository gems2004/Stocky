import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // IMPORTANT: Remove this configuration in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // IMPORTANT: Remove this configuration in production
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
