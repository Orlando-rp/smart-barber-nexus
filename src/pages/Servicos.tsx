import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Clock, DollarSign, Scissors, Building2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Servico {
  id: string
  nome: string
  descricao: string | null
  preco: number
  duracao_minutos: number
  categoria: string | null
  ativo: boolean
  unidade_id: string
}

interface Unidade {
  id: string
  nome: string
}

const categoriaConfig = {
  corte: { label: "Corte", variant: "default" },
  barba: { label: "Barba", variant: "secondary" },
  combo: { label: "Combo", variant: "outline" },
  estética: { label: "Estética", variant: "destructive" },
} as const

const Servicos = () => {
  const { userProfile, isSuperAdmin } = useAuth()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracao_minutos: "",
    categoria: "corte",
    unidade_id: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    if (userProfile && !isSuperAdmin) {
      fetchData()
    }
  }, [userProfile, isSuperAdmin])

  const fetchData = async () => {
    try {
      // Buscar unidades primeiro
      const { data: unidadesData, error: unidadesError } = await supabase
        .from('unidades')
        .select('id, nome')
        .eq('saas_client_id', userProfile?.saas_client_id)

      if (unidadesError) throw unidadesError
      setUnidades(unidadesData || [])

      // Se não há unidades, criar uma primeira
      if (!unidadesData || unidadesData.length === 0) {
        await createFirstUnidade()
        return
      }

      // Buscar serviços
      const unidadeIds = unidadesData.map(u => u.id)
      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('*')
        .in('unidade_id', unidadeIds)
        .order('created_at', { ascending: false })

      if (servicosError) throw servicosError
      setServicos(servicosData || [])

      // Definir unidade padrão no form se não estiver definida
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

  const createFirstUnidade = async () => {
    try {
      const { data: unidade, error } = await supabase
        .from('unidades')
        .insert({
          saas_client_id: userProfile?.saas_client_id,
          nome: userProfile?.nome || "Minha Barbearia",
          user_id: userProfile?.user_id
        })
        .select()
        .single()

      if (error) throw error

      setUnidades([unidade])
      setFormData(prev => ({ ...prev, unidade_id: unidade.id }))
      
      toast({
        title: "Unidade criada!",
        description: "Sua primeira unidade foi criada automaticamente."
      })
    } catch (error: any) {
      console.error('Error creating unidade:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar unidade inicial"
      })
    }
  }

  const handleSubmit = async () => {
    try {
      const preco = parseFloat(formData.preco)
      const duracao = parseInt(formData.duracao_minutos)

      if (!formData.nome || !formData.preco || !formData.duracao_minutos || !formData.unidade_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Preencha todos os campos obrigatórios"
        })
        return
      }

      if (isNaN(preco) || isNaN(duracao)) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Preço e duração devem ser números válidos"
        })
        return
      }

      const servicoData = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        preco,
        duracao_minutos: duracao,
        categoria: formData.categoria,
        unidade_id: formData.unidade_id
      }

      if (editingServico) {
        const { error } = await supabase
          .from('servicos')
          .update(servicoData)
          .eq('id', editingServico.id)

        if (error) throw error

        toast({
          title: "Serviço atualizado!",
          description: "Serviço atualizado com sucesso."
        })
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([servicoData])

        if (error) throw error

        toast({
          title: "Serviço criado!",
          description: "Novo serviço adicionado com sucesso."
        })
      }

      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Error saving servico:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar serviço"
      })
    }
  }

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico)
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao || "",
      preco: servico.preco.toString(),
      duracao_minutos: servico.duracao_minutos.toString(),
      categoria: servico.categoria || "corte",
      unidade_id: servico.unidade_id
    })
    setDialogOpen(true)
  }

  const handleToggleStatus = async (servico: Servico) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .update({ ativo: !servico.ativo })
        .eq('id', servico.id)

      if (error) throw error

      toast({
        title: "Status atualizado!",
        description: `Serviço ${servico.ativo ? 'desativado' : 'ativado'} com sucesso.`
      })

      fetchData()
    } catch (error: any) {
      console.error('Error toggling status:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao alterar status do serviço"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      duracao_minutos: "",
      categoria: "corte",
      unidade_id: unidades.length > 0 ? unidades[0].id : ""
    })
    setEditingServico(null)
    setDialogOpen(false)
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

  if (isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Área Super Admin</h1>
          <p className="text-muted-foreground">Esta funcionalidade é específica para clientes.</p>
        </div>
      </DashboardLayout>
    )
  }

  const totalServicos = servicos.length
  const servicosAtivos = servicos.filter(s => s.ativo).length
  const precoMedio = servicos.length > 0 ? servicos.reduce((total, s) => total + s.preco, 0) / servicos.length : 0
  const duracaoMedia = servicos.length > 0 ? servicos.reduce((total, s) => total + s.duracao_minutos, 0) / servicos.length : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie os serviços oferecidos pela barbearia
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingServico ? 'Atualize as informações do serviço.' : 'Adicione um novo serviço ao seu negócio.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Serviço</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Corte Masculino"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do serviço..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                      placeholder="35.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração (min)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      value={formData.duracao_minutos}
                      onChange={(e) => setFormData(prev => ({ ...prev, duracao_minutos: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corte">Corte</SelectItem>
                      <SelectItem value="barba">Barba</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                      <SelectItem value="estética">Estética</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {unidades.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select value={formData.unidade_id} onValueChange={(value) => setFormData(prev => ({ ...prev, unidade_id: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map((unidade) => (
                          <SelectItem key={unidade.id} value={unidade.id}>
                            {unidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingServico ? 'Atualizar' : 'Criar'} Serviço
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
                Total de Serviços
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServicos}</div>
              <p className="text-xs text-muted-foreground">cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Serviços Ativos
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{servicosAtivos}</div>
              <p className="text-xs text-muted-foreground">disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Preço Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {precoMedio.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">por serviço</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Duração Média
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(duracaoMedia)} min
              </div>
              <p className="text-xs text-muted-foreground">por atendimento</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Lista de Serviços
            </CardTitle>
            <CardDescription>
              Gerencie todos os serviços oferecidos pela sua barbearia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {servicos.length === 0 ? (
              <div className="text-center py-12">
                <Scissors className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum serviço cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando seu primeiro serviço
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Serviço
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicos.map((servico) => (
                    <TableRow key={servico.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{servico.nome}</div>
                          {servico.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {servico.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoriaConfig[servico.categoria as keyof typeof categoriaConfig]?.variant || "outline"}>
                          {categoriaConfig[servico.categoria as keyof typeof categoriaConfig]?.label || servico.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        R$ {servico.preco.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        {servico.duracao_minutos} min
                      </TableCell>
                      <TableCell>
                        <Badge variant={servico.ativo ? "default" : "secondary"}>
                          {servico.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(servico)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleStatus(servico)}
                          >
                            {servico.ativo ? (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            ) : (
                              <Plus className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Servicos