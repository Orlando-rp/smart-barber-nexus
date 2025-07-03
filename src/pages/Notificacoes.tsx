import { useState } from "react"
import { Plus, Edit, Trash2, Mail, MessageSquare, Bell, Eye, EyeOff } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates"

const tiposNotificacao = [
  { value: 'confirmacao', label: 'Confirmação de agendamento' },
  { value: 'lembrete', label: 'Lembrete 24h antes' },
  { value: 'reagendamento', label: 'Reagendamento' },
  { value: 'cancelamento', label: 'Cancelamento' },
]

const canaisNotificacao = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
]

const Notificacoes = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [formData, setFormData] = useState({
    tipo: "",
    canal: "",
    template: "",
    ativo: true,
  })

  const {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    toggleTemplateStatus,
    deleteTemplate,
  } = useNotificationTemplates()

  const handleSubmit = async () => {
    try {
      const templateData = {
        tipo: formData.tipo,
        canal: formData.canal,
        template: formData.template,
        ativo: formData.ativo,
      }
      
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData)
      } else {
        await createTemplate(templateData)
      }
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar template:', error)
    }
  }

  const handleEdit = (template: any) => {
    setEditingTemplate(template)
    setFormData({
      tipo: template.tipo,
      canal: template.canal,
      template: template.template,
      ativo: template.ativo,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      tipo: "",
      canal: "",
      template: "",
      ativo: true,
    })
    setEditingTemplate(null)
    setDialogOpen(false)
  }

  const getIconForCanal = (canal: string) => {
    const canalInfo = canaisNotificacao.find(c => c.value === canal)
    const Icon = canalInfo?.icon || Bell
    return <Icon className="h-4 w-4" />
  }

  const getTipoLabel = (tipo: string) => {
    return tiposNotificacao.find(t => t.value === tipo)?.label || tipo
  }

  const getCanalLabel = (canal: string) => {
    return canaisNotificacao.find(c => c.value === canal)?.label || canal
  }

  const templatesAtivos = templates.filter(t => t.ativo).length
  const templatesPorCanal = canaisNotificacao.map(canal => ({
    ...canal,
    count: templates.filter(t => t.canal === canal.value).length
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
            <p className="text-muted-foreground">
              Configure templates de mensagens para comunicação automática com clientes.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? 'Atualize o template de notificação.'
                    : 'Crie um novo template de notificação para seus clientes.'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Notificação</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposNotificacao.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canal">Canal</Label>
                    <Select value={formData.canal} onValueChange={(value) => setFormData(prev => ({ ...prev, canal: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent>
                        {canaisNotificacao.map((canal) => (
                          <SelectItem key={canal.value} value={canal.value}>
                            <div className="flex items-center gap-2">
                              <canal.icon className="h-4 w-4" />
                              {canal.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Mensagem</Label>
                  <Textarea
                    id="template"
                    value={formData.template}
                    onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                    placeholder="Digite a mensagem do template..."
                    rows={6}
                  />
                  <div className="text-xs text-muted-foreground">
                    Use variáveis: {'{nome}'}, {'{servico}'}, {'{data}'}, {'{hora}'}, {'{preco}'}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Template ativo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTemplate ? 'Atualizar' : 'Criar'} Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Templates
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Templates Ativos
              </CardTitle>
              <Bell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{templatesAtivos}</div>
            </CardContent>
          </Card>

          {templatesPorCanal.slice(0, 2).map((canal) => (
            <Card key={canal.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {canal.label}
                </CardTitle>
                <canal.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{canal.count}</div>
                <p className="text-xs text-muted-foreground">templates</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de Notificação</CardTitle>
            <CardDescription>
              Gerencie os templates de mensagens para comunicação automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">Carregando...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum template configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie templates para automatizar a comunicação com seus clientes
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Template
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="font-medium">
                            {getTipoLabel(template.tipo)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getIconForCanal(template.canal)}
                            {getCanalLabel(template.canal)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {template.template}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.ativo ? "default" : "secondary"}>
                            {template.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTemplateStatus(template.id, !template.ativo)}
                            >
                              {template.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplate(template.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Notificacoes