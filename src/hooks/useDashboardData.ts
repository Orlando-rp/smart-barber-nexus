import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  agendamentosHoje: number
  faturamentoMensal: number
  clientesAtivos: number
  taxaOcupacao: number
}

export const useDashboardData = () => {
  const { userProfile, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    agendamentosHoje: 0,
    faturamentoMensal: 0,
    clientesAtivos: 0,
    taxaOcupacao: 0
  })
  const [hasUnidades, setHasUnidades] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (userProfile && !isSuperAdmin) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [userProfile, isSuperAdmin])

  const fetchDashboardData = async () => {
    try {
      // Verificar se tem unidades cadastradas
      let unidadesQuery = supabase.from('unidades').select('id')
      if (!isSuperAdmin && userProfile?.saas_client_id) {
        unidadesQuery = unidadesQuery.eq('saas_client_id', userProfile.saas_client_id)
      }

      const { data: unidades } = await unidadesQuery
      setHasUnidades((unidades?.length || 0) > 0)

      if (unidades && unidades.length > 0) {
        const unidadeIds = unidades.map(u => u.id)
        
        // Dates for calculations
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

        // Agendamentos hoje
        const { data: agendamentosHoje } = await supabase
          .from('agendamentos')
          .select('id, status')
          .in('unidade_id', unidadeIds)
          .gte('data_hora', todayStart.toISOString())
          .lt('data_hora', tomorrowStart.toISOString())

        // Faturamento mensal
        const { data: agendamentosMes } = await supabase
          .from('agendamentos')
          .select('preco')
          .in('unidade_id', unidadeIds)
          .gte('data_hora', firstDayOfMonth.toISOString())
          .lte('data_hora', lastDayOfMonth.toISOString())
          .eq('status', 'concluido')

        // Clientes únicos de todas as unidades
        const { data: clientes } = await supabase
          .from('clientes')
          .select('id')
          .in('unidade_id', unidadeIds)

        const faturamento = agendamentosMes?.reduce((sum, a) => sum + (Number(a.preco) || 0), 0) || 0
        
        // Calculate occupancy rate based on confirmed/completed appointments today
        const totalHoje = agendamentosHoje?.length || 0
        const confirmadosHoje = agendamentosHoje?.filter(a => ['confirmado', 'concluido', 'em_andamento'].includes(a.status)).length || 0
        const taxaOcupacao = totalHoje > 0 ? Math.round((confirmadosHoje / totalHoje) * 100) : 0

        setStats({
          agendamentosHoje: totalHoje,
          faturamentoMensal: faturamento,
          clientesAtivos: clientes?.length || 0,
          taxaOcupacao
        })
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    hasUnidades,
    loading,
    refetch: fetchDashboardData
  }
}