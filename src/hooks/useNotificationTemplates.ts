import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
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

  const createTemplate = async (templateData: Omit<NotificationTemplate, 'id' | 'unidade_id'>) => {
    try {
      // Get user's first unit
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)
        .limit(1)

      if (!unidades || unidades.length === 0) {
        throw new Error('Nenhuma unidade encontrada')
      }

      const { error } = await supabase
        .from('templates_mensagens')
        .insert([{
          ...templateData,
          unidade_id: unidades[0].id
        }])

      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso!",
      })
      
      await fetchTemplates()
      return { success: true }
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      })
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

  const toggleTemplateStatus = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('templates_mensagens')
        .update({ ativo })
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: `Template ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
      })
      
      await fetchTemplates()
    } catch (error) {
      console.error('Error toggling template status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do template.",
        variant: "destructive",
      })
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates_mensagens')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Template removido com sucesso!",
      })
      
      await fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o template.",
        variant: "destructive",
      })
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
    toggleTemplateStatus,
    deleteTemplate,
    sendNotification,
    refetch: fetchTemplates
  }
}