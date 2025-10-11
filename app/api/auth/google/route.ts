import { NextResponse } from "next/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Google OAuth no está configurado. Agrega GOOGLE_CLIENT_ID en las variables de entorno." },
      { status: 503 }
    )
  }

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  
  googleAuthUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI)
  googleAuthUrl.searchParams.append("response_type", "code")
  googleAuthUrl.searchParams.append("scope", "openid email profile")
  googleAuthUrl.searchParams.append("access_type", "offline")
  googleAuthUrl.searchParams.append("prompt", "consent")

  return NextResponse.redirect(googleAuthUrl.toString())
}