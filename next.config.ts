import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Genera build independiente (ideal para Netlify/Vercel)
  output: "standalone",

  // Si usas rutas API, evita Edge runtime
  experimental: {
    serverComponentsExternalPackages: ["mongoose", "jsonwebtoken", "bcrypt"],
  },
};

export default nextConfig;
