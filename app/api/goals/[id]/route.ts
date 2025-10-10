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
        { error: "Base de datos no configurada" },
        { status: 503 },
      )
    }

    const userId = new ObjectId(session.userId)
    
    // ✅ 1. Calcular balance disponible
    const transactionsCollection = db.collection("transactions")
    const summary = await transactionsCollection
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ])
      .toArray()

    const income = summary.find((s) => s._id === "income")?.total || 0
    const expenses = summary.find((s) => s._id === "expense")?.total || 0
    const totalBalance = income - expenses

    // ✅ 2. Calcular dinero ya en metas
    const goalsCollection = db.collection("goals")
    const goalsData = await goalsCollection
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalInGoals: { $sum: "$currentAmount" },
          },
        },
      ])
      .toArray()

    const moneyInGoals = goalsData[0]?.totalInGoals || 0
    const availableBalance = totalBalance - moneyInGoals

    // ✅ 3. Validar que haya suficiente dinero disponible
    const amountToAdd = Number.parseFloat(amount)
    
    if (amountToAdd > availableBalance) {
      return NextResponse.json({
        error: "No tienes suficiente dinero disponible",
        availableBalance,
        requested: amountToAdd,
        message: `Solo tienes $${availableBalance.toFixed(2)} disponibles. No puedes agregar $${amountToAdd.toFixed(2)} a la meta.`
      }, { status: 400 })
    }

    // ✅ 4. Buscar la meta
    const goal = await goalsCollection.findOne({
      _id: new ObjectId(id),
      userId,
    })

    if (!goal) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })
    }

    // ✅ 5. Actualizar meta
    const newAmount = goal.currentAmount + amountToAdd
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
      availableBalance: availableBalance - amountToAdd, // Nuevo balance disponible
    })
  } catch (error) {
    console.error("Error actualizando progreso:", error)
    return NextResponse.json({ error: "Error al actualizar progreso" }, { status: 500 })
  }
}