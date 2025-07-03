import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useConfiguracoes } from "@/hooks/useConfiguracoes"
import { Save, Settings, Palette, Globe, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Configuracoes = () => {
  const { configuracao, loading, updateConfiguracao } = useConfiguracoes()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    antecedencia_minima_horas: configuracao?.antecedencia_minima_horas || 2,
    horario_limite_cancelamento: configuracao?.horario_limite_cancelamento || 2,
    max_reagendamentos: configuracao?.max_reagendamentos || 3,
    permite_cancelamento: configuracao?.permite_cancelamento ?? true,
    permite_agendamento_publico: configuracao?.permite_agendamento_publico ?? true,
    cor_tema: configuracao?.cor_tema || '#1a365d',
    mensagem_boas_vindas: configuracao?.mensagem_boas_vindas || 'Bem-vindo! Selecione seu horário.',
    slug_publico: configuracao?.slug_publico || '',
    logo_url: configuracao?.logo_url || '',
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateConfiguracao(formData)
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Configure seu sistema de agendamento e personalização.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações de Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Agendamento
              </CardTitle>
              <CardDescription>
                Configure regras e limitações para agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="antecedencia_minima">Antecedência Mínima (horas)</Label>
                  <Input
                    id="antecedencia_minima"
                    type="number"
                    min="0"
                    value={formData.antecedencia_minima_horas}
                    onChange={(e) => handleInputChange('antecedencia_minima_horas', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limite_cancelamento">Limite para Cancelamento (horas)</Label>
                  <Input
                    id="limite_cancelamento"
                    type="number"
                    min="0"
                    value={formData.horario_limite_cancelamento}
                    onChange={(e) => handleInputChange('horario_limite_cancelamento', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_reagendamentos">Máximo de Reagendamentos</Label>
                  <Input
                    id="max_reagendamentos"
                    type="number"
                    min="0"
                    value={formData.max_reagendamentos}
                    onChange={(e) => handleInputChange('max_reagendamentos', Number(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Cancelamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Clientes podem cancelar agendamentos
                    </p>
                  </div>
                  <Switch
                    checked={formData.permite_cancelamento}
                    onCheckedChange={(checked) => handleInputChange('permite_cancelamento', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agendamento Público</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir agendamentos através do link público
                    </p>
                  </div>
                  <Switch
                    checked={formData.permite_agendamento_publico}
                    onCheckedChange={(checked) => handleInputChange('permite_agendamento_publico', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do seu sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cor_tema">Cor do Tema</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor_tema"
                      type="color"
                      value={formData.cor_tema}
                      onChange={(e) => handleInputChange('cor_tema', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={formData.cor_tema}
                      onChange={(e) => handleInputChange('cor_tema', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem_boas_vindas">Mensagem de Boas-vindas</Label>
                <Textarea
                  id="mensagem_boas_vindas"
                  placeholder="Mensagem exibida na página de agendamento público"
                  value={formData.mensagem_boas_vindas}
                  onChange={(e) => handleInputChange('mensagem_boas_vindas', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Públicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Agendamento Público
              </CardTitle>
              <CardDescription>
                Configure o link público para agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug_publico">Slug Público</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    /agendar/
                  </span>
                  <Input
                    id="slug_publico"
                    placeholder="minha-barbearia"
                    value={formData.slug_publico}
                    onChange={(e) => handleInputChange('slug_publico', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Link público: {window.location.origin}/agendar/{formData.slug_publico || 'seu-slug'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default Configuracoes