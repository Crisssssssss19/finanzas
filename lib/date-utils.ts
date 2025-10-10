/**
 * Convierte una fecha ISO (YYYY-MM-DD) a un objeto Date sin conversión UTC
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param endOfDay - Si es true, establece la hora al final del día
 * @returns Date object
 */
export function parseLocalDate(dateString: string, endOfDay = false): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  
  if (endOfDay) {
    return new Date(year, month - 1, day, 23, 59, 59, 999)
  }
  
  // Mediodía para evitar problemas de zona horaria
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

/**
 * Formatea una fecha de MongoDB a YYYY-MM-DD para inputs HTML
 * @param date - Date object o string
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha local actual en formato YYYY-MM-DD
 * @returns String en formato YYYY-MM-DD
 */
export function getTodayLocal(): string {
  return formatDateForInput(new Date())
}