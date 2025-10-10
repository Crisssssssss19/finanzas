"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Flag} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BalanceData {
  totalBalance: number
  moneyInGoals: number
  availableBalance: number
  income: number
  expenses: number
}

export function AvailableBalance() {
  const { data, error } = useSWR<BalanceData>("/api/balance", fetcher)

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Error al cargar balance</p>
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Metas</CardTitle>
          <Flag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${data.moneyInGoals.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dinero guardado en metas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponible</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${data.availableBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Para usar libremente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}