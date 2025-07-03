import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { FinanceiroOverview } from "@/components/financeiro/FinanceiroOverview"
import { AddMovimentacaoDialog } from "@/components/financeiro/AddMovimentacaoDialog"


const Financeiro = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas, despesas e comissões dos profissionais.
            </p>
          </div>
          <AddMovimentacaoDialog />
        </div>

        {/* Financeiro Overview */}
        <FinanceiroOverview />
      </div>
    </DashboardLayout>
  )
}

export default Financeiro