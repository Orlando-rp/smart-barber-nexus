import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { UnidadePublica, ProfissionalPublico, ServicoPublico, DisponibilidadeSlot, NovoAgendamentoPublico } from '@/types/agendamento'
import { useToast } from '@/hooks/use-toast'

export const useAgendamentoPublico = (slug?: string) => {
  const [unidade, setUnidade] = useState<UnidadePublica | null>(null)
  const [profissionais, setProfissionais] = useState<ProfissionalPublico[]>([])
  const [servicos, setServicos] = useState<ServicoPublico[]>([])
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Buscar dados da unidade por slug
  useEffect(() => {
    if (!slug) return

    const fetchUnidade = async () => {
      try {
        const { data: configuracao, error: configError } = await supabase
          .from('configuracoes_agendamento')
          .select(`
            *,
            unidades:unidade_id (
              id,
              nome,
              endereco,
              telefone,
              horario_funcionamento,
              logo_url
            )
          `)
          .eq('slug_publico', slug)
          .eq('permite_agendamento_publico', true)
          .single()

        if (configError) throw configError

        if (configuracao?.unidades) {
          setUnidade({
            ...configuracao.unidades,
            configuracao
          })
        }
      } catch (error) {
        console.error('Erro ao buscar unidade:', error)
        toast({
          title: "Erro",
          description: "Unidade não encontrada",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUnidade()
  }, [slug, toast])

  // Buscar profissionais da unidade
  useEffect(() => {
    if (!unidade?.id) return

    const fetchProfissionais = async () => {
      try {
        const { data, error } = await supabase
          .from('profissionais')
          .select('id, nome, especialidades, ativo')
          .eq('unidade_id', unidade.id)
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        setProfissionais(data || [])
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error)
      }
    }

    fetchProfissionais()
  }, [unidade])

  // Buscar serviços da unidade
  useEffect(() => {
    if (!unidade?.id) return

    const fetchServicos = async () => {
      try {
        const { data, error } = await supabase
          .from('servicos')
          .select('id, nome, descricao, categoria, duracao_minutos, preco, ativo')
          .eq('unidade_id', unidade.id)
          .eq('ativo', true)
          .order('categoria, nome')

        if (error) throw error
        setServicos(data || [])
      } catch (error) {
        console.error('Erro ao buscar serviços:', error)
      }
    }

    fetchServicos()
  }, [unidade])

  // Buscar disponibilidade
  const fetchDisponibilidade = async (profissionalId: string, servicoId: string, data: string) => {
    if (!unidade?.id) return

    setLoadingDisponibilidade(true)
    try {
      const { data: availability, error } = await supabase.functions.invoke('check-availability', {
        body: {
          unidade_id: unidade.id,
          profissional_id: profissionalId,
          servico_id: servicoId,
          data: data
        }
      })

      if (error) throw error
      setDisponibilidade(availability?.slots || [])
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
      toast({
        title: "Erro",
        description: "Erro ao verificar disponibilidade",
        variant: "destructive"
      })
    } finally {
      setLoadingDisponibilidade(false)
    }
  }

  // Criar agendamento
  const criarAgendamento = async (dados: NovoAgendamentoPublico) => {
    if (!unidade?.configuracao) return

    setSubmitting(true)
    try {
      // Verificar antecedência mínima
      const agora = new Date()
      const dataAgendamento = new Date(dados.data_hora)
      const horasAntecedencia = (dataAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60)

      if (horasAntecedencia < unidade.configuracao.antecedencia_minima_horas) {
        throw new Error(`Agendamento deve ser feito com pelo menos ${unidade.configuracao.antecedencia_minima_horas} horas de antecedência`)
      }

      // Buscar dados do serviço para duração e preço
      const servico = servicos.find(s => s.id === dados.servico_id)
      if (!servico) throw new Error('Serviço não encontrado')

      // Criar agendamento
      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .insert({
          ...dados,
          duracao_minutos: servico.duracao_minutos,
          preco: servico.preco,
          status: 'confirmado',
          agendamento_origem: 'publico'
        })
        .select()
        .single()

      if (error) throw error

      // Enviar notificação de confirmação
      await supabase.functions.invoke('send-notification', {
        body: {
          agendamento_id: agendamento.id,
          tipo: 'confirmacao'
        }
      })

      toast({
        title: "Agendamento confirmado!",
        description: "Você receberá uma confirmação via WhatsApp."
      })

      return agendamento
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error)
      toast({
        title: "Erro ao agendar",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  return {
    unidade,
    profissionais,
    servicos,
    disponibilidade,
    loading,
    loadingDisponibilidade,
    submitting,
    fetchDisponibilidade,
    criarAgendamento
  }
}