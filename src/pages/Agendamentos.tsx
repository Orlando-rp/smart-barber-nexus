import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Plus, Filter } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Mock data - será substituído por dados reais do Supabase
const agendamentosData = [
  {
    id: "1",
    cliente: "João Silva",
    profissional: "Carlos",
    servico: "Corte + Barba",
    data_hora: new Date(2024, 6, 3, 10, 0),
    duracao: 60,
    preco: 45,
    status: "confirmado" as const,
  },
  {
    id: "2", 
    cliente: "Pedro Santos",
    profissional: "Miguel",
    servico: "Corte Tradicional",
    data_hora: new Date(2024, 6, 3, 10, 30),
    duracao: 30,
    preco: 25,
    status: "pendente" as const,
  },
  {
    id: "3",
    cliente: "Rafael Costa", 
    profissional: "Carlos",
    servico: "Barba",
    data_hora: new Date(2024, 6, 3, 11, 0),
    duracao: 30,
    preco: 20,
    status: "em_andamento" as const,
  },
  {
    id: "4",
    cliente: "André Lima",
    profissional: "Miguel", 
    servico: "Corte + Barba",
    data_hora: new Date(2024, 6, 3, 11, 30),
    duracao: 60,
    preco: 45,
    status: "concluido" as const,
  },
]

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, color: "text-yellow-600" },
  confirmado: { label: "Confirmado", variant: "default" as const, color: "text-blue-600" },
  em_andamento: { label: "Em Andamento", variant: "outline" as const, color: "text-orange-600" },
  concluido: { label: "Concluído", variant: "secondary" as const, color: "text-green-600" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "text-red-600" },
  faltou: { label: "Faltou", variant: "destructive" as const, color: "text-red-600" },
}

const Agendamentos = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  const agendamentosFiltrados = agendamentosData.filter(agendamento => {
    if (filterStatus === "todos") return true
    return agendamento.status === filterStatus
  })

  const totalAgendamentos = agendamentosData.length
  const agendamentosConfirmados = agendamentosData.filter(a => a.status === "confirmado").length
  const agendamentosPendentes = agendamentosData.filter(a => a.status === "pendente").length
  const receitaDia = agendamentosData
    .filter(a => a.status === "concluido")
    .reduce((total, a) => total + a.preco, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie os agendamentos de hoje - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total do Dia
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAgendamentos}</div>
              <p className="text-xs text-muted-foreground">agendamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmados
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{agendamentosConfirmados}</div>
              <p className="text-xs text-muted-foreground">prontos para atender</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{agendamentosPendentes}</div>
              <p className="text-xs text-muted-foreground">aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita do Dia
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {receitaDia.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">serviços concluídos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Agendamentos</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluídos</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agendamentosFiltrados.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-sm">
                        {agendamento.cliente.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{agendamento.cliente}</p>
                        <Badge 
                          variant={statusConfig[agendamento.status].variant}
                          className={statusConfig[agendamento.status].color}
                        >
                          {statusConfig[agendamento.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {agendamento.servico} • {agendamento.profissional}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agendamento.duracao} min • R$ {agendamento.preco.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-lg font-medium">
                      {format(agendamento.data_hora, "HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(agendamento.data_hora, "dd/MM")}
                    </p>
                  </div>
                </div>
              ))}

              {agendamentosFiltrados.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento encontrado para o filtro selecionado.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Agendamentos