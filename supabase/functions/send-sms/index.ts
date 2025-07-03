import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
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
    const { phone, message, agendamento_id, template_type }: SMSRequest = await req.json()

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Twilio credentials from environment
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured')
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format phone number
    const formattedPhone = phone.replace(/\D/g, '')
    const phoneWithCountryCode = formattedPhone.startsWith('55') ? `+${formattedPhone}` : `+55${formattedPhone}`

    // Send SMS using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneWithCountryCode,
        From: twilioPhoneNumber,
        Body: message
      })
    })

    const twilioResult = await twilioResponse.json()
    console.log('Twilio API response:', twilioResult)

    // Log notification attempt
    if (agendamento_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase.from('logs_notificacoes').insert({
        agendamento_id,
        tipo: template_type || 'custom',
        canal: 'sms',
        destinatario: phoneWithCountryCode,
        status: twilioResponse.ok ? 'enviado' : 'erro',
        resposta_api: twilioResult,
        tentativas: 1
      })
    }

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioResult)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS', 
          details: twilioResult 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_sid: twilioResult.sid,
        phone: phoneWithCountryCode 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in send-sms function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)