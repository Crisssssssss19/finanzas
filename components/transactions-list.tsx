"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, TrendingUp, TrendingDown } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

export function TransactionsList() {
  const { data, error } = useSWR<{ transactions: Transaction[] }>("/api/transactions", fetcher)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/transactions/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // ✅ ACTUALIZAR CACHE DE SWR
        mutate("/api/transactions")
        mutate("/api/transactions/summary")
        setDeleteId(null)
      }
    } catch (error) {
      console.error("Error eliminando transacción:", error)
    }
  }

  if (error) {
    return (
      <Card className="max-w-full mx-auto p-4 sm:p-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground text-sm sm:text-base">
            Error al cargar transacciones
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="max-w-full mx-auto p-4 sm:p-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground text-sm sm:text-base">
            Cargando...
          </p>
        </CardContent>
      </Card>
    )
  }

  const transactions = data.transactions || []

  return (
    <>
      <Card className="max-w-4xl mx-auto w-full p-3 sm:p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg sm:text-xl font-bold">
            Transacciones Recientes
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh] sm:max-h-none">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
              No hay transacciones registradas
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-2 rounded-full flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium truncate text-sm sm:text-base">
                          {transaction.description}
                        </p>
                        <Badge variant="outline" className="text-xs sm:text-sm">
                          {transaction.category}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PPP", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <p
                      className={`text-base sm:text-lg font-bold ${
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(transaction.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90%] sm:max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar transacción</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}