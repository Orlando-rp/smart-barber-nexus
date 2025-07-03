import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Configuracao {
  id: string
  antecedencia_minima_horas: number
  horario_limite_cancelamento: number
  max_reagendamentos: number
  permite_cancelamento: boolean
  permite_agendamento_publico: boolean
  cor_tema: string
  mensagem_boas_vindas: string
  slug_publico: string | null
  logo_url: string | null
  unidade_id: string
}

interface ConfiguracaoUpdate {
  antecedencia_minima_horas?: number
  horario_limite_cancelamento?: number
  max_reagendamentos?: number
  permite_cancelamento?: boolean
  permite_agendamento_publico?: boolean
  cor_tema?: string
  mensagem_boas_vindas?: string
  slug_publico?: string
  logo_url?: string
}

export const useConfiguracoes = () => {
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchConfiguracao = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Primeiro buscar as unidades do usuário
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (unidadesError) throw unidadesError

      if (!unidades || unidades.length === 0) {
        setConfiguracao(null)
        return
      }

      const unidadeId = unidades[0].id

      // Buscar configuração existente
      const { data: configExistente, error: configError } = await supabase
        .from('configuracoes_agendamento')
        .select('*')
        .eq('unidade_id', unidadeId)
        .single()

      if (configError && configError.code !== 'PGRST116') {
        throw configError
      }

      if (configExistente) {
        setConfiguracao(configExistente)
      } else {
        // Criar configuração padrão se não existir
        const { data: novaConfig, error: criarError } = await supabase
          .from('configuracoes_agendamento')
          .insert([{
            unidade_id: unidadeId,
            antecedencia_minima_horas: 2,
            horario_limite_cancelamento: 2,
            max_reagendamentos: 3,
            permite_cancelamento: true,
            permite_agendamento_publico: true,
            cor_tema: '#1a365d',
            mensagem_boas_vindas: 'Bem-vindo! Selecione seu horário.',
            slug_publico: null,
            logo_url: null,
          }])
          .select()
          .single()

        if (criarError) throw criarError
        setConfiguracao(novaConfig)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfiguracao = async (updates: ConfiguracaoUpdate) => {
    if (!configuracao) return

    try {
      const { data, error } = await supabase
        .from('configuracoes_agendamento')
        .update(updates)
        .eq('id', configuracao.id)
        .select()
        .single()

      if (error) throw error

      setConfiguracao(data)
      return data
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchConfiguracao()
  }, [user])

  return {
    configuracao,
    loading,
    updateConfiguracao,
    refetch: fetchConfiguracao,
  }
}