"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpCircle, ArrowDownCircle, Calendar, DollarSign } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "@/components/theme-provider"
import { themes } from "@/lib/themes"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

interface UserData {
  user: {
    createdAt: string
  }
}

export default function HistoryPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())

  const { theme: themeKey, mode } = useTheme()
  const currentTheme = themes[themeKey][mode]

  const { data, error } = useSWR<{ transactions: Transaction[] }>("/api/transactions", fetcher)
  const { data: userData } = useSWR<UserData>("/api/auth/me", fetcher)

  // ✅ Asegurar que hooks como useMemo siempre se ejecuten
  const transactions = data?.transactions || []

  // Calcular año de inicio basado en datos
  const accountCreationDate = userData?.user?.createdAt
    ? new Date(userData.user.createdAt)
    : (transactions.length > 0 ? new Date(transactions[0].date) : currentDate)

  const startYear = accountCreationDate.getFullYear()
  const endYear = currentDate.getFullYear()

  const availableYears = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse()

  const incomeColor = mode === "dark" ? "#10b981" : "#059669"
  const expenseColor = mode === "dark" ? "#ef4444" : "#dc2626"

  const balanceColor = currentTheme.primary?.startsWith("#")
    ? currentTheme.primary
    : (mode === "dark" ? "#a855f7" : "#9333ea")

  // ✅ Siempre ejecutar useMemo (no dentro de condicional)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthTransactions = transactions.filter((t) => {
        const d = new Date(t.date)
        return (
          d.getMonth() === i &&
          d.getFullYear() === Number(selectedYear)
        )
      })

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(new Date(2024, i, 1), "MMM", { locale: es }),
        Ingresos: income,
        Gastos: expenses,
        Balance: income - expenses,
      }
    })
  }, [transactions, selectedYear])

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getMonth() === Number(selectedMonth) &&
      d.getFullYear() === Number(selectedYear)
    )
  })

  const monthlyIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyBalance = monthlyIncome - monthlyExpenses

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Historial de Transacciones</h2>
            <p className="text-muted-foreground mt-1">
              Datos desde {format(accountCreationDate, "MMMM yyyy", { locale: es })}
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gráfica de Tendencia Anual */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Anual {selectedYear}</CardTitle>
            <CardDescription>Ingresos y gastos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#333' : '#e5e5e5'} />
                <XAxis 
                  dataKey="month" 
                  stroke={mode === 'dark' ? '#888' : '#666'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={mode === 'dark' ? '#888' : '#666'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${mode === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: "8px",
                    color: mode === 'dark' ? '#f3f4f6' : '#111827',
                  }}
                  labelStyle={{ 
                    color: mode === 'dark' ? '#f3f4f6' : '#111827',
                    fontWeight: 'bold'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: mode === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
                <Bar dataKey="Ingresos" fill={incomeColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill={expenseColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Línea de Balance Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Mensual {selectedYear}</CardTitle>
            <CardDescription>Evolución del balance durante el año</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#333' : '#e5e5e5'} />
                <XAxis 
                  dataKey="month" 
                  stroke={mode === 'dark' ? '#888' : '#666'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={mode === 'dark' ? '#888' : '#666'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${mode === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: "8px",
                    color: mode === 'dark' ? '#f3f4f6' : '#111827',
                  }}
                  labelStyle={{ 
                    color: mode === 'dark' ? '#f3f4f6' : '#111827',
                    fontWeight: 'bold'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: mode === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Balance" 
                  stroke={balanceColor}
                  strokeWidth={3}
                  dot={{ fill: balanceColor, r: 4 }}
                  activeDot={{ r: 6, fill: balanceColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Selector de Mes Específico */}
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Detalle Mensual:</h3>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
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
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${monthlyIncome.toFixed(2)}
              </div>
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
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${monthlyExpenses.toFixed(2)}
              </div>
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
                className={`text-2xl font-bold ${
                  monthlyBalance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
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
              {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? "es" : ""}{" "}
              encontrada{filteredTransactions.length !== 1 ? "s" : ""}
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
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      {/* Icono */}
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          transaction.type === "income"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-sm sm:text-base truncate">
                            {transaction.description}
                          </h3>
                          <div
                            className={`text-base sm:text-lg font-bold whitespace-nowrap flex-shrink-0 ${
                              transaction.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "PPP", { locale: es })}
                          </span>
                        </div>
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