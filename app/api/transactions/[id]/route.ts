import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const transactionsCollection = db.collection("transactions")

    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Transacción eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando transacción:", error)
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const { type, amount, category, description, date } = await request.json()

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const transactionsCollection = db.collection("transactions")

    const result = await transactionsCollection.updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(session.userId),
      },
      {
        $set: {
          type,
          amount: Number.parseFloat(amount),
          category,
          description,
          date: date ? new Date(date) : new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Transacción actualizada exitosamente" })
  } catch (error) {
    console.error("Error actualizando transacción:", error)
    return NextResponse.json({ error: "Error al actualizar transacción" }, { status: 500 })
  }
}
