import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 👇 configuración correcta
  serverExternalPackages: ["mongodb", "bcryptjs", "jose"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// 👇 Configuración PWA corregida
const withPWAConfig = withPWA({
  dest: "public",
  register: false, // 🚫 No registrar automáticamente
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // ✅ solo producción
});

export default withPWAConfig(nextConfig);
