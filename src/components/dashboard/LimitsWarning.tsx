import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usePlanos } from "@/hooks/usePlanos"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

interface Usage {
  unidades_usadas: number
  usuarios_usados: number
}

export const LimitsWarning = () => {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const { userProfile } = useAuth()
  const { planoAtual } = usePlanos()
  const navigate = useNavigate()

  useEffect(() => {
    if (userProfile?.saas_client_id && planoAtual) {
      fetchUsage()
    }
  }, [userProfile, planoAtual])

  const fetchUsage = async () => {
    if (!userProfile?.saas_client_id) return

    try {
      // Buscar unidades usadas
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id', { count: 'exact' })
        .eq('saas_client_id', userProfile.saas_client_id)
        .eq('ativo', true)

      // Buscar usuários usados  
      const { data: usuarios } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('saas_client_id', userProfile.saas_client_id)
        .eq('ativo', true)

      const currentUsage = {
        unidades_usadas: unidades?.length || 0,
        usuarios_usados: usuarios?.length || 0
      }

      setUsage(currentUsage)

      // Verificar se está próximo do limite (80% ou mais)
      const unidadesPorcentagem = planoAtual.limite_unidades === 999 ? 0 : 
        (currentUsage.unidades_usadas / planoAtual.limite_unidades) * 100
      const usuariosPorcentagem = planoAtual.limite_usuarios === 999 ? 0 :
        (currentUsage.usuarios_usados / planoAtual.limite_usuarios) * 100

      setShowWarning(unidadesPorcentagem >= 80 || usuariosPorcentagem >= 80)

    } catch (error) {
      console.error('Erro ao buscar uso:', error)
    }
  }

  if (!showWarning || !usage || !planoAtual) {
    return null
  }

  const getWarningMessage = () => {
    const warnings = []
    
    if (planoAtual.limite_unidades !== 999) {
      const unidadesPorcentagem = (usage.unidades_usadas / planoAtual.limite_unidades) * 100
      if (unidadesPorcentagem >= 80) {
        warnings.push(`Unidades: ${usage.unidades_usadas}/${planoAtual.limite_unidades} (${Math.round(unidadesPorcentagem)}%)`)
      }
    }
    
    if (planoAtual.limite_usuarios !== 999) {
      const usuariosPorcentagem = (usage.usuarios_usados / planoAtual.limite_usuarios) * 100
      if (usuariosPorcentagem >= 80) {
        warnings.push(`Usuários: ${usage.usuarios_usados}/${planoAtual.limite_usuarios} (${Math.round(usuariosPorcentagem)}%)`)
      }
    }
    
    return warnings.join(' • ')
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium text-yellow-800 mb-1">
            Você está próximo do limite do seu plano
          </p>
          <p className="text-sm text-yellow-700">
            {getWarningMessage()}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/planos')}
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          Fazer Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  )
}