import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { SetupFlow } from "@/components/dashboard/SetupFlow"
import { PWAInstaller } from "@/components/dashboard/PWAInstaller"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { NotificationTemplates } from "@/components/dashboard/NotificationTemplates"
import { PublicSchedulingInfo } from "@/components/dashboard/PublicSchedulingInfo"
import { PlanoInfo } from "@/components/dashboard/PlanoInfo"
import { LimitsWarning } from "@/components/dashboard/LimitsWarning"
import { useAuth } from "@/contexts/AuthContext"
import { useDashboardData } from "@/hooks/useDashboardData"

const Index = () => {
  const { isSuperAdmin } = useAuth()
  const { stats, hasUnidades, loading } = useDashboardData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Setup inicial para novos usuários
  if (!isSuperAdmin && !hasUnidades) {
    return <SetupFlow />
  }

  return (
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

      {/* Avisos de Limite */}
      <LimitsWarning />

      {/* PWA Installation & Plano Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PWAInstaller />
        <PlanoInfo />
        <QuickActions />
        <div className="md:col-span-1 lg:col-span-1">
          <NotificationTemplates />
        </div>
      </div>

      {/* Recent Activity & Public Scheduling */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <RecentAppointments />
          <PublicSchedulingInfo />
        </div>
        <div>
          <SetupFlow />
        </div>
      </div>
    </div>
  )
}

export default Index