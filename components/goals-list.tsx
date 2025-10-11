"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, CheckCircle2, Clock, Edit, Minus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
  completed: boolean;
}

interface BalanceData {
  availableBalance: number;
  totalBalance: number;
  moneyInGoals: number;
}

export function GoalsList() {
  const { data, error } = useSWR<{ goals: Goal[] }>("/api/goals", fetcher);
  const { data: balanceData } = useSWR<BalanceData>("/api/balance", fetcher);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addProgressGoal, setAddProgressGoal] = useState<Goal | null>(null);
  const [subtractGoal, setSubtractGoal] = useState<Goal | null>(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [subtractAmount, setSubtractAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editName, setEditName] = useState("");

  // 🗑️ Eliminar meta
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/goals/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        mutate("/api/goals");
        mutate("/api/balance");
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Error eliminando meta:", error);
    }
  };

  // ➕ Agregar ahorro
  const handleAddProgress = async () => {
    if (!addProgressGoal || !progressAmount) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/goals/${addProgressGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: progressAmount }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Error al agregar ahorro");
        return;
      }
      mutate("/api/goals");
      mutate("/api/balance");
      setAddProgressGoal(null);
      setProgressAmount("");
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ➖ Descontar ahorro
  const handleSubtractProgress = async () => {
    if (!subtractGoal || !subtractAmount) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/goals/${subtractGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: subtractAmount, action: "subtract" }),
      });
      if (res.ok) {
        mutate("/api/goals");
        mutate("/api/balance");
        setSubtractGoal(null);
        setSubtractAmount("");
      }
    } catch (error) {
      console.error("Error descontando progreso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✏️ Editar nombre
  const handleEditName = async () => {
    if (!editGoal || !editName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/goals/${editGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        mutate("/api/goals");
        setEditGoal(null);
        setEditName("");
      }
    } catch (error) {
      console.error("Error actualizando nombre:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Error al cargar metas
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  const goals = data.goals || [];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay metas de ahorro creadas
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = differenceInDays(
              new Date(goal.deadline),
              new Date()
            );
            const isOverdue = daysRemaining < 0 && !goal.completed;

            return (
              <Card
                key={goal.id}
                className={
                  goal.completed
                    ? "border-l-4 border-l-green-500" 
                    : "border-l-4 border-l-primary"
                }
                
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {goal.name}
                        {goal.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditGoal(goal);
                          setEditName(goal.name);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Progreso</span>
                      <span className="text-muted-foreground">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        ${goal.currentAmount.toFixed(2)}
                      </span>
                      <span>${goal.targetAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(goal.deadline), "PPP", { locale: es })}
                  </div>

                  {isOverdue ? (
                    <Badge
                      variant="destructive"
                      className="w-full justify-center"
                    >
                      Vencida
                    </Badge>
                  ) : goal.completed ? (
                    <Badge className="w-full justify-center bg-green-600 hover:bg-green-700">
                      Completada
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      {daysRemaining} días restantes
                    </Badge>
                  )}

                  {!goal.completed && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setAddProgressGoal(goal)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" /> Agregar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSubtractGoal(goal)}
                        className="gap-2"
                      >
                        <Minus className="h-4 w-4" /> Descontar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 🗑️ Confirmación eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar meta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La meta será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ➕ Agregar ahorro (con balance disponible) */}
      <Dialog
        open={!!addProgressGoal}
        onOpenChange={() => setAddProgressGoal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ahorro</DialogTitle>
            <DialogDescription>
              Registra cuánto has ahorrado para {addProgressGoal?.name}
            </DialogDescription>
          </DialogHeader>

          {balanceData && (
            <div
              className={`p-3 mb-3 rounded-lg border-2 ${
                balanceData.availableBalance > 0
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300"
                  : "bg-red-50 dark:bg-red-900/20 border-red-300"
              }`}
            >
              <div className="flex justify-between text-sm font-medium">
                <span>💰 Balance disponible:</span>
                <span
                  className={
                    balanceData.availableBalance > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  ${balanceData.availableBalance.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Monto a Agregar</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={progressAmount}
              onChange={(e) => setProgressAmount(e.target.value)}
              disabled={isLoading}
              max={balanceData?.availableBalance || undefined}
            />
            {balanceData &&
              Number(progressAmount) > balanceData.availableBalance && (
                <p className="text-sm text-red-500">
                  ⚠️ No tienes suficiente dinero disponible
                </p>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddProgressGoal(null)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddProgress}
              disabled={
                isLoading ||
                !progressAmount ||
                Number(progressAmount) <= 0 ||
                (balanceData &&
                  Number(progressAmount) > balanceData.availableBalance)
              }
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✏️ Editar nombre */}
      <Dialog open={!!editGoal} onOpenChange={() => setEditGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nombre de Meta</DialogTitle>
            <DialogDescription>
              Cambia el nombre de tu meta de ahorro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nuevo nombre</Label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditGoal(null)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditName}
              disabled={isLoading || !editName.trim()}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ➖ Descontar */}
<Dialog open={!!subtractGoal} onOpenChange={() => setSubtractGoal(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Descontar de Meta</DialogTitle>
      <DialogDescription>
        Registra un retiro de {subtractGoal?.name}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-2">
      <Label>Monto a descontar</Label>
      <Input
        type="number"
        step="0.01"
        placeholder="0.00"
        value={subtractAmount}
        onChange={(e) => setSubtractAmount(e.target.value)}
        disabled={isLoading}
      />
    </div>

    <DialogFooter className="flex justify-center gap-4 mt-6">
      <Button
        variant="outline"
        onClick={() => setSubtractGoal(null)}
        disabled={isLoading}
        className="w-28"
      >
        Cancelar
      </Button>

      <Button
        onClick={handleSubtractProgress}
        disabled={isLoading || parseFloat(subtractAmount || "0") <= 0}
        className={`w-28 transition-all font-semibold text-white 
          ${
            parseFloat(subtractAmount || "0") > 0
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-300 cursor-not-allowed"
          }`}
      >
        {isLoading ? "Procesando..." : "Descontar"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </>
  );
}
