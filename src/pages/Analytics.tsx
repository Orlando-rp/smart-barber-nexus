import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AnalyticsReports } from "@/components/dashboard/AnalyticsReports"

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu negócio com relatórios detalhados
          </p>
        </div>
        
        <AnalyticsReports />
      </div>
    </DashboardLayout>
  )
}

export default Analytics