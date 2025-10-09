import { GoalForm } from "@/components/goal-form"
import { GoalsList } from "@/components/goals-list"
import { DashboardHeader } from "@/components/dashboard-header"

export default function GoalsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h2>
            <p className="text-muted-foreground">Crea y sigue el progreso de tus objetivos financieros</p>
          </div>
          <GoalForm />
        </div>

        <GoalsList />
      </main>
    </div>
  )
}
