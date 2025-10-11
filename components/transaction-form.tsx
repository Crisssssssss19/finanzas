"use client";

import type React from "react";
import { useState } from "react";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { getTodayLocal } from "@/lib/date-utils";

const INCOME_CATEGORIES = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Negocio",
  "Regalos",
  "Otros Ingresos",
];

const EXPENSE_CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Ropa",
  "Otros Gastos",
];

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type,
      amount: formData.get("amount"),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
    };

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al crear transacción");

      // ✅ Actualizar caché SWR
      mutate("/api/transactions");
      mutate("/api/transactions/summary");

      // ✅ Cerrar modal y limpiar formulario
      setOpen(false);
      e.currentTarget.reset();

      // ✅ Ejecutar callback externo (si existe)
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-5 w-5" /> Nueva Transacción
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Nueva Transacción
          </DialogTitle>
          <DialogDescription className="text-base">
            Registra un nuevo ingreso o gasto en tu cuenta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base">
              Tipo
            </Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as "income" | "expense")}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">💰 Ingreso</SelectItem>
                <SelectItem value="expense">💸 Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">
              Monto
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              disabled={isLoading}
              className="h-11 text-lg"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base">
              Categoría
            </Label>
            <Select name="category" required disabled={isLoading}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Descripción
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe la transacción..."
              required
              disabled={isLoading}
              className="min-h-[80px]"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base">
              Fecha
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={getTodayLocal()}
              max={getTodayLocal()}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* Botón Guardar */}
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Guardar Transacción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
