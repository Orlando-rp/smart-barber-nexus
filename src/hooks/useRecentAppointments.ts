import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export interface RecentAppointment {
  id: string
  cliente_nome: string | null
  servico_nome: string
  profissional_nome: string
  data_hora: string
  status: string
  preco: number
}

export const useRecentAppointments = () => {
  const { userProfile, isSuperAdmin } = useAuth()
  const [appointments, setAppointments] = useState<RecentAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      fetchRecentAppointments()
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('agendamentos-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'agendamentos'
          },
          () => {
            fetchRecentAppointments()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userProfile, isSuperAdmin])

  const fetchRecentAppointments = async () => {
    try {
      setLoading(true)

      // Get units first
      let unidadesQuery = supabase.from('unidades').select('id')
      if (!isSuperAdmin && userProfile?.saas_client_id) {
        unidadesQuery = unidadesQuery.eq('saas_client_id', userProfile.saas_client_id)
      }

      const { data: unidades } = await unidadesQuery
      if (!unidades || unidades.length === 0) {
        setAppointments([])
        return
      }

      const unidadeIds = unidades.map(u => u.id)
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

      // Fetch today's appointments with related data
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          cliente_nome,
          data_hora,
          status,
          preco,
          servicos!inner(nome),
          profissionais!inner(nome)
        `)
        .in('unidade_id', unidadeIds)
        .gte('data_hora', todayStart.toISOString())
        .lt('data_hora', tomorrowStart.toISOString())
        .order('data_hora', { ascending: true })
        .limit(6)

      if (error) throw error

      const formattedAppointments: RecentAppointment[] = (agendamentos || []).map(apt => ({
        id: apt.id,
        cliente_nome: apt.cliente_nome,
        servico_nome: (apt.servicos as any)?.nome || 'Serviço',
        profissional_nome: (apt.profissionais as any)?.nome || 'Profissional',
        data_hora: apt.data_hora,
        status: apt.status,
        preco: apt.preco
      }))

      setAppointments(formattedAppointments)
    } catch (error) {
      console.error('Error fetching recent appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  return {
    appointments,
    loading,
    refetch: fetchRecentAppointments
  }
}