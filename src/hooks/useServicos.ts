import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao_minutos: number
  categoria?: string
  ativo: boolean
  unidade_id: string
  created_at: string
  updated_at: string
}

export const useServicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchServicos = async () => {
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
        setServicos([])
        return
      }

      // Buscar serviços das unidades do usuário
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .in('unidade_id', unidadeIds)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error

      setServicos(data || [])
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServicos()
  }, [user])

  return {
    servicos,
    loading,
    refetch: fetchServicos,
  }
}