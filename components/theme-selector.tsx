"use client"

import { useTheme } from "./theme-provider"
import { themes } from "@/lib/themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSelector() {
  const { theme, mode, setTheme, toggleMode } = useTheme()

  return (
    <div className="flex items-center gap-2">
      {/* Selector de tema */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Seleccionar Tema</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(themes).map(([key, value]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key as any)}
              className={theme === key ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: value[mode].primary }}
                />
                {value.name}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toggle modo claro/oscuro */}
      <Button variant="outline" size="icon" onClick={toggleMode}>
        {mode === 'light' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}