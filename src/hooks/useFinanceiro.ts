import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export interface ComissaoCalculada {
  profissional_id: string
  profissional_nome: string
  valor_total_servicos: number
  percentual_comissao: number
  valor_comissao: number
  quantidade_servicos: number
  periodo: string
}

export interface MovimentacaoFinanceira {
  id: string
  unidade_id: string
  tipo: 'receita' | 'despesa'
  categoria: string
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  status: 'pendente' | 'pago' | 'vencido'
  observacoes?: string
  agendamento_id?: string
  created_at: string
}

export const useFinanceiro = () => {
  const { userProfile } = useAuth()
  const [comissoes, setComissoes] = useState<ComissaoCalculada[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      fetchDadosFinanceiros()
    }
  }, [userProfile])

  const fetchDadosFinanceiros = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchComissoes(),
        fetchMovimentacoes()
      ])
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComissoes = async () => {
    try {
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)

      if (!unidades || unidades.length === 0) return

      const unidadeIds = unidades.map(u => u.id)
      
      // Calculate commissions for current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const endOfMonth = new Date()
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0)
      endOfMonth.setHours(23, 59, 59, 999)

      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select(`
          preco,
          profissional_id,
          profissionais(nome, comissao_percentual)
        `)
        .in('unidade_id', unidadeIds)
        .eq('status', 'concluido')
        .gte('data_hora', startOfMonth.toISOString())
        .lte('data_hora', endOfMonth.toISOString())

      if (!agendamentos) return

      // Group by professional and calculate commissions
      const comissoesMap = new Map<string, ComissaoCalculada>()

      agendamentos.forEach((agendamento) => {
        const profId = agendamento.profissional_id
        const existing = comissoesMap.get(profId)
        
        if (existing) {
          existing.valor_total_servicos += Number(agendamento.preco)
          existing.quantidade_servicos += 1
          existing.valor_comissao = existing.valor_total_servicos * (existing.percentual_comissao / 100)
        } else {
          const percentual = Number(agendamento.profissionais?.comissao_percentual || 0)
          comissoesMap.set(profId, {
            profissional_id: profId,
            profissional_nome: agendamento.profissionais?.nome || 'N/A',
            valor_total_servicos: Number(agendamento.preco),
            percentual_comissao: percentual,
            valor_comissao: Number(agendamento.preco) * (percentual / 100),
            quantidade_servicos: 1,
            periodo: `${startOfMonth.getMonth() + 1}/${startOfMonth.getFullYear()}`
          })
        }
      })

      setComissoes(Array.from(comissoesMap.values()))
    } catch (error) {
      console.error('Error fetching commissions:', error)
    }
  }

  const fetchMovimentacoes = async () => {
    try {
      // Simulate empty data for now - will be updated when DB types are refreshed
      setMovimentacoes([])
    } catch (error) {
      console.error('Error fetching financial movements:', error)
    }
  }

  const adicionarMovimentacao = async (movimentacao: Omit<MovimentacaoFinanceira, 'id' | 'created_at'>) => {
    try {
      console.log('Adding financial movement:', movimentacao)
      return { success: true }
    } catch (error) {
      console.error('Error adding financial movement:', error)
      return { success: false, error }
    }
  }

  const marcarComoPago = async (id: string) => {
    try {
      console.log('Marking as paid:', id)
      return { success: true }
    } catch (error) {
      console.error('Error marking as paid:', error)
      return { success: false, error }
    }
  }

  const getResumoFinanceiro = () => {
    const receitas = movimentacoes
      .filter(m => m.tipo === 'receita')
      .reduce((total, m) => total + Number(m.valor), 0)

    const despesas = movimentacoes
      .filter(m => m.tipo === 'despesa')
      .reduce((total, m) => total + Number(m.valor), 0)

    const pendentes = movimentacoes
      .filter(m => m.status === 'pendente')
      .reduce((total, m) => total + Number(m.valor), 0)

    const totalComissoes = comissoes
      .reduce((total, c) => total + c.valor_comissao, 0)

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      pendentes,
      totalComissoes
    }
  }

  return {
    comissoes,
    movimentacoes,
    loading,
    adicionarMovimentacao,
    marcarComoPago,
    getResumoFinanceiro,
    refetch: fetchDadosFinanceiros
  }
}