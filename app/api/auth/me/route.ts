import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.userId) }, 
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture || null,
        createdAt: user.createdAt || new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}