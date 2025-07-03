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
    const { unidade_id, profissional_id, servico_id, data, exclude_agendamento_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar horário de funcionamento e duração do serviço
    const { data: unidade } = await supabase
      .from('unidades')
      .select('horario_funcionamento')
      .eq('id', unidade_id)
      .single()

    const { data: servico } = await supabase
      .from('servicos')
      .select('duracao_minutos')
      .eq('id', servico_id)
      .single()

    if (!unidade || !servico) {
      throw new Error('Unidade ou serviço não encontrado')
    }

    // Buscar agendamentos existentes do profissional nesta data
    let query = supabase
      .from('agendamentos')
      .select('data_hora, duracao_minutos')
      .eq('profissional_id', profissional_id)
      .gte('data_hora', `${data}T00:00:00`)
      .lt('data_hora', `${data}T23:59:59`)
      .neq('status', 'cancelado')

    if (exclude_agendamento_id) {
      query = query.neq('id', exclude_agendamento_id)
    }

    const { data: agendamentos } = await query

    // Gerar slots de horário (08:00 às 18:00, intervalos de 30min)
    const slots = []
    const startHour = 8
    const endHour = 18
    const interval = 30

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const slotDateTime = `${data}T${slotTime}:00`
        
        // Verificar se há conflito com agendamentos existentes
        const hasConflict = agendamentos?.some(ag => {
          const agStart = new Date(ag.data_hora)
          const agEnd = new Date(agStart.getTime() + ag.duracao_minutos * 60000)
          const slotStart = new Date(slotDateTime)
          const slotEnd = new Date(slotStart.getTime() + servico.duracao_minutos * 60000)
          
          return (slotStart < agEnd && slotEnd > agStart)
        })

        slots.push({
          data_hora: slotDateTime,
          disponivel: !hasConflict && new Date(slotDateTime) > new Date(),
          profissional_id
        })
      }
    }

    return new Response(
      JSON.stringify({ slots }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})