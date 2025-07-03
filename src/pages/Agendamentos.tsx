import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAgendamentos } from "@/hooks/useAgendamentos"
import { CreateAgendamentoDialog } from "@/components/agendamentos/CreateAgendamentoDialog"
import { 
  Calendar, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Check,
  X,
  Clock,
  Filter
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusMap = {
  pendente: { label: "Pendente", variant: "secondary" as const, color: "text-yellow-600" },
  confirmado: { label: "Confirmado", variant: "default" as const, color: "text-blue-600" },
  concluido: { label: "Concluído", variant: "default" as const, color: "text-green-600" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "text-red-600" },
}

const Agendamentos = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState(null)
  const { agendamentos, loading, updateStatus } = useAgendamentos()

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchesSearch = 
      agendamento.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.profissionais?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.servicos?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "todos" || agendamento.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (agendamento: any) => {
    setSelectedAgendamento(agendamento)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedAgendamento(null)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateStatus(id, newStatus)
  }

  const getStatusStats = () => {
    const today = new Date()
    const todayStr = format(today, "yyyy-MM-dd")
    
    const todayAgendamentos = agendamentos.filter(a => 
      format(new Date(a.data_hora), "yyyy-MM-dd") === todayStr
    )
    
    return {
      total: agendamentos.length,
      hoje: todayAgendamentos.length,
      pendentes: agendamentos.filter(a => a.status === "pendente").length,
      confirmados: agendamentos.filter(a => a.status === "confirmado").length,
      concluidos: agendamentos.filter(a => a.status === "concluido").length,
    }
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando agendamentos...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os agendamentos e horários.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hoje
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hoje}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Confirmados
              </CardTitle>
              <Check className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Concluídos
              </CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.concluidos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, profissional ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgendamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm || statusFilter !== "todos" 
                            ? "Nenhum agendamento encontrado" 
                            : "Nenhum agendamento cadastrado"
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAgendamentos.map((agendamento) => (
                      <TableRow key={agendamento.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {agendamento.cliente_nome || agendamento.clientes?.nome || "Cliente não informado"}
                            </div>
                            {agendamento.cliente_telefone && (
                              <div className="text-sm text-muted-foreground">
                                {agendamento.cliente_telefone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{agendamento.servicos?.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {agendamento.duracao_minutos} min
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agendamento.profissionais?.nome}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {format(new Date(agendamento.data_hora), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(agendamento.data_hora), "HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusMap[agendamento.status as keyof typeof statusMap]?.variant}
                            className={statusMap[agendamento.status as keyof typeof statusMap]?.color}
                          >
                            {statusMap[agendamento.status as keyof typeof statusMap]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            R$ {agendamento.preco.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEdit(agendamento)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                              {agendamento.status !== "confirmado" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(agendamento.id, "confirmado")}
                                >
                                  <Check className="mr-2 h-4 w-4 text-blue-600" />
                                  Confirmar
                                </DropdownMenuItem>
                              )}
                              {agendamento.status !== "concluido" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(agendamento.id, "concluido")}
                                >
                                  <Check className="mr-2 h-4 w-4 text-green-600" />
                                  Concluir
                                </DropdownMenuItem>
                              )}
                              {agendamento.status !== "cancelado" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(agendamento.id, "cancelado")}
                                >
                                  <X className="mr-2 h-4 w-4 text-red-600" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog */}
        <CreateAgendamentoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          agendamento={selectedAgendamento}
          onClose={handleCloseDialog}
        />
      </div>
    </DashboardLayout>
  )
}

export default Agendamentos