import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { SetupFlow } from "@/components/dashboard/SetupFlow"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { useAuth } from "@/contexts/AuthContext"
import { useDashboardData } from "@/hooks/useDashboardData"

const Index = () => {
  const { isSuperAdmin } = useAuth()
  const { stats, hasUnidades, loading } = useDashboardData()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Setup inicial para novos usuários
  if (!isSuperAdmin && !hasUnidades) {
    return (
      <DashboardLayout>
        <SetupFlow />
      </DashboardLayout>
    )
  }

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
        <DashboardStats stats={stats} />

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentAppointments />
          
          <div className="space-y-4">
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;