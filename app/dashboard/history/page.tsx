"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpCircle, ArrowDownCircle, Calendar, DollarSign } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

export default function HistoryPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())

  const { data, error } = useSWR<{ transactions: Transaction[] }>("/api/transactions", fetcher)

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-destructive">Error al cargar transacciones</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Cargando historial...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const transactions = data.transactions || []

  // Filtrar transacciones por mes y año seleccionados
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return (
      transactionDate.getMonth() === Number.parseInt(selectedMonth) &&
      transactionDate.getFullYear() === Number.parseInt(selectedYear)
    )
  })

  // Calcular totales del mes
  const monthlyIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const monthlyBalance = monthlyIncome - monthlyExpenses

  // Generar opciones de meses y años
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Historial de Transacciones</h2>
            <p className="text-muted-foreground mt-1">Revisa todos tus ingresos y gastos por mes</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumen mensual */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
                Ingresos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">${monthlyIncome.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-red-600" />
                Gastos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">${monthlyExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Balance del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${monthlyBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                ${monthlyBalance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>
              Transacciones de {months[Number.parseInt(selectedMonth)]} {selectedYear}
            </CardTitle>
            <CardDescription>
              {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? "es" : ""} encontrada
              {filteredTransactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay transacciones en este mes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(transaction.date), "PPP", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
