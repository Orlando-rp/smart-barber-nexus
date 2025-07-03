import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { SaasClient, NewClientData } from "@/types/superAdmin"

export const useSuperAdminData = () => {
  const [clients, setClients] = useState<SaasClient[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('saas_clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar clientes SaaS"
      })
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData: NewClientData) => {
    try {
      const { error } = await supabase
        .from('saas_clients')
        .insert([clientData])

      if (error) throw error

      toast({
        title: "Cliente criado!",
        description: "Cliente SaaS criado com sucesso."
      })

      await fetchClients()
      return true
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar cliente SaaS"
      })
      return false
    }
  }

  return {
    clients,
    loading,
    createClient,
    refetch: fetchClients
  }
}