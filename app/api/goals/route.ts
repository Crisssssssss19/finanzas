import { type NextRequest, NextResponse } from "next/server"
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
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const goalsCollection = db.collection("goals")

    const goals = await goalsCollection
      .find({ userId: new ObjectId(session.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      goals: goals.map((g) => ({
        id: g._id.toString(),
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        description: g.description,
        completed: g.completed,
        createdAt: g.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error obteniendo metas:", error)
    return NextResponse.json({ error: "Error al obtener metas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { name, targetAmount, deadline, description } = await request.json()

    if (!name || !targetAmount || !deadline) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json(
        { error: "Base de datos no configurada. Por favor agrega MONGODB_URI a las variables de entorno." },
        { status: 503 },
      )
    }

    const goalsCollection = db.collection("goals")

    const result = await goalsCollection.insertOne({
      userId: new ObjectId(session.userId),
      name,
      targetAmount: Number.parseFloat(targetAmount),
      currentAmount: 0,
      deadline: new Date(deadline),
      description: description || "",
      completed: false,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Meta creada exitosamente",
        goal: {
          id: result.insertedId.toString(),
          name,
          targetAmount: Number.parseFloat(targetAmount),
          currentAmount: 0,
          deadline: new Date(deadline),
          description: description || "",
          completed: false,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando meta:", error)
    return NextResponse.json({ error: "Error al crear meta" }, { status: 500 })
  }
}
