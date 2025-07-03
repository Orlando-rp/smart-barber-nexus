import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { FinanceiroOverview } from "@/components/financeiro/FinanceiroOverview"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

        {/* Financeiro Overview */}
        <FinanceiroOverview />
      </div>
    </DashboardLayout>
  )
}

export default Financeiro