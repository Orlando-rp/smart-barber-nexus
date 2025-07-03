import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao BarberSmart. Aqui está um resumo do seu negócio hoje.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Agendamentos Hoje"
            value="12"
            description="3 pendentes de confirmação"
            icon={Calendar}
            trend={{ value: "20%", isPositive: true }}
          />
          <StatsCard
            title="Faturamento Mensal"
            value="R$ 8.420"
            description="Meta: R$ 10.000"
            icon={DollarSign}
            trend={{ value: "15%", isPositive: true }}
          />
          <StatsCard
            title="Clientes Ativos"
            value="348"
            description="12 novos este mês"
            icon={Users}
            trend={{ value: "3%", isPositive: true }}
          />
          <StatsCard
            title="Taxa de Ocupação"
            value="85%"
            description="Hoje: 10/12 horários"
            icon={TrendingUp}
            trend={{ value: "5%", isPositive: true }}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentAppointments />
          
          <div className="space-y-4">
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Ações Rápidas</h3>
              <p className="text-sm opacity-90 mb-4">
                Gerencie seu dia com eficiência
              </p>
              <div className="flex gap-2">
                <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm font-medium transition-colors">
                  Novo Agendamento
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm font-medium transition-colors">
                  Ver Agenda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
