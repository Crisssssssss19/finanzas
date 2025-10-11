import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // 🔹 Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // 🔹 Leer parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // formato esperado: "yyyy-MM"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // 🔹 Conexión a la base de datos
    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        {
          error:
            "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno.",
        },
        { status: 503 },
      )
    }

    const transactionsCollection = db.collection("transactions")

    // 🔹 Construcción dinámica del filtro
    const matchQuery: { userId: ObjectId; date?: { $gte?: Date; $lte?: Date } } = {
      userId: new ObjectId(session.userId),
    }

    // ✅ Soporte para `month`, `startDate` y `endDate`
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const start = new Date(year, monthNum - 1, 1)
      const end = new Date(year, monthNum, 0, 23, 59, 59, 999)
      matchQuery.date = { $gte: start, $lte: end }
    } else if (startDate || endDate) {
      matchQuery.date = {}
      if (startDate) matchQuery.date.$gte = new Date(startDate)
      if (endDate) matchQuery.date.$lte = new Date(endDate)
    }

    // 🔹 Agregación principal: resumen por tipo (ingresos y gastos)
    const summary = await transactionsCollection
      .aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const income = summary.find((s) => s._id === "income")?.total || 0
    const expenses = summary.find((s) => s._id === "expense")?.total || 0
    const balance = income - expenses

    // 🔹 Desglose por categoría
    const categoryBreakdown = await transactionsCollection
      .aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { type: "$type", category: "$category" },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray()

    // 🔹 Respuesta final
    return NextResponse.json({
      income,
      expenses,
      balance,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        type: c._id.type,
        category: c._id.category,
        total: c.total,
        count: c.count,
      })),
    })
  } catch (error) {
    console.error("Error obteniendo resumen:", error)
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 })
  }
}
