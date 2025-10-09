"use client"

import { useState } from "react"
import useSWR from "swr"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, CheckCircle2, Clock } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string
  completed: boolean
}

export function GoalsList() {
  const { data, error, mutate } = useSWR<{ goals: Goal[] }>("/api/goals", fetcher)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addProgressGoal, setAddProgressGoal] = useState<Goal | null>(null)
  const [progressAmount, setProgressAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/goals/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate()
        setDeleteId(null)
      }
    } catch (error) {
      console.error("Error eliminando meta:", error)
    }
  }

  const handleAddProgress = async () => {
    if (!addProgressGoal || !progressAmount) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/goals/${addProgressGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: progressAmount }),
      })

      if (response.ok) {
        mutate()
        setAddProgressGoal(null)
        setProgressAmount("")
      }
    } catch (error) {
      console.error("Error actualizando progreso:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Error al cargar metas</p>
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

  const goals = data.goals || []

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">No hay metas de ahorro creadas</p>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const daysRemaining = differenceInDays(new Date(goal.deadline), new Date())
            const isOverdue = daysRemaining < 0 && !goal.completed

            return (
              <Card key={goal.id} className={goal.completed ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {goal.name}
                        {goal.completed && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
                      </CardTitle>
                      <CardDescription className="mt-1">{goal.description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progreso</span>
                      <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">${goal.currentAmount.toFixed(2)}</span>
                      <span className="text-sm font-medium">${goal.targetAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {format(new Date(goal.deadline), "PPP", { locale: es })}
                    </span>
                  </div>

                  {isOverdue ? (
                    <Badge variant="destructive" className="w-full justify-center">
                      Vencida
                    </Badge>
                  ) : goal.completed ? (
                    <Badge className="w-full justify-center bg-green-600 hover:bg-green-700">Completada</Badge>
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center">
                      {daysRemaining} días restantes
                    </Badge>
                  )}

                  {!goal.completed && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 bg-transparent"
                      onClick={() => setAddProgressGoal(goal)}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Ahorro
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar meta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La meta será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!addProgressGoal} onOpenChange={() => setAddProgressGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ahorro</DialogTitle>
            <DialogDescription>Registra cuánto has ahorrado para {addProgressGoal?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="progress-amount">Monto a Agregar</Label>
              <Input
                id="progress-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {addProgressGoal && (
              <div className="text-sm text-muted-foreground">
                Progreso actual: ${addProgressGoal.currentAmount.toFixed(2)} / $
                {addProgressGoal.targetAmount.toFixed(2)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProgressGoal(null)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleAddProgress} disabled={isLoading || !progressAmount}>
              {isLoading && <span className="mr-2">Guardando...</span>}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
