  import { getSession } from "@/lib/auth"
  import { isMongoDBConfigured } from "@/lib/mongodb"
  import { AuthForm } from "@/components/auth-form"
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
  import { AlertCircle } from "lucide-react"
  import { redirect } from "next/navigation"

  export default async function HomePage() {
    if (!isMongoDBConfigured()) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración Requerida</AlertTitle>
              <AlertDescription>
                Por favor configura la variable de entorno <code className="font-mono">MONGODB_URI</code> en la sección
                Vars del sidebar para comenzar a usar la aplicación.
              </AlertDescription>
            </Alert>
            <AuthForm />
          </div>
        </div>
      )
    }

    const session = await getSession()

    if (session) {
      redirect("/dashboard")
    }

    return <AuthForm />
  }
