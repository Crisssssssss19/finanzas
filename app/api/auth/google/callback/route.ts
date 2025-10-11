import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { createToken, setSession } from "@/lib/auth"
import { ObjectId, type Db, type Collection, type Document } from "mongodb"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
}

interface GoogleUserInfo {
  sub: string
  email: string
  name: string
  picture?: string
  email_verified: boolean
}

interface AppUser extends Document {
  _id: ObjectId
  email: string
  name: string
  picture?: string | null
  googleId?: string
  createdAt: Date
  updatedAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/?error=no_code", request.url))
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(new URL("/?error=config_error", request.url))
    }

    // Intercambiar código por token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Error al obtener token de Google")
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Obtener información del usuario
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      throw new Error("Error al obtener información del usuario")
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    // Buscar o crear usuario en la base de datos
    const db: Db | null = await getDatabase()
    if (!db) {
      console.error("Database not configured")
      return NextResponse.redirect(new URL("/?error=db_error", request.url))
    }

    const usersCollection: Collection<AppUser> = db.collection<AppUser>("users")

    let user = await usersCollection.findOne({ email: googleUser.email })

    if (!user) {
      // Crear nuevo usuario
      const result = await usersCollection.insertOne({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture || null,
        googleId: googleUser.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AppUser)

      user = await usersCollection.findOne({ _id: result.insertedId })

      if (!user) {
        console.error("Failed to create user")
        return NextResponse.redirect(new URL("/?error=user_creation_failed", request.url))
      }
    } else {
      // Actualizar campos faltantes
      const updateData: Partial<AppUser> = {
        updatedAt: new Date(),
      }

      if (!user.picture && googleUser.picture) {
        updateData.picture = googleUser.picture
      }

      if (!user.googleId) {
        updateData.googleId = googleUser.sub
      }

      if (Object.keys(updateData).length > 1) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updateData }
        )

        user = await usersCollection.findOne({ _id: user._id })
      }
    }

    // Verificar que el usuario existe antes de crear token
    if (!user || !user._id) {
      console.error("User object is invalid")
      return NextResponse.redirect(new URL("/?error=invalid_user", request.url))
    }

    // Crear token de sesión
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
    })

    await setSession(token)

    // Redirigir al dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error en callback de Google:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
