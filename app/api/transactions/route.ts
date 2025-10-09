import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const transactionsCollection = db.collection("transactions")

    const query: { userId: ObjectId; type?: string; date?: { $gte?: Date; $lte?: Date } } = {
      userId: new ObjectId(session.userId),
    }

    if (type && type !== "all") {
      query.type = type
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const transactions = await transactionsCollection.find(query).sort({ date: -1 }).toArray()

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      })),
    })
  } catch (error) {
    console.error("Error obteniendo transacciones:", error)
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { type, amount, category, description, date } = await request.json()

    if (!type || !amount || !category || !description) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json({ error: "Tipo de transacción inválido" }, { status: 400 })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const transactionsCollection = db.collection("transactions")

    const result = await transactionsCollection.insertOne({
      userId: new ObjectId(session.userId),
      type,
      amount: Number.parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Transacción creada exitosamente",
        transaction: {
          id: result.insertedId.toString(),
          type,
          amount: Number.parseFloat(amount),
          category,
          description,
          date: date ? new Date(date) : new Date(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando transacción:", error)
    return NextResponse.json({ error: "Error al crear transacción" }, { status: 500 })
  }
}
