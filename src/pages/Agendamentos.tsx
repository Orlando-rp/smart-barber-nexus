import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CalendarView } from "@/components/agendamentos/CalendarView"
import { AgendamentosFilters } from "@/components/agendamentos/AgendamentosFilters"
import { WaitlistPanel } from "@/components/agendamentos/WaitlistPanel"
import { NotificationTemplates } from "@/components/dashboard/NotificationTemplates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, List, Users, Plus, Clock, MessageCircle, Send } from "lucide-react"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates"

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
  cliente_nome?: string
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
  const { sendNotification } = useNotificationTemplates()
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState("calendar")
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
      
      // Real-time subscription
      const channel = supabase
        .channel('agendamentos-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'agendamentos'
          },
          () => {
            fetchData()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
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
      
      const processedAgendamentos = (agendamentosData || []).map(apt => ({
        ...apt,
        cliente_nome: apt.cliente_nome || apt.clientes?.nome
      }))
      
      setAgendamentos(processedAgendamentos)
      setAgendamentosFiltrados(processedAgendamentos)

      // Buscar outros dados
      const [clientesRes, profissionaisRes, servicosRes] = await Promise.all([
        supabase.from('clientes').select('id, nome').in('unidade_id', unidadeIds),
        supabase.from('profissionais').select('id, nome').in('unidade_id', unidadeIds).eq('ativo', true),
        supabase.from('servicos').select('id, nome, preco, duracao_minutos').in('unidade_id', unidadeIds).eq('ativo', true)
      ])

      setClientes(clientesRes.data || [])
      setProfissionais(profissionaisRes.data || [])
      setServicos(servicosRes.data || [])

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

  const handleFiltersChange = (filters: any) => {
    let filtered = [...agendamentos]

    // Filtro por busca (nome do cliente)
    if (filters.search) {
      filtered = filtered.filter(apt => 
        (apt.cliente_nome || apt.clientes?.nome || '').toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro por status
    if (filters.status !== 'todos') {
      filtered = filtered.filter(apt => apt.status === filters.status)
    }

    // Filtro por profissional
    if (filters.profissional !== 'todos') {
      filtered = filtered.filter(apt => apt.profissional_id === filters.profissional)
    }

    // Filtro por serviço
    if (filters.servico !== 'todos') {
      filtered = filtered.filter(apt => apt.servico_id === filters.servico)
    }

    // Filtro por período
    const now = new Date()
    switch (filters.periodo) {
      case 'hoje':
        const today = startOfDay(now)
        const endToday = endOfDay(now)
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.data_hora)
          return aptDate >= today && aptDate <= endToday
        })
        break
      case 'amanha':
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const startTomorrow = startOfDay(tomorrow)
        const endTomorrow = endOfDay(tomorrow)
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.data_hora)
          return aptDate >= startTomorrow && aptDate <= endTomorrow
        })
        break
      case 'esta_semana':
        const weekStart = startOfWeek(now, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.data_hora)
          return aptDate >= weekStart && aptDate <= weekEnd
        })
        break
      case 'este_mes':
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.data_hora)
          return aptDate >= monthStart && aptDate <= monthEnd
        })
        break
    }

    setAgendamentosFiltrados(filtered)
  }

  const handleCreateAgendamento = async () => {
    try {
      const servicoSelecionado = servicos.find(s => s.id === formData.servico_id)
      if (!servicoSelecionado) return

      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{
          ...formData,
          duracao_minutos: servicoSelecionado.duracao_minutos,
          preco: servicoSelecionado.preco,
          status: 'pendente'
        }])
        .select()

      if (error) throw error

      // Send notification
      if (data && data[0]) {
        await sendNotification(data[0].id, 'confirmacao')
      }

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

      // Send notification based on status
      let notificationType = ''
      switch (novoStatus) {
        case 'confirmado':
          notificationType = 'confirmacao'
          break
        case 'cancelado':
          notificationType = 'cancelamento'
          break
      }

      if (notificationType) {
        await sendNotification(agendamentoId, notificationType)
      }

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
              Gerencie seus agendamentos de forma eficiente
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
                Total
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
                Receita
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView
              agendamentos={agendamentos}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <AgendamentosFilters
              onFiltersChange={handleFiltersChange}
              profissionais={profissionais}
              servicos={servicos}
            />

            <Card>
              <CardHeader>
                <CardTitle>Lista de Agendamentos</CardTitle>
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
                            {(agendamento.cliente_nome || agendamento.clientes?.nome || 'CL').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{agendamento.cliente_nome || agendamento.clientes?.nome || 'Cliente'}</p>
                            <Badge 
                              variant={statusConfig[agendamento.status as keyof typeof statusConfig]?.variant || "outline"}
                              className={statusConfig[agendamento.status as keyof typeof statusConfig]?.color || ""}
                            >
                              {statusConfig[agendamento.status as keyof typeof statusConfig]?.label || agendamento.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {agendamento.servicos?.nome} • {agendamento.profissionais?.nome}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(agendamento.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} 
                            • R$ {agendamento.preco.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={agendamento.status}
                          onValueChange={(value) => handleUpdateStatus(agendamento.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
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
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendNotification(agendamento.id, 'lembrete')}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Agendamentos;
