import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates"
import { useState } from "react"
import { Plus, MessageCircle, Edit, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const tiposTemplate = [
  { value: 'confirmacao', label: 'Confirmação de Agendamento' },
  { value: 'lembrete', label: 'Lembrete de Agendamento' },
  { value: 'cancelamento', label: 'Cancelamento de Agendamento' },
  { value: 'reagendamento', label: 'Reagendamento' }
]

export function NotificationTemplates() {
  const { templates, loading, createTemplate, updateTemplate } = useNotificationTemplates()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [formData, setFormData] = useState({
    tipo: '',
    canal: 'whatsapp',
    template: '',
    ativo: true,
    unidade_id: ''
  })

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData)
        toast({ title: "Template atualizado com sucesso!" })
      } else {
        await createTemplate(formData)
        toast({ title: "Template criado com sucesso!" })
      }
      
      setDialogOpen(false)
      setEditingTemplate(null)
      setFormData({ tipo: '', canal: 'whatsapp', template: '', ativo: true, unidade_id: '' })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar template"
      })
    }
  }

  const handleEdit = (template: any) => {
    setEditingTemplate(template)
    setFormData({
      tipo: template.tipo,
      canal: template.canal,
      template: template.template,
      ativo: template.ativo,
      unidade_id: template.unidade_id
    })
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Templates de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Templates de Notificação
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Template' : 'Novo Template de Notificação'}
                </DialogTitle>
                <DialogDescription>
                  Configure mensagens automáticas para diferentes situações.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Notificação</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposTemplate.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select value={formData.canal} onValueChange={(value) => setFormData(prev => ({ ...prev, canal: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Template da Mensagem</Label>
                  <Textarea
                    value={formData.template}
                    onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                    placeholder="Digite o template da mensagem..."
                    rows={6}
                  />
                  <div className="text-xs text-muted-foreground">
                    Variáveis disponíveis: {'{'}{'{'} cliente_nome {'}'}{'}'},  {'{'}{'{'} profissional_nome {'}'}{'}'},  {'{'}{'{'} servico_nome {'}'}{'}'},  {'{'}{'{'} data_hora {'}'}{'}'},  {'{'}{'{'} unidade_nome {'}'}{'}'},  {'{'}{'{'} link_agendamento {'}'}{'}'} 
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTemplate ? 'Atualizar' : 'Criar'} Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum template configurado</p>
              <p className="text-sm text-muted-foreground">Crie templates para automatizar as notificações</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">
                      {tiposTemplate.find(t => t.value === template.tipo)?.label || template.tipo}
                    </h3>
                    <Badge variant={template.ativo ? "default" : "secondary"}>
                      {template.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{template.canal}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.template}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
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