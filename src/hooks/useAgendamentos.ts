import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Agendamento {
  id: string
  cliente_id?: string
  cliente_nome?: string
  cliente_telefone?: string
  cliente_email?: string
  profissional_id: string
  servico_id: string
  data_hora: string
  duracao_minutos: number
  preco: number
  status: string
  observacoes?: string
  agendamento_origem: string
  unidade_id: string
  created_at: string
  updated_at: string
  // Relations
  profissionais?: {
    nome: string
  }
  servicos?: {
    nome: string
    preco: number
    duracao_minutos: number
  }
  clientes?: {
    nome: string
    telefone?: string
    email?: string
  }
}

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchAgendamentos = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Primeiro buscar as unidades do usuário
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id')
        .eq('user_id', user.id)

      if (unidadesError) throw unidadesError

      const unidadeIds = unidades?.map(u => u.id) || []

      if (unidadeIds.length === 0) {
        setAgendamentos([])
        return
      }

      // Buscar agendamentos com relações
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          profissionais:profissional_id (nome),
          servicos:servico_id (nome, preco, duracao_minutos),
          clientes:cliente_id (nome, telefone, email)
        `)
        .in('unidade_id', unidadeIds)
        .order('data_hora', { ascending: true })

      if (error) throw error

      setAgendamentos(data || [])
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createAgendamento = async (agendamentoData: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([agendamentoData])
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      })

      fetchAgendamentos()
      return data[0]
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateAgendamento = async (id: string, agendamentoData: Partial<Agendamento>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(agendamentoData)
        .eq('id', id)
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      })

      fetchAgendamentos()
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Status atualizado para ${status}!`,
      })

      fetchAgendamentos()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      })
    }
  }

  const deleteAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso!",
      })

      fetchAgendamentos()
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAgendamentos()
  }, [user])

  return {
    agendamentos,
    loading,
    createAgendamento,
    updateAgendamento,
    updateStatus,
    deleteAgendamento,
    refetch: fetchAgendamentos,
  }
}