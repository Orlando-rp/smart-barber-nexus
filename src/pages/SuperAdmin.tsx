import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout"
import { SuperAdminHeader } from "@/components/superAdmin/SuperAdminHeader"
import { SuperAdminStats } from "@/components/superAdmin/SuperAdminStats"
import { ClientsTable } from "@/components/superAdmin/ClientsTable"
import { useSuperAdminData } from "@/hooks/useSuperAdminData"

const SuperAdmin = () => {
  const { clients, loading, createClient } = useSuperAdminData()

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </SuperAdminLayout>
    )
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <SuperAdminHeader onCreateClient={createClient} />
        <SuperAdminStats clients={clients} />
        <ClientsTable clients={clients} />
      </div>
    </SuperAdminLayout>
  )
}

export default SuperAdmin