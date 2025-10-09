import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateText } from "ai"

export async function POST() {
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

    const transactionsCollection = db.collection("transactions")
    const goalsCollection = db.collection("goals")

    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(session.userId) })
      .sort({ date: -1 })
      .limit(50)
      .toArray()

    const goals = await goalsCollection.find({ userId: new ObjectId(session.userId) }).toArray()

    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses

    const expensesByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }))

    const activeGoals = goals.filter((g) => !g.completed)

    const prompt = `Eres un asesor financiero experto. Analiza la siguiente información financiera y proporciona 3-5 consejos personalizados de ahorro en español:

Situación Financiera:
- Ingresos totales: $${income.toFixed(2)}
- Gastos totales: $${expenses.toFixed(2)}
- Balance: $${balance.toFixed(2)}
- Tasa de ahorro: ${income > 0 ? ((balance / income) * 100).toFixed(1) : 0}%

Principales categorías de gasto:
${topExpenseCategories.map((c) => `- ${c.category}: $${c.amount.toFixed(2)}`).join("\n")}

Metas de ahorro activas:
${activeGoals.length > 0 ? activeGoals.map((g) => `- ${g.name}: $${g.currentAmount.toFixed(2)} / $${g.targetAmount.toFixed(2)}`).join("\n") : "No hay metas activas"}

Proporciona consejos específicos, prácticos y motivadores. Cada consejo debe:
1. Ser específico a los datos proporcionados
2. Incluir un título breve y descriptivo
3. Tener una explicación clara de 2-3 oraciones
4. Ser realista y alcanzable

Formato de respuesta (JSON):
{
  "consejos": [
    {
      "titulo": "Título del consejo",
      "descripcion": "Explicación detallada del consejo"
    }
  ]
}`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    let consejos
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        consejos = JSON.parse(jsonMatch[0]).consejos
      } else {
        consejos = [
          {
            titulo: "Análisis generado",
            descripcion: text,
          },
        ]
      }
    } catch {
      consejos = [
        {
          titulo: "Consejo personalizado",
          descripcion: text,
        },
      ]
    }

    return NextResponse.json({ consejos })
  } catch (error) {
    console.error("Error generando consejos:", error)
    return NextResponse.json({ error: "Error al generar consejos" }, { status: 500 })
  }
}
