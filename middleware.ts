import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { isMongoDBConfigured } from "@/lib/mongodb"

// 👇 Forzamos ejecución en Node.js para evitar Edge runtime en Netlify
export const config = {
  matcher: ["/", "/dashboard/:path*"],
  runtime: "nodejs",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === "/"
  const isProtectedRoute = pathname.startsWith("/dashboard")

  // ✅ Evita errores si MongoDB no está configurado
  if (!isMongoDBConfigured() && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const token = request.cookies.get("token")?.value

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("token")
      return response
    }
  }

  if (isAuthPage && token) {
    const payload = await verifyToken(token)
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}
