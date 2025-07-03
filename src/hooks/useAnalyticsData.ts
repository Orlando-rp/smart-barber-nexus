import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { startOfWeek, endOfWeek, format, subDays, subWeeks, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DailyStats {
  date: string
  agendamentos: number
  receita: number
  cancelamentos: number
}

interface ServiceStats {
  name: string
  count: number
  revenue: number
  percentage: number
}

interface ProfessionalStats {
  name: string
  agendamentos: number
  receita: number
  rating: number
}

interface AnalyticsData {
  dailyStats: DailyStats[]
  serviceStats: ServiceStats[]
  professionalStats: ProfessionalStats[]
  totalRevenue: number
  totalAppointments: number
  averageTicket: number
  cancellationRate: number
  peakHours: Array<{ hour: string, count: number }>
  monthlyGrowth: number
  topClients: Array<{ name: string, visits: number, revenue: number }>
}

export const useAnalyticsData = (period: 'week' | 'month' | 'quarter' = 'month') => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { handleError } = useErrorHandler()

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, period])

  const getDateRange = () => {
    const now = new Date()
    switch (period) {
      case 'week':
        return {
          start: startOfWeek(now, { locale: ptBR }),
          end: endOfWeek(now, { locale: ptBR })
        }
      case 'month':
        return {
          start: subDays(now, 30),
          end: now
        }
      case 'quarter':
        return {
          start: subMonths(now, 3),
          end: now
        }
      default:
        return {
          start: subDays(now, 30),
          end: now
        }
    }
  }

  const fetchAnalyticsData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { start, end } = getDateRange()

      // Get user's units
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id')
        .eq('user_id', user.id)

      if (unidadesError) throw unidadesError
      const unidadeIds = unidades?.map(u => u.id) || []

      if (unidadeIds.length === 0) {
        setData({
          dailyStats: [],
          serviceStats: [],
          professionalStats: [],
          totalRevenue: 0,
          totalAppointments: 0,
          averageTicket: 0,
          cancellationRate: 0,
          peakHours: [],
          monthlyGrowth: 0,
          topClients: []
        })
        return
      }

      // Fetch agendamentos data
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          profissionais:profissional_id (nome),
          servicos:servico_id (nome, preco),
          clientes:cliente_id (nome, total_visitas)
        `)
        .in('unidade_id', unidadeIds)
        .gte('data_hora', start.toISOString())
        .lte('data_hora', end.toISOString())

      if (agendamentosError) throw agendamentosError

      // Fetch financial data
      const { data: financeiro, error: financeiroError } = await supabase
        .from('movimentacoes_financeiras')
        .select('*')
        .in('unidade_id', unidadeIds)
        .gte('data_vencimento', format(start, 'yyyy-MM-dd'))
        .lte('data_vencimento', format(end, 'yyyy-MM-dd'))
        .eq('tipo', 'receita')

      if (financeiroError) throw financeiroError

      // Process analytics data
      const processedData = processAnalyticsData(agendamentos || [], financeiro || [])
      setData(processedData)

    } catch (error) {
      handleError(error, {
        customMessage: "Erro ao carregar dados de analytics"
      })
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (agendamentos: any[], financeiro: any[]): AnalyticsData => {
    // Daily stats
    const dailyStatsMap = new Map<string, DailyStats>()
    
    agendamentos.forEach(agenda => {
      const date = format(new Date(agenda.data_hora), 'yyyy-MM-dd')
      const existing = dailyStatsMap.get(date) || { date, agendamentos: 0, receita: 0, cancelamentos: 0 }
      
      existing.agendamentos++
      if (agenda.status === 'concluido') {
        existing.receita += agenda.preco
      }
      if (agenda.status === 'cancelado') {
        existing.cancelamentos++
      }
      
      dailyStatsMap.set(date, existing)
    })

    const dailyStats = Array.from(dailyStatsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Service stats
    const serviceStatsMap = new Map<string, ServiceStats>()
    const totalAgendamentos = agendamentos.length

    agendamentos.forEach(agenda => {
      const serviceName = agenda.servicos?.nome || 'Serviço não identificado'
      const existing = serviceStatsMap.get(serviceName) || { 
        name: serviceName, 
        count: 0, 
        revenue: 0, 
        percentage: 0 
      }
      
      existing.count++
      if (agenda.status === 'concluido') {
        existing.revenue += agenda.preco
      }
      
      serviceStatsMap.set(serviceName, existing)
    })

    const serviceStats = Array.from(serviceStatsMap.values())
      .map(service => ({
        ...service,
        percentage: totalAgendamentos > 0 ? (service.count / totalAgendamentos) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)

    // Professional stats
    const professionalStatsMap = new Map<string, ProfessionalStats>()

    agendamentos.forEach(agenda => {
      const profName = agenda.profissionais?.nome || 'Profissional não identificado'
      const existing = professionalStatsMap.get(profName) || { 
        name: profName, 
        agendamentos: 0, 
        receita: 0, 
        rating: 4.5 
      }
      
      existing.agendamentos++
      if (agenda.status === 'concluido') {
        existing.receita += agenda.preco
      }
      
      professionalStatsMap.set(profName, existing)
    })

    const professionalStats = Array.from(professionalStatsMap.values())
      .sort((a, b) => b.receita - a.receita)

    // Totals and calculations
    const totalRevenue = financeiro.reduce((sum, mov) => sum + mov.valor, 0)
    const totalAppointments = agendamentos.length
    const completedAppointments = agendamentos.filter(a => a.status === 'concluido').length
    const canceledAppointments = agendamentos.filter(a => a.status === 'cancelado').length
    const averageTicket = completedAppointments > 0 ? totalRevenue / completedAppointments : 0
    const cancellationRate = totalAppointments > 0 ? (canceledAppointments / totalAppointments) * 100 : 0

    // Peak hours analysis
    const hourStatsMap = new Map<string, number>()
    
    agendamentos.forEach(agenda => {
      const hour = format(new Date(agenda.data_hora), 'HH:00')
      hourStatsMap.set(hour, (hourStatsMap.get(hour) || 0) + 1)
    })

    const peakHours = Array.from(hourStatsMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Top clients
    const clientStatsMap = new Map<string, { name: string, visits: number, revenue: number }>()

    agendamentos.forEach(agenda => {
      if (!agenda.clientes?.nome) return
      
      const clientName = agenda.clientes.nome
      const existing = clientStatsMap.get(clientName) || { 
        name: clientName, 
        visits: 0, 
        revenue: 0 
      }
      
      existing.visits++
      if (agenda.status === 'concluido') {
        existing.revenue += agenda.preco
      }
      
      clientStatsMap.set(clientName, existing)
    })

    const topClients = Array.from(clientStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Monthly growth (simplified calculation)
    const monthlyGrowth = 12.5 // Mock data for now

    return {
      dailyStats,
      serviceStats,
      professionalStats,
      totalRevenue,
      totalAppointments,
      averageTicket,
      cancellationRate,
      peakHours,
      monthlyGrowth,
      topClients
    }
  }

  return {
    data,
    loading,
    refetch: fetchAnalyticsData
  }
}