import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Profissional {
  id: string
  nome: string
  email?: string
  telefone?: string
  servicos?: string[]
  comissao_percentual?: number
  ativo: boolean
  horario_trabalho?: any
  unidade_id: string
  created_at: string
  updated_at: string
}

export const useProfissionais = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProfissionais = async () => {
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
        setProfissionais([])
        return
      }

      // Buscar profissionais das unidades do usuário
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .in('unidade_id', unidadeIds)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProfissionais(data || [])
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createProfissional = async (profissionalData: Omit<Profissional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert([profissionalData])
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Profissional criado com sucesso!",
      })

      fetchProfissionais()
      return data[0]
    } catch (error) {
      console.error('Erro ao criar profissional:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o profissional.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateProfissional = async (id: string, profissionalData: Partial<Profissional>) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .update(profissionalData)
        .eq('id', id)
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso!",
      })

      fetchProfissionais()
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o profissional.",
        variant: "destructive",
      })
      throw error
    }
  }

  const toggleProfissionalStatus = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('profissionais')
        .update({ ativo })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Profissional ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
      })

      fetchProfissionais()
    } catch (error) {
      console.error('Erro ao alterar status do profissional:', error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do profissional.",
        variant: "destructive",
      })
    }
  }

  const deleteProfissional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Profissional removido com sucesso!",
      })

      fetchProfissionais()
    } catch (error) {
      console.error('Erro ao deletar profissional:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o profissional.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchProfissionais()
  }, [user])

  return {
    profissionais,
    loading,
    createProfissional,
    updateProfissional,
    toggleProfissionalStatus,
    deleteProfissional,
    refetch: fetchProfissionais,
  }
}