import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Star, Zap, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usePlanos } from "@/hooks/usePlanos"
import { useNavigate } from "react-router-dom"

const planIcons = {
  basico: Star,
  premium: Zap,
  enterprise: Crown
}

const planColors = {
  basico: "text-blue-600",
  premium: "text-purple-600", 
  enterprise: "text-yellow-600"
}

export const PlanoInfo = () => {
  const { userProfile } = useAuth()
  const { planoAtual } = usePlanos()
  const navigate = useNavigate()

  if (!planoAtual || !userProfile?.saas_client_id) {
    return null
  }

  const IconComponent = planIcons[planoAtual.plano as keyof typeof planIcons] || Star
  const colorClass = planColors[planoAtual.plano as keyof typeof planColors] || "text-blue-600"
  
  const getPlanDisplayName = (plano: string) => {
    const names = {
      basico: 'Básico',
      premium: 'Premium', 
      enterprise: 'Enterprise'
    }
    return names[plano as keyof typeof names] || plano
  }

  // Verificar se está próximo do vencimento (menos de 7 dias)
  const diasParaVencimento = Math.ceil(
    (new Date(planoAtual.data_proxima_cobranca).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const proximoVencimento = diasParaVencimento <= 7

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
        <IconComponent className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold">
                {getPlanDisplayName(planoAtual.plano)}
              </span>
              <Badge variant="secondary" className="text-xs">
                Ativo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {planoAtual.preco_mensal?.toFixed(2)}/mês
            </p>
            {proximoVencimento && (
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-600">
                  Vence em {diasParaVencimento} {diasParaVencimento === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/meu-plano')}
          >
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}