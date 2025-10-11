"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Wallet } from "lucide-react"

export function AuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: "login" | "register") => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      ...(type === "register" && { name: formData.get("name") as string }),
    }

    try {
      const response = await fetch(`/api/auth/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error en la autenticación")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            FinanzasApp
          </CardTitle>
          <CardDescription className="text-base">
            Gestiona tus finanzas personales de manera inteligente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-base">
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="text-base">
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, "login")} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-base">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-base">
                    Contraseña
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Iniciar Sesión
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={(e) => handleSubmit(e, "register")} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-base">
                    Nombre
                  </Label>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-base">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-base">
                    Contraseña
                  </Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="h-11"
                  />
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Crear Cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pb-6">
          <p className="text-xs text-center text-muted-foreground">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
