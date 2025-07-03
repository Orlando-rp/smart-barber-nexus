import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AgendamentoToken, DisponibilidadeSlot } from '@/types/agendamento'
import { useToast } from '@/hooks/use-toast'

export const useAgendamentoToken = (token?: string) => {
  const [agendamento, setAgendamento] = useState<AgendamentoToken | null>(null)
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Buscar agendamento por token
  useEffect(() => {
    if (!token) return

    const fetchAgendamento = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-agendamento-by-token', {
          body: { token }
        })

        if (error) throw error
        
        if (data) {
          setAgendamento(data)
        }
      } catch (error) {
        console.error('Erro ao buscar agendamento:', error)
        toast({
          title: "Erro",
          description: "Agendamento não encontrado ou link inválido",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAgendamento()
  }, [token, toast])

  // Buscar disponibilidade para reagendamento
  const fetchDisponibilidade = async (data: string) => {
    if (!agendamento) return

    setLoadingDisponibilidade(true)
    try {
      const { data: availability, error } = await supabase.functions.invoke('check-availability', {
        body: {
          unidade_id: agendamento.agendamento.unidade_id,
          profissional_id: agendamento.agendamento.profissional_id,
          servico_id: agendamento.agendamento.servico_id,
          data: data,
          exclude_agendamento_id: agendamento.agendamento.id
        }
      })

      if (error) throw error
      setDisponibilidade(availability?.slots || [])
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
      toast({
        title: "Erro",
        description: "Erro ao verificar disponibilidade",
        variant: "destructive"
      })
    } finally {
      setLoadingDisponibilidade(false)
    }
  }

  // Reagendar
  const reagendar = async (novaDataHora: string) => {
    if (!agendamento || !agendamento.pode_reagendar) return

    setSubmitting(true)
    try {
      // Verificar limite de reagendamentos
      if (agendamento.agendamento.reagendamentos_count && 
          agendamento.agendamento.reagendamentos_count >= agendamento.agendamento.unidade.configuracao?.max_reagendamentos!) {
        throw new Error('Limite de reagendamentos atingido')
      }

      // Verificar antecedência mínima
      const agora = new Date()
      const dataAgendamento = new Date(novaDataHora)
      const horasAntecedencia = (dataAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60)

      if (horasAntecedencia < agendamento.agendamento.unidade.configuracao?.antecedencia_minima_horas!) {
        throw new Error(`Reagendamento deve ser feito com pelo menos ${agendamento.agendamento.unidade.configuracao?.antecedencia_minima_horas} horas de antecedência`)
      }

      // Atualizar agendamento
      const { error } = await supabase
        .from('agendamentos')
        .update({
          data_hora: novaDataHora,
          reagendamentos_count: (agendamento.agendamento.reagendamentos_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamento.agendamento.id)

      if (error) throw error

      // Enviar notificação de reagendamento
      await supabase.functions.invoke('send-notification', {
        body: {
          agendamento_id: agendamento.agendamento.id,
          tipo: 'reagendamento'
        }
      })

      toast({
        title: "Reagendamento realizado!",
        description: "Você receberá uma confirmação via WhatsApp."
      })

      // Atualizar dados locais
      setAgendamento(prev => prev ? {
        ...prev,
        agendamento: {
          ...prev.agendamento,
          data_hora: novaDataHora,
          reagendamentos_count: (prev.agendamento.reagendamentos_count || 0) + 1
        }
      } : null)

      return true
    } catch (error: any) {
      console.error('Erro ao reagendar:', error)
      toast({
        title: "Erro ao reagendar",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  // Cancelar
  const cancelar = async (motivo?: string) => {
    if (!agendamento || !agendamento.pode_cancelar) return

    setSubmitting(true)
    try {
      // Verificar se pode cancelar (antecedência)
      const agora = new Date()
      const dataAgendamento = new Date(agendamento.agendamento.data_hora)
      const horasRestantes = (dataAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60)

      if (horasRestantes < agendamento.agendamento.unidade.configuracao?.horario_limite_cancelamento!) {
        throw new Error(`Cancelamento deve ser feito com pelo menos ${agendamento.agendamento.unidade.configuracao?.horario_limite_cancelamento} horas de antecedência`)
      }

      // Atualizar status
      const { error } = await supabase
        .from('agendamentos')
        .update({
          status: 'cancelado',
          observacoes: motivo,
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamento.agendamento.id)

      if (error) throw error

      // Enviar notificação de cancelamento
      await supabase.functions.invoke('send-notification', {
        body: {
          agendamento_id: agendamento.agendamento.id,
          tipo: 'cancelamento'
        }
      })

      toast({
        title: "Agendamento cancelado",
        description: "Você receberá uma confirmação via WhatsApp."
      })

      // Atualizar dados locais
      setAgendamento(prev => prev ? {
        ...prev,
        agendamento: { ...prev.agendamento, status: 'cancelado' as const },
        pode_reagendar: false,
        pode_cancelar: false
      } : null)

      return true
    } catch (error: any) {
      console.error('Erro ao cancelar:', error)
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  return {
    agendamento,
    disponibilidade,
    loading,
    loadingDisponibilidade,
    submitting,
    fetchDisponibilidade,
    reagendar,
    cancelar
  }
}