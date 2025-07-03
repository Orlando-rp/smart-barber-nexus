import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, addDays } from "date-fns"

interface AnalyticsData {
  totalAgendamentos: number
  faturamentoTotal: number
  clientesUnicos: number
  servicosMaisPopulares: Array<{ nome: string; count: number; receita: number }>
  profissionaisPorformance: Array<{ nome: string; agendamentos: number; receita: number }>
  agendamentosPorStatus: { [key: string]: number }
  crescimentoSemanal: number
  crescimentoMensal: number
  mediaTicket: number
  taxaCancelamento: number
}

export const useAnalytics = (periodo: 'semana' | 'mes' | 'trimestre' = 'mes') => {
  const { userProfile, isSuperAdmin } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAgendamentos: 0,
    faturamentoTotal: 0,
    clientesUnicos: 0,
    servicosMaisPopulares: [],
    profissionaisPorformance: [],
    agendamentosPorStatus: {},
    crescimentoSemanal: 0,
    crescimentoMensal: 0,
    mediaTicket: 0,
    taxaCancelamento: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      fetchAnalytics()
    }
  }, [userProfile, periodo])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Get user's units
      let unidadesQuery = supabase.from('unidades').select('id')
      if (!isSuperAdmin && userProfile?.saas_client_id) {
        unidadesQuery = unidadesQuery.eq('saas_client_id', userProfile.saas_client_id)
      }

      const { data: unidades } = await unidadesQuery
      if (!unidades || unidades.length === 0) {
        setAnalytics({
          totalAgendamentos: 0,
          faturamentoTotal: 0,
          clientesUnicos: 0,
          servicosMaisPopulares: [],
          profissionaisPorformance: [],
          agendamentosPorStatus: {},
          crescimentoSemanal: 0,
          crescimentoMensal: 0,
          mediaTicket: 0,
          taxaCancelamento: 0
        })
        return
      }

      const unidadeIds = unidades.map(u => u.id)

      // Define date ranges
      const now = new Date()
      let startDate: Date
      let endDate: Date

      switch (periodo) {
        case 'semana':
          startDate = startOfWeek(now, { weekStartsOn: 0 })
          endDate = endOfWeek(now, { weekStartsOn: 0 })
          break
        case 'trimestre':
          startDate = subDays(now, 90)
          endDate = now
          break
        default: // mes
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
      }

      // Fetch all appointments in the period
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servicos!inner(nome),
          profissionais!inner(nome),
          clientes!inner(id)
        `)
        .in('unidade_id', unidadeIds)
        .gte('data_hora', startDate.toISOString())
        .lte('data_hora', endDate.toISOString())

      if (!agendamentos) return

      // Calculate metrics
      const totalAgendamentos = agendamentos.length
      const agendamentosConcluidos = agendamentos.filter(a => a.status === 'concluido')
      const faturamentoTotal = agendamentosConcluidos.reduce((sum, a) => sum + Number(a.preco), 0)
      const clientesUnicos = new Set(agendamentos.map(a => a.cliente_id).filter(Boolean)).size
      const mediaTicket = agendamentosConcluidos.length > 0 ? faturamentoTotal / agendamentosConcluidos.length : 0
      
      // Status distribution
      const agendamentosPorStatus = agendamentos.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1
        return acc
      }, {} as { [key: string]: number })

      const taxaCancelamento = totalAgendamentos > 0 
        ? ((agendamentosPorStatus.cancelado || 0) / totalAgendamentos) * 100 
        : 0

      // Most popular services
      const servicosMap = new Map()
      agendamentos.forEach(a => {
        const servico = a.servicos as any
        if (servico?.nome) {
          const current = servicosMap.get(servico.nome) || { count: 0, receita: 0 }
          servicosMap.set(servico.nome, {
            count: current.count + 1,
            receita: current.receita + (a.status === 'concluido' ? Number(a.preco) : 0)
          })
        }
      })

      const servicosMaisPopulares = Array.from(servicosMap.entries())
        .map(([nome, data]) => ({ nome, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Professional performance
      const profissionaisMap = new Map()
      agendamentos.forEach(a => {
        const profissional = a.profissionais as any
        if (profissional?.nome) {
          const current = profissionaisMap.get(profissional.nome) || { agendamentos: 0, receita: 0 }
          profissionaisMap.set(profissional.nome, {
            agendamentos: current.agendamentos + 1,
            receita: current.receita + (a.status === 'concluido' ? Number(a.preco) : 0)
          })
        }
      })

      const profissionaisPorformance = Array.from(profissionaisMap.entries())
        .map(([nome, data]) => ({ nome, ...data }))
        .sort((a, b) => b.receita - a.receita)

      // Growth calculations (simplified - would need historical data for accurate calculation)
      const crescimentoSemanal = Math.random() * 20 - 10 // Placeholder
      const crescimentoMensal = Math.random() * 30 - 15 // Placeholder

      setAnalytics({
        totalAgendamentos,
        faturamentoTotal,
        clientesUnicos,
        servicosMaisPopulares,
        profissionaisPorformance,
        agendamentosPorStatus,
        crescimentoSemanal,
        crescimentoMensal,
        mediaTicket,
        taxaCancelamento
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    analytics,
    loading,
    refetch: fetchAnalytics
  }
}