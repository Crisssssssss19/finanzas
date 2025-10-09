import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",

  // Evita que middleware use Edge runtime automáticamente
  experimental: {
    serverComponentsExternalPackages: [
      "mongoose",
      "jsonwebtoken",
      "bcrypt",
      "nodemailer",
    ],
  },

};

export default nextConfig;