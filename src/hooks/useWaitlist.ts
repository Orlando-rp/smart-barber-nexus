import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export interface WaitlistEntry {
  id: string
  unidade_id: string
  cliente_nome: string
  cliente_telefone: string
  cliente_email?: string
  profissional_id?: string
  servico_id: string
  data_preferida: string
  horario_preferido: string
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'aguardando' | 'contatado' | 'agendado' | 'cancelado'
  observacoes?: string
  created_at: string
  updated_at: string
}

export const useWaitlist = () => {
  const { userProfile } = useAuth()
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      fetchWaitlist()
    }
  }, [userProfile])

  const fetchWaitlist = async () => {
    try {
      setLoading(true)
      
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)

      if (!unidades || unidades.length === 0) {
        setWaitlist([])
        return
      }

      const unidadeIds = unidades.map(u => u.id)
      
      const { data, error } = await supabase
        .from('fila_espera')
        .select(`
          *,
          profissional:profissionais(nome),
          servico:servicos(nome, preco, duracao_minutos),
          unidade:unidades(nome)
        `)
        .in('unidade_id', unidadeIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWaitlist(data || [])
    } catch (error) {
      console.error('Error fetching waitlist:', error)
      setWaitlist([])
    } finally {
      setLoading(false)
    }
  }

  const addToWaitlist = async (entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('fila_espera')
        .insert([entry])

      if (error) throw error
      await fetchWaitlist()
      return { success: true }
    } catch (error) {
      console.error('Error adding to waitlist:', error)
      return { success: false, error }
    }
  }

  const updateWaitlistStatus = async (id: string, status: WaitlistEntry['status']) => {
    try {
      const { error } = await supabase
        .from('fila_espera')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await fetchWaitlist()
      return { success: true }
    } catch (error) {
      console.error('Error updating waitlist status:', error)
      return { success: false, error }
    }
  }

  const promoteFromWaitlist = async (waitlistId: string, agendamentoData: any) => {
    try {
      // Create appointment
      const { error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert([agendamentoData])

      if (agendamentoError) throw agendamentoError

      // Update waitlist status
      await updateWaitlistStatus(waitlistId, 'agendado')

      return { success: true }
    } catch (error) {
      console.error('Error promoting from waitlist:', error)
      return { success: false, error }
    }
  }

  return {
    waitlist,
    loading,
    addToWaitlist,
    updateWaitlistStatus,
    promoteFromWaitlist,
    refetch: fetchWaitlist
  }
}