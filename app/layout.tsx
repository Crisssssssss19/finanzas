import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ThemeColorMeta } from "@/components/theme-provider";
import { RegisterSW } from "@/components/register-sw";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "C&A Grow",
  description: "Gestiona tus finanzas personales",
  manifest: "/manifest.json",
  icons: {
    icon: "/192x192.png",
    apple: "/192x192.png",
  },
  appleWebApp: {
    capable: true,
    title: "C&A Grow",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "ThemeProvider.theme.background.primary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 👇 Meta etiquetas extra recomendadas para PWA */}
        <meta name="application-name" content="C&A Grow" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* ✅ Cambiado a black-translucent para mejor apariencia */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="C&A Grow" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* ✅ El color se actualiza dinámicamente desde ThemeColorMeta */}
        <meta name="theme-color" content="#A62454" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/192x192.png" />
        <link rel="apple-touch-icon" href="/192x192.png" />
      </head>
      <body className={inter.className}>
        <RegisterSW />
        <ThemeProvider>
          <ThemeColorMeta />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
