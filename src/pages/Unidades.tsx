import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MapPin, Phone, Settings, Edit } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Unidade {
  id: string
  nome: string
  endereco?: string
  telefone?: string
  ativo: boolean
  created_at: string
}

const Unidades = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: ""
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchUnidades()
  }, [user])

  const fetchUnidades = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUnidades(data || [])
    } catch (error) {
      console.error('Erro ao buscar unidades:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as unidades.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da unidade é obrigatório.",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingUnidade) {
        const { error } = await supabase
          .from('unidades')
          .update({
            nome: formData.nome,
            endereco: formData.endereco || null,
            telefone: formData.telefone || null,
          })
          .eq('id', editingUnidade.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Unidade atualizada com sucesso!",
        })
      } else {
        const { error } = await supabase
          .from('unidades')
          .insert([{
            nome: formData.nome,
            endereco: formData.endereco || null,
            telefone: formData.telefone || null,
            user_id: user?.id
          }])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Unidade criada com sucesso!",
        })
      }

      handleCloseDialog()
      fetchUnidades()
    } catch (error) {
      console.error('Erro ao salvar unidade:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a unidade.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (unidade: Unidade) => {
    setEditingUnidade(unidade)
    setFormData({
      nome: unidade.nome,
      endereco: unidade.endereco || "",
      telefone: unidade.telefone || ""
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUnidade(null)
    setFormData({
      nome: "",
      endereco: "",
      telefone: ""
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unidades</h1>
            <p className="text-muted-foreground">
              Gerencie suas unidades e estabelecimentos
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnidade ? "Editar Unidade" : "Nova Unidade"}
                </DialogTitle>
                <DialogDescription>
                  {editingUnidade 
                    ? "Atualize as informações da unidade."
                    : "Adicione uma nova unidade ao seu negócio."
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Unidade *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Barbearia Centro"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUnidade ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {unidades.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Nenhuma unidade encontrada</h3>
                  <p className="text-muted-foreground">
                    Comece criando sua primeira unidade
                  </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Unidade
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unidades.map((unidade) => (
              <Card key={unidade.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{unidade.nome}</CardTitle>
                      <div className="flex items-center mt-2">
                        <Badge variant={unidade.ativo ? "default" : "secondary"}>
                          {unidade.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(unidade)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unidade.endereco && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {unidade.endereco}
                      </div>
                    )}
                    {unidade.telefone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {unidade.telefone}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4">
                      Criada em {new Date(unidade.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Unidades