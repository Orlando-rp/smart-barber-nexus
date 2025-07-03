import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ExternalLink, Copy, Check, Globe, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface ConfiguracaoAgendamento {
  id: string
  unidade_id: string
  permite_agendamento_publico: boolean
  slug_publico: string | null
  mensagem_boas_vindas: string | null
  antecedencia_minima_horas: number | null
}

export function PublicSchedulingInfo() {
  const { userProfile } = useAuth()
  const [configs, setConfigs] = useState<ConfiguracaoAgendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (userProfile) {
      fetchConfiguracoes()
    }
  }, [userProfile])

  const fetchConfiguracoes = async () => {
    try {
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id, nome')
        .eq('saas_client_id', userProfile?.saas_client_id)

      if (!unidades) return

      const { data: configuracoes } = await supabase
        .from('configuracoes_agendamento')
        .select('*')
        .in('unidade_id', unidades.map(u => u.id))

      if (configuracoes) {
        const configsComNomes = configuracoes.map(config => ({
          ...config,
          unidade_nome: unidades.find(u => u.id === config.unidade_id)?.nome || 'Unidade'
        }))
        setConfigs(configsComNomes as any)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (configId: string, updates: Partial<ConfiguracaoAgendamento>) => {
    try {
      const { error } = await supabase
        .from('configuracoes_agendamento')
        .update(updates)
        .eq('id', configId)

      if (error) throw error

      setConfigs(prev => 
        prev.map(config => 
          config.id === configId ? { ...config, ...updates } : config
        )
      )

      toast({
        title: "Configuração atualizada",
        description: "As alterações foram salvas com sucesso."
      })
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (text: string, configId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(configId)
      setTimeout(() => setCopied(''), 2000)
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência."
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      })
    }
  }

  const getPublicUrl = (slug: string) => {
    return `${window.location.origin}/agendar/${slug}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Agendamento Público
          </CardTitle>
          <CardDescription>
            Configure links públicos para seus clientes agendarem online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Agendamento Público
        </CardTitle>
        <CardDescription>
          Configure links públicos para seus clientes agendarem online
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {configs.map((config: any) => (
          <div key={config.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{config.unidade_nome}</h4>
              <Badge variant={config.permite_agendamento_publico ? "default" : "secondary"}>
                {config.permite_agendamento_publico ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`public-${config.id}`}
                  checked={config.permite_agendamento_publico}
                  onCheckedChange={(checked) => 
                    updateConfig(config.id, { permite_agendamento_publico: checked })
                  }
                />
                <Label htmlFor={`public-${config.id}`}>
                  Permitir agendamento público
                </Label>
              </div>

              {config.permite_agendamento_publico && config.slug_publico && (
                <div className="space-y-3">
                  <div>
                    <Label>Link público</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={getPublicUrl(config.slug_publico)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(getPublicUrl(config.slug_publico), config.id)}
                      >
                        {copied === config.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(getPublicUrl(config.slug_publico), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Mensagem de boas-vindas</Label>
                      <Input
                        value={config.mensagem_boas_vindas || ''}
                        onChange={(e) => 
                          updateConfig(config.id, { mensagem_boas_vindas: e.target.value })
                        }
                        placeholder="Bem-vindo! Selecione seu horário."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Antecedência mínima (horas)</Label>
                      <Input
                        type="number"
                        value={config.antecedencia_minima_horas || 2}
                        onChange={(e) => 
                          updateConfig(config.id, { antecedencia_minima_horas: Number(e.target.value) })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {configs.length === 0 && (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma configuração encontrada</h3>
            <p className="text-muted-foreground">
              Configure suas unidades primeiro para habilitar o agendamento público.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}