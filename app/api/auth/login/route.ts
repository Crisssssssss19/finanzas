import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, isMongoDBConfigured } from "@/lib/mongodb"
import { verifyPassword, createToken, setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 503 })
    }

    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
    })

    await setSession(token)

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
