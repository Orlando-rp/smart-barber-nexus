import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useErrorHandler } from "@/hooks/useErrorHandler"

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
  const { handleError, handleSuccess } = useErrorHandler()

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
        // Se não há unidades, criar dados de demonstração
        await createDemoData()
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
      handleError(error, {
        customMessage: "Não foi possível carregar os agendamentos."
      })
    } finally {
      setLoading(false)
    }
  }

  const createDemoData = async () => {
    try {
      // Criar unidade
      const { data: unidade, error: unidadeError } = await supabase
        .from('unidades')
        .insert([{
          nome: 'Barbearia Demo',
          user_id: user.id,
          endereco: 'Rua das Flores, 123 - Centro',
          telefone: '(11) 98765-4321'
        }])
        .select()
        .single()

      if (unidadeError) throw unidadeError

      // Criar profissionais
      const { error: profissionaisError } = await supabase
        .from('profissionais')
        .insert([
          {
            nome: 'João Silva',
            telefone: '(11) 99999-1111',
            email: 'joao@demo.com',
            unidade_id: unidade.id,
            especialidades: ['Corte Masculino', 'Barba', 'Bigode']
          },
          {
            nome: 'Maria Santos',
            telefone: '(11) 99999-2222',
            email: 'maria@demo.com',
            unidade_id: unidade.id,
            especialidades: ['Corte Feminino', 'Escova', 'Tratamentos']
          }
        ])

      if (profissionaisError) throw profissionaisError

      // Criar serviços
      const { error: servicosError } = await supabase
        .from('servicos')
        .insert([
          {
            nome: 'Corte Masculino',
            preco: 35.00,
            duracao_minutos: 30,
            categoria: 'corte',
            descricao: 'Corte tradicional masculino com acabamento',
            unidade_id: unidade.id
          },
          {
            nome: 'Barba + Bigode',
            preco: 25.00,
            duracao_minutos: 20,
            categoria: 'barba',
            descricao: 'Aparar barba e bigode com navalha',
            unidade_id: unidade.id
          },
          {
            nome: 'Corte + Barba',
            preco: 50.00,
            duracao_minutos: 45,
            categoria: 'combo',
            descricao: 'Pacote completo: corte masculino + barba',
            unidade_id: unidade.id
          }
        ])

      if (servicosError) throw servicosError

      // Criar clientes
      const { error: clientesError } = await supabase
        .from('clientes')
        .insert([
          {
            nome: 'Carlos Oliveira',
            telefone: '(11) 97777-1111',
            email: 'carlos@email.com',
            unidade_id: unidade.id,
            total_visitas: 5
          },
          {
            nome: 'Pedro Costa',
            telefone: '(11) 97777-2222',
            email: 'pedro@email.com',
            unidade_id: unidade.id,
            total_visitas: 3
          }
        ])

      if (clientesError) throw clientesError

      handleSuccess("Dados de demonstração foram criados com sucesso.")

      // Recarregar dados
      fetchAgendamentos()
    } catch (error) {
      handleError(error, {
        customMessage: "Não foi possível criar os dados de demonstração."
      })
    }
  }

  const createAgendamento = async (agendamentoData: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([agendamentoData])
        .select()

      if (error) throw error

      handleSuccess("Agendamento criado com sucesso!")

      fetchAgendamentos()
      return data[0]
    } catch (error) {
      handleError(error, {
        customMessage: "Não foi possível criar o agendamento."
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

      handleSuccess("Agendamento atualizado com sucesso!")

      fetchAgendamentos()
      return data[0]
    } catch (error) {
      handleError(error, {
        customMessage: "Não foi possível atualizar o agendamento."
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

      handleSuccess(`Status atualizado para ${status}!`)

      fetchAgendamentos()
    } catch (error) {
      handleError(error, {
        customMessage: "Não foi possível atualizar o status."
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

      handleSuccess("Agendamento removido com sucesso!")

      fetchAgendamentos()
    } catch (error) {
      handleError(error, {
        customMessage: "Não foi possível remover o agendamento."
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