import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
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
        { error: "Base de datos no configurada" },
        { status: 503 },
      )
    }

    const userId = new ObjectId(session.userId)

    // Calcular balance de transacciones
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

    // Calcular dinero en metas
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

    return NextResponse.json({
      totalBalance,      // Ingresos - Gastos
      moneyInGoals,      // Dinero guardado en metas
      availableBalance,  // Dinero libre para usar
      income,
      expenses,
    })
  } catch (error) {
    console.error("Error obteniendo balance:", error)
    return NextResponse.json({ error: "Error al obtener balance" }, { status: 500 })
  }
}