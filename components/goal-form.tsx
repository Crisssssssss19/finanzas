"use client"

import type React from "react"
import { useState } from "react"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Target } from "lucide-react"

export function GoalForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      targetAmount: formData.get("targetAmount"),
      deadline: formData.get("deadline"),
      description: formData.get("description"),
    }

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al crear meta")
      }

      // ✅ ACTUALIZAR CACHE DE SWR
      mutate("/api/goals")
      
      setOpen(false)
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Target className="h-5 w-5" />
          Nueva Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
          <DialogDescription>Crea una meta de ahorro con fecha límite para alcanzarla</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Meta</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ej: Vacaciones, Auto nuevo, Fondo de emergencia"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Monto Objetivo</Label>
            <Input
              id="targetAmount"
              name="targetAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Fecha Límite</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe tu meta y por qué es importante..."
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}