"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">C&A Grow</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus finanzas personales</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        <nav className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className={cn("font-medium", pathname === "/dashboard" && "bg-muted")}>
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/goals">
            <Button variant="ghost" className={cn("font-medium", pathname === "/dashboard/goals" && "bg-muted")}>
              Metas de Ahorro
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
