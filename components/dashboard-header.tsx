"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeSelector } from "@/components/theme-selector"
import useSWR from "swr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UserData {
  user: {
    id: string
    email: string
    name: string
    picture?: string
  }
}

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { data, error } = useSWR<UserData>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Mostrar loading mientras carga
  if (!data && !error) {
    return (
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">C&A Grow</h1>
              <p className="text-sm text-muted-foreground">Gestiona tus finanzas personales</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector />
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="font-medium whitespace-nowrap">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/goals">
              <Button variant="ghost" className="font-medium whitespace-nowrap">
                Metas de Ahorro
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost" className="font-medium whitespace-nowrap">
                Historial
              </Button>
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">C&A Grow</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus finanzas personales</p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSelector />

            {data?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={data.user.picture} alt={data.user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(data.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{data.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{data.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className={cn(
                "font-medium whitespace-nowrap",
                pathname === "/dashboard" && "bg-muted shadow-sm"
              )}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/goals">
            <Button
              variant="ghost"
              className={cn(
                "font-medium whitespace-nowrap",
                pathname === "/dashboard/goals" && "bg-muted shadow-sm"
              )}
            >
              Metas de Ahorro
            </Button>
          </Link>
          <Link href="/dashboard/history">
            <Button
              variant="ghost"
              className={cn(
                "font-medium whitespace-nowrap",
                pathname === "/dashboard/history" && "bg-muted shadow-sm"
              )}
            >
              Historial
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}