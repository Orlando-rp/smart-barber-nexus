import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export interface NotificationTemplate {
  id: string
  tipo: string
  canal: string
  template: string
  ativo: boolean
  unidade_id: string
}

export const useNotificationTemplates = () => {
  const { userProfile } = useAuth()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      fetchTemplates()
    }
  }, [userProfile])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      
      // Get user's units
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)

      if (!unidades || unidades.length === 0) {
        setTemplates([])
        return
      }

      const unidadeIds = unidades.map(u => u.id)
      
      const { data: templatesData, error } = await supabase
        .from('templates_mensagens')
        .select('*')
        .in('unidade_id', unidadeIds)
        .order('tipo')

      if (error) throw error
      setTemplates(templatesData || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (template: Omit<NotificationTemplate, 'id'>) => {
    try {
      const { error } = await supabase
        .from('templates_mensagens')
        .insert([template])

      if (error) throw error
      await fetchTemplates()
      return { success: true }
    } catch (error) {
      console.error('Error creating template:', error)
      return { success: false, error }
    }
  }

  const updateTemplate = async (id: string, updates: Partial<NotificationTemplate>) => {
    try {
      const { error } = await supabase
        .from('templates_mensagens')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchTemplates()
      return { success: true }
    } catch (error) {
      console.error('Error updating template:', error)
      return { success: false, error }
    }
  }

  const sendNotification = async (agendamentoId: string, tipo: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: { agendamento_id: agendamentoId, tipo }
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error }
    }
  }

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    sendNotification,
    refetch: fetchTemplates
  }
}