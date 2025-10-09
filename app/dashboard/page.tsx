import { FinancialSummary } from "@/components/financial-summary"
import { ExpenseChart } from "@/components/expense-chart"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsList } from "@/components/transactions-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { SavingsAdvice } from "@/components/savings-advice"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Resumen de tu situación financiera</p>
          </div>
          <TransactionForm />
        </div>

        <FinancialSummary />

        <SavingsAdvice />

        <div className="grid gap-6 md:grid-cols-2">
          <ExpenseChart />
          <IncomeExpenseChart />
        </div>

        <TransactionsList />
      </main>
    </div>
  )
}
