"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface SummaryData {
  income: number
  expenses: number
  balance: number
}

export function FinancialSummary() {
  const { data, error } = useSWR<SummaryData>("/api/transactions/summary", fetcher)

  if (error) {
    return <div className="text-center text-muted-foreground">Error al cargar resumen</div>
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

  const savingsRate = data.income > 0 ? ((data.balance / data.income) * 100).toFixed(1) : "0.0"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">${data.income.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total de ingresos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">${data.expenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total de gastos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              data.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            ${data.balance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ingresos - Gastos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Ahorro</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savingsRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">Del total de ingresos</p>
        </CardContent>
      </Card>
    </div>
  )
}
