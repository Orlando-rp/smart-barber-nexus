import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Crown, Star, Zap, Calendar, Users, MapPin, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useNavigate } from "react-router-dom"

interface PlanoInfo {
  id: string
  nome: string
  plano: string
  plano_tipo?: string
  preco_mensal: number
  data_inicio_plano: string
  data_proxima_cobranca: string
  limite_unidades: number
  limite_usuarios: number
  historico_planos?: any
}

interface Usage {
  unidades_usadas: number
  usuarios_usados: number
}

const planIcons = {
  basico: Star,
  premium: Zap,
  enterprise: Crown
}

const planColors = {
  basico: "bg-blue-500",
  premium: "bg-purple-500", 
  enterprise: "bg-yellow-500"
}

const MeuPlano = () => {
  const [planoInfo, setPlanoInfo] = useState<PlanoInfo | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (userProfile?.saas_client_id) {
      fetchPlanoInfo()
      fetchUsage()
    }
  }, [userProfile])

  const fetchPlanoInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('saas_clients')
        .select('*')
        .eq('id', userProfile?.saas_client_id)
        .single()

      if (error) throw error
      setPlanoInfo(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar informações do plano",
        description: error.message
      })
    }
  }

  const fetchUsage = async () => {
    try {
      // Buscar unidades usadas
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id', { count: 'exact' })
        .eq('saas_client_id', userProfile?.saas_client_id)
        .eq('ativo', true)

      if (unidadesError) throw unidadesError

      // Buscar usuários usados
      const { data: usuarios, error: usuariosError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('saas_client_id', userProfile?.saas_client_id)
        .eq('ativo', true)

      if (usuariosError) throw usuariosError

      setUsage({
        unidades_usadas: unidades?.length || 0,
        usuarios_usados: usuarios?.length || 0
      })
    } catch (error: any) {
      console.error('Erro ao buscar uso:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanDisplayName = (plano: string) => {
    const names = {
      basico: 'Básico',
      premium: 'Premium', 
      enterprise: 'Enterprise'
    }
    return names[plano as keyof typeof names] || plano
  }

  const getUsagePercentage = (usado: number, limite: number) => {
    if (limite === 999) return 0 // Ilimitado
    return Math.min((usado / limite) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando informações do plano...</p>
        </div>
      </div>
    )
  }

  if (!planoInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Nenhum plano encontrado</p>
        <Button onClick={() => navigate('/planos')}>
          Ver Planos Disponíveis
        </Button>
      </div>
    )
  }

  const IconComponent = planIcons[planoInfo.plano as keyof typeof planIcons] || Star
  const colorClass = planColors[planoInfo.plano as keyof typeof planColors] || "bg-blue-500"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Plano</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e monitore o uso dos recursos
        </p>
      </div>

      {/* Informações do Plano Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${colorClass.replace('bg-', 'bg-opacity-20 bg-')}`}>
                <IconComponent className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Plano {getPlanDisplayName(planoInfo.plano)}
                </CardTitle>
                <CardDescription>
                  R$ {planoInfo.preco_mensal?.toFixed(2)}/mês
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Datas importantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Início do plano</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(planoInfo.data_inicio_plano), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Próxima cobrança</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(planoInfo.data_proxima_cobranca), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Uso dos recursos */}
          {usage && (
            <div className="space-y-4">
              <h3 className="font-semibold">Uso dos Recursos</h3>
              
              {/* Unidades */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Unidades</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.unidades_usadas}/{planoInfo.limite_unidades === 999 ? '∞' : planoInfo.limite_unidades}
                  </span>
                </div>
                {planoInfo.limite_unidades !== 999 && (
                  <Progress 
                    value={getUsagePercentage(usage.unidades_usadas, planoInfo.limite_unidades)} 
                    className="h-2"
                  />
                )}
              </div>

              {/* Usuários */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Usuários</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.usuarios_usados}/{planoInfo.limite_usuarios === 999 ? '∞' : planoInfo.limite_usuarios}
                  </span>
                </div>
                {planoInfo.limite_usuarios !== 999 && (
                  <Progress 
                    value={getUsagePercentage(usage.usuarios_usados, planoInfo.limite_usuarios)} 
                    className="h-2"
                  />
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => navigate('/planos')}
            >
              Alterar Plano
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('mailto:suporte@barbersmart.com', '_blank')}
            >
              Suporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Mudanças */}
      {planoInfo.historico_planos && Array.isArray(planoInfo.historico_planos) && planoInfo.historico_planos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Mudanças</CardTitle>
            <CardDescription>
              Suas alterações de plano anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(planoInfo.historico_planos as any[])?.slice(-5).reverse().map((mudanca, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">
                      {getPlanDisplayName(mudanca.plano_anterior)} → {getPlanDisplayName(mudanca.plano_novo)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(mudanca.data_mudanca), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    R$ {mudanca.preco_novo?.toFixed(2)}/mês
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MeuPlano