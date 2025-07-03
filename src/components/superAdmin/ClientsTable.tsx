import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit } from "lucide-react"
import type { SaasClient } from "@/types/superAdmin"
import { getStatusBadgeVariant, getPlanoBadgeVariant } from "@/utils/badgeVariants"

interface ClientsTableProps {
  clients: SaasClient[]
}

export const ClientsTable = ({ clients }: ClientsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes SaaS</CardTitle>
        <CardDescription>
          Gestão de todos os clientes do sistema BarberSmart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Unidades</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.nome}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <Badge variant={getPlanoBadgeVariant(client.plano)}>
                    {client.plano}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(client.status)}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>{client.limite_unidades}</TableCell>
                <TableCell>{client.limite_usuarios}</TableCell>
                <TableCell>
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}