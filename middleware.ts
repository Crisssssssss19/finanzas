import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { isMongoDBConfigured } from "@/lib/mongodb"

export const runtime = "nodejs"

export async function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname === "/"
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")

  // Si no está configurado MongoDB y es una ruta protegida, redirigir a home
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

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}
