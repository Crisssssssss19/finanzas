import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

// ✅ Eliminar meta
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

// ✅ Actualizar meta (nombre, agregar o restar dinero con validaciones)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { amount, name, action } = body

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const userId = new ObjectId(session.userId)
    const goalsCollection = db.collection("goals")

    const goal = await goalsCollection.findOne({ _id: new ObjectId(id), userId })
    if (!goal) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })
    }

    // ✅ Caso 1: Editar solo el nombre
    if (name && !amount) {
      await goalsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { name, updatedAt: new Date() },
        },
      )
      return NextResponse.json({ message: "Nombre actualizado exitosamente", name })
    }

    // ✅ Caso 2: Modificar dinero (agregar o restar)
    if (amount) {
      const amountValue = Number.parseFloat(amount)
      if (amountValue <= 0) {
        return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
      }

      let newAmount = goal.currentAmount

      if (action === "subtract") {
        // 🔹 Restar dinero (sin balance check)
        newAmount = Math.max(0, goal.currentAmount - amountValue)
      } else {
        // 🔹 Agregar dinero con validación de fondos disponibles

        // 1️⃣ Calcular balance total (ingresos - gastos)
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

        // 2️⃣ Calcular dinero ya asignado a metas
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

        // 3️⃣ Validar fondos disponibles
        if (amountValue > availableBalance) {
          return NextResponse.json({
            error: "No tienes suficiente dinero disponible",
            availableBalance,
            requested: amountValue,
            message: `Solo tienes $${availableBalance.toFixed(2)} disponibles. No puedes agregar $${amountValue.toFixed(2)} a la meta.`,
          }, { status: 400 })
        }

        // 4️⃣ Actualizar cantidad
        newAmount = goal.currentAmount + amountValue
      }

      // ✅ Verificar si la meta se completó
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
        message: action === "subtract" ? "Dinero descontado exitosamente" : "Progreso actualizado exitosamente",
        currentAmount: newAmount,
        completed,
      })
    }

    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Error actualizando meta:", error)
    return NextResponse.json({ error: "Error al actualizar meta" }, { status: 500 })
  }
}
