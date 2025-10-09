import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, isMongoDBConfigured } from "@/lib/mongodb"
import { hashPassword, createToken, setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 503 })
    }

    const usersCollection = db.collection("users")

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    })

    const token = await createToken({
      userId: result.insertedId.toString(),
      email,
    })

    await setSession(token)

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user: { id: result.insertedId.toString(), email, name },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
