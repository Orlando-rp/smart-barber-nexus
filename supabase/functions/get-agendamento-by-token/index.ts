import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        unidades:unidade_id (
          id, nome, endereco, telefone, logo_url,
          configuracoes_agendamento:configuracoes_agendamento!unidade_id (*)
        ),
        profissionais:profissional_id (id, nome, especialidades),
        servicos:servico_id (id, nome, descricao, categoria, duracao_minutos, preco)
      `)
      .eq('token_link', token)
      .single()

    if (error || !agendamento) {
      throw new Error('Agendamento não encontrado')
    }

    // Verificar se pode reagendar/cancelar
    const agora = new Date()
    const dataAgendamento = new Date(agendamento.data_hora)
    const horasRestantes = (dataAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60)
    
    const configuracao = agendamento.unidades.configuracoes_agendamento[0]
    
    const pode_reagendar = 
      agendamento.status !== 'cancelado' && 
      agendamento.status !== 'concluído' &&
      horasRestantes >= configuracao.antecedencia_minima_horas &&
      (agendamento.reagendamentos_count || 0) < configuracao.max_reagendamentos

    const pode_cancelar = 
      agendamento.status !== 'cancelado' && 
      agendamento.status !== 'concluído' &&
      configuracao.permite_cancelamento &&
      horasRestantes >= configuracao.horario_limite_cancelamento

    return new Response(
      JSON.stringify({
        agendamento: {
          ...agendamento,
          unidade: {
            ...agendamento.unidades,
            configuracao
          },
          profissional: agendamento.profissionais,
          servico: agendamento.servicos
        },
        pode_reagendar,
        pode_cancelar
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})