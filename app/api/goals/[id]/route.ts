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

    const goalsCollection = db.collection("goals")

    const result = await goalsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Meta eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando meta:", error)
    return NextResponse.json({ error: "Error al eliminar meta" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const goalsCollection = db.collection("goals")

    const goal = await goalsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId),
    })

    if (!goal) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })
    }

    const newAmount = goal.currentAmount + Number.parseFloat(amount)
    const completed = newAmount >= goal.targetAmount

    await goalsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          currentAmount: newAmount,
          completed,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      message: "Progreso actualizado exitosamente",
      currentAmount: newAmount,
      completed,
    })
  } catch (error) {
    console.error("Error actualizando progreso:", error)
    return NextResponse.json({ error: "Error al actualizar progreso" }, { status: 500 })
  }
}
