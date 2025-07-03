import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useWaitlist, WaitlistEntry } from "@/hooks/useWaitlist"
import { useToast } from "@/hooks/use-toast"
import { Clock, Phone, User, ArrowUp, CheckCircle, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function WaitlistPanel() {
  const { waitlist, loading, addToWaitlist, updateWaitlistStatus, promoteFromWaitlist } = useWaitlist()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_email: '',
    servico_id: '',
    data_preferida: '',
    horario_preferido: '',
    prioridade: 'media' as const,
    observacoes: ''
  })

  const handleAddToWaitlist = async () => {
    if (!formData.cliente_nome || !formData.cliente_telefone || !formData.servico_id) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const result = await addToWaitlist({
      ...formData,
      unidade_id: 'current-unit-id', // TODO: Get from context
      status: 'aguardando'
    })

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Cliente adicionado à lista de espera",
      })
      setIsDialogOpen(false)
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        cliente_email: '',
        servico_id: '',
        data_preferida: '',
        horario_preferido: '',
        prioridade: 'media',
        observacoes: ''
      })
    } else {
      toast({
        title: "Erro",
        description: "Falha ao adicionar à lista de espera",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (id: string, status: WaitlistEntry['status']) => {
    const result = await updateWaitlistStatus(id, status)
    if (result.success) {
      toast({
        title: "Status atualizado",
        description: "Lista de espera atualizada com sucesso",
      })
    }
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baixa': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'default'
      case 'contatado': return 'secondary'
      case 'agendado': return 'default'
      case 'cancelado': return 'destructive'
      default: return 'default'
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Carregando lista de espera...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Lista de Espera ({waitlist.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Adicionar à Lista</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cliente_telefone">Telefone *</Label>
                <Input
                  id="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cliente_email">Email</Label>
                <Input
                  id="cliente_email"
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={(value: any) => setFormData({...formData, prioridade: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>
              <Button onClick={handleAddToWaitlist} className="w-full">
                Adicionar à Lista
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {waitlist.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cliente na lista de espera
            </p>
          ) : (
            waitlist.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{entry.cliente_nome}</span>
                    <Badge variant={getPriorityColor(entry.prioridade)} size="sm">
                      {entry.prioridade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {entry.cliente_telefone}
                    </span>
                    {entry.data_preferida && (
                      <span>
                        {format(new Date(entry.data_preferida), 'dd/MM', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(entry.status)} size="sm">
                    {entry.status}
                  </Badge>
                  {entry.status === 'aguardando' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(entry.id, 'contatado')}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(entry.id, 'agendado')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(entry.id, 'cancelado')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}