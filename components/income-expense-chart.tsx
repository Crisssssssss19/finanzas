"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CategoryData {
  type: string
  category: string
  total: number
  count: number
}

export function IncomeExpenseChart() {
  const { data, error } = useSWR<{ categoryBreakdown: CategoryData[] }>("/api/transactions/summary", fetcher)

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Error al cargar datos</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  const incomeData = data.categoryBreakdown.filter((item) => item.type === "income")
  const expenseData = data.categoryBreakdown.filter((item) => item.type === "expense")

  const allCategories = new Set([...incomeData.map((i) => i.category), ...expenseData.map((e) => e.category)])

  const chartData = Array.from(allCategories).map((category) => {
    const income = incomeData.find((i) => i.category === category)?.total || 0
    const expense = expenseData.find((e) => e.category === category)?.total || 0

    return {
      category,
      Ingresos: income,
      Gastos: expense,
    }
  })

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Gastos</CardTitle>
          <CardDescription>Comparación por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay datos para mostrar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
        <CardDescription>Comparación por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="Ingresos" fill="#10b981" />
            <Bar dataKey="Gastos" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
