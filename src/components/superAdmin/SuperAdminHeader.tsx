import { Crown } from "lucide-react"
import { CreateClientDialog } from "./CreateClientDialog"
import type { NewClientData } from "@/types/superAdmin"

interface SuperAdminHeaderProps {
  onCreateClient: (data: NewClientData) => Promise<boolean>
}

export const SuperAdminHeader = ({ onCreateClient }: SuperAdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
          <p className="text-muted-foreground">
            Gestão de clientes SaaS do BarberSmart
          </p>
        </div>
      </div>
      
      <CreateClientDialog onCreateClient={onCreateClient} />
    </div>
  )
}