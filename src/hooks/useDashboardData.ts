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
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)

      setHasUnidades((unidades?.length || 0) > 0)

      if (unidades && unidades.length > 0) {
        // Buscar estatísticas se tem unidades
        const today = new Date().toISOString().split('T')[0]
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()

        // Agendamentos hoje
        const { data: agendamentosHoje } = await supabase
          .from('agendamentos')
          .select('id')
          .gte('data_hora', today)
          .lt('data_hora', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .in('unidade_id', unidades.map(u => u.id))

        // Faturamento mensal
        const { data: agendamentosMes } = await supabase
          .from('agendamentos')
          .select('preco')
          .gte('data_hora', firstDayOfMonth)
          .lte('data_hora', lastDayOfMonth)
          .eq('status', 'concluido')
          .in('unidade_id', unidades.map(u => u.id))

        // Clientes únicos
        const { data: clientes } = await supabase
          .from('clientes')
          .select('id')
          .eq('unidade_id', unidades[0].id)

        const faturamento = agendamentosMes?.reduce((sum, a) => sum + (Number(a.preco) || 0), 0) || 0

        setStats({
          agendamentosHoje: agendamentosHoje?.length || 0,
          faturamentoMensal: faturamento,
          clientesAtivos: clientes?.length || 0,
          taxaOcupacao: 85 // Placeholder por enquanto
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