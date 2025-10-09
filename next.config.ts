import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  experimental: {
    serverComponentsExternalPackages: [
      "mongodb",
      "bcryptjs",
      "jose",
    ],
  },
};

export default nextConfig;