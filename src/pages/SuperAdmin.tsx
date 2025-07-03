import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Users, Calendar, DollarSign, Plus, Eye, Edit, Crown } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

interface SaasClient {
  id: string
  nome: string
  email: string
  telefone: string | null
  plano: string
  status: string
  data_vencimento: string | null
  limite_unidades: number
  limite_usuarios: number
  created_at: string
}

const SuperAdmin = () => {
  const [clients, setClients] = useState<SaasClient[]>([])
  const [loading, setLoading] = useState(true)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    nome: "",
    email: "",
    telefone: "",
    plano: "basico",
    limite_unidades: 1,
    limite_usuarios: 5
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('saas_clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar clientes SaaS"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async () => {
    try {
      const { error } = await supabase
        .from('saas_clients')
        .insert([newClient])

      if (error) throw error

      toast({
        title: "Cliente criado!",
        description: "Cliente SaaS criado com sucesso."
      })

      setNewClientOpen(false)
      setNewClient({
        nome: "",
        email: "",
        telefone: "",
        plano: "basico",
        limite_unidades: 1,
        limite_usuarios: 5
      })
      fetchClients()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar cliente SaaS"
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'default'
      case 'suspenso': return 'secondary'
      case 'cancelado': return 'destructive'
      default: return 'outline'
    }
  }

  const getPlanoBadgeVariant = (plano: string) => {
    switch (plano) {
      case 'basico': return 'outline'
      case 'premium': return 'default'
      case 'enterprise': return 'secondary'
      default: return 'outline'
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
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
          
          <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Cliente SaaS</DialogTitle>
                <DialogDescription>
                  Adicione um novo cliente (barbearia) ao sistema.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Barbearia</Label>
                  <Input
                    id="nome"
                    value={newClient.nome}
                    onChange={(e) => setNewClient(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Barbearia do João"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@barbearia.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={newClient.telefone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plano">Plano</Label>
                  <Select 
                    value={newClient.plano} 
                    onValueChange={(value) => setNewClient(prev => ({ ...prev, plano: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limite_unidades">Limite de Unidades</Label>
                    <Input
                      id="limite_unidades"
                      type="number"
                      value={newClient.limite_unidades}
                      onChange={(e) => setNewClient(prev => ({ ...prev, limite_unidades: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="limite_usuarios">Limite de Usuários</Label>
                    <Input
                      id="limite_usuarios"
                      type="number"
                      value={newClient.limite_usuarios}
                      onChange={(e) => setNewClient(prev => ({ ...prev, limite_usuarios: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewClientOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateClient}>
                  Criar Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Clientes
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                Clientes SaaS ativos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.status === 'ativo').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Em operação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planos Premium
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.plano !== 'basico').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Premium & Enterprise
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Unidades
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, c) => sum + c.limite_unidades, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Capacidade total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
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
      </div>
    </DashboardLayout>
  )
}

export default SuperAdmin