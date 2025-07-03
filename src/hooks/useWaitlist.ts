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
      // Simulate empty waitlist for now - will be updated when DB types are refreshed
      setWaitlist([])
    } catch (error) {
      console.error('Error fetching waitlist:', error)
      setWaitlist([])
    } finally {
      setLoading(false)
    }
  }

  const addToWaitlist = async (entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate success for now
      console.log('Adding to waitlist:', entry)
      return { success: true }
    } catch (error) {
      console.error('Error adding to waitlist:', error)
      return { success: false, error }
    }
  }

  const updateWaitlistStatus = async (id: string, status: WaitlistEntry['status']) => {
    try {
      // Simulate success for now
      console.log('Updating waitlist status:', id, status)
      return { success: true }
    } catch (error) {
      console.error('Error updating waitlist status:', error)
      return { success: false, error }
    }
  }

  const promoteFromWaitlist = async (waitlistId: string, agendamentoData: any) => {
    try {
      const { error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert([agendamentoData])

      if (agendamentoError) throw agendamentoError

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