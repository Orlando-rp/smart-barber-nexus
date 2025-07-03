import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppRequest {
  phone: string
  message: string
  agendamento_id?: string
  template_type?: 'confirmacao' | 'lembrete' | 'cancelamento'
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phone, message, agendamento_id, template_type }: WhatsAppRequest = await req.json()

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get WhatsApp API credentials from environment
    const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN')
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID')

    if (!whatsappToken || !whatsappPhoneId) {
      console.error('WhatsApp credentials not configured')
      return new Response(
        JSON.stringify({ error: 'WhatsApp service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format phone number (remove special characters and add country code if needed)
    const formattedPhone = phone.replace(/\D/g, '')
    const phoneWithCountryCode = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`

    // Send WhatsApp message using Meta WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneWithCountryCode,
        type: 'text',
        text: {
          body: message
        }
      })
    })

    const whatsappResult = await whatsappResponse.json()
    console.log('WhatsApp API response:', whatsappResult)

    // Log notification attempt
    if (agendamento_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase.from('logs_notificacoes').insert({
        agendamento_id,
        tipo: template_type || 'custom',
        canal: 'whatsapp',
        destinatario: phoneWithCountryCode,
        status: whatsappResponse.ok ? 'enviado' : 'erro',
        resposta_api: whatsappResult,
        tentativas: 1
      })
    }

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappResult)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send WhatsApp message', 
          details: whatsappResult 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: whatsappResult.messages?.[0]?.id,
        phone: phoneWithCountryCode 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in send-whatsapp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)