import { StatsCard } from "@/components/dashboard/StatsCard"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"

interface DashboardStats {
  agendamentosHoje: number
  faturamentoMensal: number
  clientesAtivos: number
  taxaOcupacao: number
}

interface DashboardStatsProps {
  stats: DashboardStats
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Agendamentos Hoje"
        value={stats.agendamentosHoje.toString()}
        description={`${Math.floor(stats.agendamentosHoje * 0.25)} pendentes de confirmação`}
        icon={Calendar}
        trend={{ value: "20%", isPositive: true }}
      />
      <StatsCard
        title="Faturamento Mensal"
        value={`R$ ${stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="Meta: R$ 10.000"
        icon={DollarSign}
        trend={{ value: "15%", isPositive: true }}
      />
      <StatsCard
        title="Clientes Ativos"
        value={stats.clientesAtivos.toString()}
        description={`${Math.floor(stats.clientesAtivos * 0.1)} novos este mês`}
        icon={Users}
        trend={{ value: "3%", isPositive: true }}
      />
      <StatsCard
        title="Taxa de Ocupação"
        value={`${stats.taxaOcupacao}%`}
        description={`Hoje: ${Math.floor(stats.agendamentosHoje * 0.8)}/${stats.agendamentosHoje} horários`}
        icon={TrendingUp}
        trend={{ value: "5%", isPositive: true }}
      />
    </div>
  )
}