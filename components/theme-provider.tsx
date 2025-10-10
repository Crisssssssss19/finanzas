"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type ThemeKey, type ThemeMode, themes } from "@/lib/themes"

interface ThemeContextType {
  theme: ThemeKey
  mode: ThemeMode
  setTheme: (theme: ThemeKey) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('petali-rosa')
  const [mode, setModeState] = useState<ThemeMode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('app-theme') as ThemeKey
    const savedMode = localStorage.getItem('app-mode') as ThemeMode
    
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    }
    
    if (savedMode) {
      setModeState(savedMode)
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setModeState(prefersDark ? 'dark' : 'light')
    }
    
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Aplicar tema
    const root = document.documentElement
    const colors = themes[theme][mode]

    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    // Agregar/quitar clase dark
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, mode, mounted])

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
  }

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem('app-mode', newMode)
  }

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return null // Evitar flash de contenido sin estilo
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}