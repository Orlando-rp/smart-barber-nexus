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
    const { agendamento_id, tipo } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar dados do agendamento
    const { data: agendamento } = await supabase
      .from('agendamentos')
      .select(`
        *,
        unidades:unidade_id (nome, endereco),
        profissionais:profissional_id (nome),
        servicos:servico_id (nome),
        templates_mensagens!unidade_id (template)
      `)
      .eq('id', agendamento_id)
      .single()

    if (!agendamento) {
      throw new Error('Agendamento não encontrado')
    }

    // Buscar template da mensagem
    const { data: template } = await supabase
      .from('templates_mensagens')
      .select('template')
      .eq('unidade_id', agendamento.unidade_id)
      .eq('tipo', tipo)
      .eq('canal', 'whatsapp')
      .eq('ativo', true)
      .single()

    if (!template) {
      console.log(`Template ${tipo} não encontrado`)
      return new Response(JSON.stringify({ success: false, message: 'Template não encontrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Substituir variáveis no template
    let mensagem = template.template
    mensagem = mensagem.replace('{{cliente_nome}}', agendamento.cliente_nome || '')
    mensagem = mensagem.replace('{{profissional_nome}}', agendamento.profissionais?.nome || '')
    mensagem = mensagem.replace('{{servico_nome}}', agendamento.servicos?.nome || '')
    mensagem = mensagem.replace('{{unidade_nome}}', agendamento.unidades?.nome || '')
    mensagem = mensagem.replace('{{data_hora}}', new Date(agendamento.data_hora).toLocaleString('pt-BR'))
    mensagem = mensagem.replace('{{link_agendamento}}', `${Deno.env.get('SITE_URL') || 'https://barbersmart.app'}/agendamento/${agendamento.token_link}`)

    // Log da notificação
    await supabase
      .from('logs_notificacoes')
      .insert({
        agendamento_id,
        tipo,
        canal: 'whatsapp',
        destinatario: agendamento.cliente_telefone || '',
        status: 'enviado', // Simular envio por enquanto
        resposta_api: { mensagem }
      })

    console.log(`Notificação ${tipo} enviada para ${agendamento.cliente_telefone}:`, mensagem)

    return new Response(
      JSON.stringify({ success: true, message: 'Notificação enviada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})