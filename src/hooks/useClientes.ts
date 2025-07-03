import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Cliente {
  id: string
  nome: string
  email?: string
  telefone?: string
  data_nascimento?: string
  observacoes?: string
  total_visitas?: number
  ultima_visita?: string
  unidade_id: string
  created_at: string
  updated_at: string
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchClientes = async () => {
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
        setClientes([])
        return
      }

      // Buscar clientes das unidades do usuário
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .in('unidade_id', unidadeIds)
        .order('created_at', { ascending: false })

      if (error) throw error

      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!",
      })

      fetchClientes()
      return data[0]
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      })

      fetchClientes()
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Cliente removido com sucesso!",
      })

      fetchClientes()
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [user])

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes,
  }
}