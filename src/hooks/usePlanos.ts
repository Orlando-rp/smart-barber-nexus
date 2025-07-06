import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Plano {
  id: string
  nome: string
  preco: number
  limite_unidades: number
  limite_usuarios: number
  recursos: string[]
}

export interface PlanoAtual {
  plano: string
  preco_mensal: number
  limite_unidades: number
  limite_usuarios: number
  data_proxima_cobranca: string
}

export const usePlanos = () => {
  const [planoAtual, setPlanoAtual] = useState<PlanoAtual | null>(null)
  const [loading, setLoading] = useState(false)
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const planos: Plano[] = [
    {
      id: 'basico',
      nome: 'Básico',
      preco: 49.90,
      limite_unidades: 1,
      limite_usuarios: 3,
      recursos: [
        '1 unidade',
        'Até 3 barbeiros',
        'Agendamentos ilimitados',
        'Relatórios básicos',
        'Suporte por email'
      ]
    },
    {
      id: 'premium',
      nome: 'Premium',
      preco: 99.90,
      limite_unidades: 3,
      limite_usuarios: 10,
      recursos: [
        'Até 3 unidades',
        'Até 10 barbeiros',
        'Analytics avançados',
        'Notificações WhatsApp/SMS',
        'API básica',
        'Suporte prioritário'
      ]
    },
    {
      id: 'enterprise',
      nome: 'Enterprise',
      preco: 199.90,
      limite_unidades: 999,
      limite_usuarios: 999,
      recursos: [
        'Unidades ilimitadas',
        'Barbeiros ilimitados',
        'API completa',
        'Customizações avançadas',
        'Multi-tenancy',
        'Suporte 24/7'
      ]
    }
  ]

  useEffect(() => {
    if (userProfile?.saas_client_id) {
      fetchPlanoAtual()
    }
  }, [userProfile])

  const fetchPlanoAtual = async () => {
    if (!userProfile?.saas_client_id) return

    try {
      const { data, error } = await supabase
        .from('saas_clients')
        .select('plano, preco_mensal, limite_unidades, limite_usuarios, data_proxima_cobranca')
        .eq('id', userProfile.saas_client_id)
        .single()

      if (error) throw error
      setPlanoAtual(data)
    } catch (error: any) {
      console.error('Erro ao buscar plano atual:', error)
    }
  }

  const atualizarPlano = async (novoPlanoId: string) => {
    if (!userProfile?.saas_client_id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Cliente SaaS não encontrado"
      })
      return false
    }

    const novoPlano = planos.find(p => p.id === novoPlanoId)
    if (!novoPlano) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Plano não encontrado"
      })
      return false
    }

    setLoading(true)
    try {
      const { error } = await supabase.rpc('update_client_plan', {
        _saas_client_id: userProfile.saas_client_id,
        _new_plan: novoPlanoId,
        _new_price: novoPlano.preco
      })

      if (error) throw error

      toast({
        title: "Plano atualizado!",
        description: `Seu plano foi alterado para ${novoPlano.nome}`
      })

      // Recarregar dados
      await fetchPlanoAtual()
      return true

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar plano",
        description: error.message
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const verificarLimite = async (tipo: 'unidades' | 'usuarios') => {
    if (!userProfile?.saas_client_id) return false

    try {
      const { data, error } = await supabase.rpc('check_plan_limits', {
        _saas_client_id: userProfile.saas_client_id,
        _resource_type: tipo
      })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Erro ao verificar limite:', error)
      return false
    }
  }

  return {
    planos,
    planoAtual,
    loading,
    atualizarPlano,
    verificarLimite,
    refetch: fetchPlanoAtual
  }
}