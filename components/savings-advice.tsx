"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Loader2, Sparkles } from "lucide-react"

interface Advice {
  titulo: string
  descripcion: string
}

export function SavingsAdvice() {
  const [advice, setAdvice] = useState<Advice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const generateAdvice = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/advice", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Error al generar consejos")
      }

      const data = await response.json()
      setAdvice(data.consejos || [])
    } catch (err) {
      setError("No se pudieron generar los consejos. Intenta de nuevo.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Consejos de Ahorro con IA
            </CardTitle>
            <CardDescription>Obtén recomendaciones personalizadas basadas en tus finanzas</CardDescription>
          </div>
          <Button onClick={generateAdvice} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4" />
                Generar Consejos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {advice.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Haz clic en (Generar Consejos) para obtener recomendaciones personalizadas</p>
          </div>
        )}

        {advice.length > 0 && (
          <div className="space-y-4">
            {advice.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                    {index + 1}
                  </span>
                  {item.titulo}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
