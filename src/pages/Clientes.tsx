import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, Plus, Search, Phone, Mail } from "lucide-react"

// Mock data - será substituído por dados reais do Supabase
const clientesData = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    ultima_visita: new Date(2024, 6, 1),
    total_visitas: 12,
  },
  {
    id: "2", 
    nome: "Pedro Santos",
    telefone: "(11) 88888-8888",
    email: "pedro@email.com",
    ultima_visita: new Date(2024, 5, 28),
    total_visitas: 8,
  },
  {
    id: "3",
    nome: "Rafael Costa",
    telefone: "(11) 77777-7777", 
    email: "rafael@email.com",
    ultima_visita: new Date(2024, 6, 2),
    total_visitas: 5,
  },
  {
    id: "4",
    nome: "André Lima",
    telefone: "(11) 66666-6666",
    email: "andre@email.com", 
    ultima_visita: new Date(2024, 5, 30),
    total_visitas: 15,
  },
]

const Clientes = () => {
  const totalClientes = clientesData.length
  const clientesAtivos = clientesData.filter(c => {
    const ultimaVisita = new Date(c.ultima_visita)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
    return ultimaVisita >= trintaDiasAtras
  }).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie sua base de clientes e histórico de atendimentos
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <p className="text-xs text-muted-foreground">cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{clientesAtivos}</div>
              <p className="text-xs text-muted-foreground">últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Retenção
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((clientesAtivos / totalClientes) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">clientes ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  className="pl-9 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientesData.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-sm">
                        {cliente.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{cliente.nome}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {cliente.telefone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {cliente.email}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cliente.total_visitas} visitas • Última: {cliente.ultima_visita.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Button variant="outline" size="sm">
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Clientes