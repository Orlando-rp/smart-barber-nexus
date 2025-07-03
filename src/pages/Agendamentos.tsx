import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Plus, Filter, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Agendamento {
  id: string
  cliente_id: string
  profissional_id: string
  servico_id: string
  data_hora: string
  duracao_minutos: number
  preco: number
  status: string
  observacoes?: string
  clientes: { nome: string }
  profissionais: { nome: string }
  servicos: { nome: string; preco: number }
}

interface Cliente {
  id: string
  nome: string
}

interface Profissional {
  id: string
  nome: string
}

interface Servico {
  id: string
  nome: string
  preco: number
  duracao_minutos: number
}

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, color: "text-yellow-600" },
  confirmado: { label: "Confirmado", variant: "default" as const, color: "text-blue-600" },
  em_andamento: { label: "Em Andamento", variant: "outline" as const, color: "text-orange-600" },
  concluido: { label: "Concluído", variant: "secondary" as const, color: "text-green-600" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "text-red-600" },
  faltou: { label: "Faltou", variant: "destructive" as const, color: "text-red-600" },
}

const Agendamentos = () => {
  const { userProfile, isSuperAdmin } = useAuth()
  const { toast } = useToast()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [newAgendamentoOpen, setNewAgendamentoOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null)
  const [formData, setFormData] = useState({
    cliente_id: "",
    profissional_id: "",
    servico_id: "",
    data_hora: "",
    observacoes: "",
    unidade_id: ""
  })

  useEffect(() => {
    if (userProfile) {
      fetchData()
    }
  }, [userProfile])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Buscar unidades primeiro
      let unidadesQuery = supabase.from('unidades').select('*')
      if (!isSuperAdmin && userProfile?.saas_client_id) {
        unidadesQuery = unidadesQuery.eq('saas_client_id', userProfile.saas_client_id)
      }
      const { data: unidadesData, error: unidadesError } = await unidadesQuery
      if (unidadesError) throw unidadesError
      setUnidades(unidadesData || [])

      if (!unidadesData || unidadesData.length === 0) {
        setLoading(false)
        return
      }

      const unidadeIds = unidadesData.map(u => u.id)

      // Buscar agendamentos com dados relacionados
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clientes (nome),
          profissionais (nome),
          servicos (nome, preco)
        `)
        .in('unidade_id', unidadeIds)
        .order('data_hora', { ascending: true })

      if (agendamentosError) throw agendamentosError
      setAgendamentos(agendamentosData || [])

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .in('unidade_id', unidadeIds)

      if (clientesError) throw clientesError
      setClientes(clientesData || [])

      // Buscar profissionais
      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from('profissionais')
        .select('id, nome')
        .in('unidade_id', unidadeIds)
        .eq('ativo', true)

      if (profissionaisError) throw profissionaisError
      setProfissionais(profissionaisData || [])

      // Buscar serviços
      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('id, nome, preco, duracao_minutos')
        .in('unidade_id', unidadeIds)
        .eq('ativo', true)

      if (servicosError) throw servicosError
      setServicos(servicosData || [])

      // Definir unidade padrão no form
      if (unidadesData.length > 0 && !formData.unidade_id) {
        setFormData(prev => ({ ...prev, unidade_id: unidadesData[0].id }))
      }

    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgendamento = async () => {
    try {
      const servicoSelecionado = servicos.find(s => s.id === formData.servico_id)
      if (!servicoSelecionado) return

      const { error } = await supabase
        .from('agendamentos')
        .insert([{
          ...formData,
          duracao_minutos: servicoSelecionado.duracao_minutos,
          preco: servicoSelecionado.preco,
          status: 'pendente'
        }])

      if (error) throw error

      toast({
        title: "Agendamento criado!",
        description: "Agendamento criado com sucesso."
      })

      setNewAgendamentoOpen(false)
      setFormData({
        cliente_id: "",
        profissional_id: "",
        servico_id: "",
        data_hora: "",
        observacoes: "",
        unidade_id: formData.unidade_id
      })
      fetchData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar agendamento"
      })
    }
  }

  const handleUpdateStatus = async (agendamentoId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId)

      if (error) throw error

      toast({
        title: "Status atualizado!",
        description: "Status do agendamento atualizado com sucesso."
      })

      fetchData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar status"
      })
    }
  }

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

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    if (filterStatus === "todos") return true
    return agendamento.status === filterStatus
  })

  const totalAgendamentos = agendamentos.length
  const agendamentosConfirmados = agendamentos.filter(a => a.status === "confirmado").length
  const agendamentosPendentes = agendamentos.filter(a => a.status === "pendente").length
  const receitaDia = agendamentos
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
          
          <Dialog open={newAgendamentoOpen} onOpenChange={setNewAgendamentoOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Criar um novo agendamento para a barbearia.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profissional">Profissional</Label>
                  <Select value={formData.profissional_id} onValueChange={(value) => setFormData(prev => ({ ...prev, profissional_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {profissionais.map((profissional) => (
                        <SelectItem key={profissional.id} value={profissional.id}>
                          {profissional.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servico">Serviço</Label>
                  <Select value={formData.servico_id} onValueChange={(value) => setFormData(prev => ({ ...prev, servico_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicos.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id}>
                          {servico.nome} - R$ {servico.preco.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_hora">Data e Hora</Label>
                  <Input
                    id="data_hora"
                    type="datetime-local"
                    value={formData.data_hora}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_hora: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre o agendamento..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewAgendamentoOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAgendamento}>
                  Criar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                        {agendamento.clientes?.nome?.split(' ').map(n => n[0]).join('') || 'CL'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{agendamento.clientes?.nome || 'Cliente'}</p>
                        <Badge 
                          variant={statusConfig[agendamento.status as keyof typeof statusConfig]?.variant || "outline"}
                          className={statusConfig[agendamento.status as keyof typeof statusConfig]?.color || ""}
                        >
                          {statusConfig[agendamento.status as keyof typeof statusConfig]?.label || agendamento.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {agendamento.servicos?.nome || 'Serviço'} • {agendamento.profissionais?.nome || 'Profissional'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agendamento.duracao_minutos} min • R$ {agendamento.preco.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <p className="font-mono text-lg font-medium">
                        {format(new Date(agendamento.data_hora), "HH:mm")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(agendamento.data_hora), "dd/MM")}
                      </p>
                    </div>
                    
                    <Select 
                      value={agendamento.status} 
                      onValueChange={(value) => handleUpdateStatus(agendamento.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="faltou">Faltou</SelectItem>
                      </SelectContent>
                    </Select>
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