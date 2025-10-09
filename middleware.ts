import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// ✅ Configuración optimizada para Vercel y Netlify
export const config = {
  matcher: ["/", "/dashboard/:path*"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === "/"
  const isProtectedRoute = pathname.startsWith("/dashboard")

  const token = request.cookies.get("token")?.value

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Verificar el token
    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("token")
      return response
    }
  }

  // Si está en la página de auth y tiene token válido, redirigir al dashboard
  if (isAuthPage && token) {
    const payload = await verifyToken(token)
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}