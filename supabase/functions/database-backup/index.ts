import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequest {
  user_id: string
  backup_type: 'full' | 'incremental'
  tables?: string[]
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id, backup_type = 'full', tables }: BackupRequest = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Starting ${backup_type} backup for user: ${user_id}`)

    // Get user's units first
    const { data: unidades, error: unidadesError } = await supabase
      .from('unidades')
      .select('id')
      .eq('user_id', user_id)

    if (unidadesError) throw unidadesError

    const unidadeIds = unidades?.map(u => u.id) || []

    if (unidadeIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No units found for user, nothing to backup',
          backup_data: {} 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const backupData: any = {
      timestamp: new Date().toISOString(),
      user_id,
      backup_type,
      unidade_ids: unidadeIds
    }

    // Define tables to backup
    const tablesToBackup = tables || [
      'unidades',
      'profissionais', 
      'servicos',
      'clientes',
      'agendamentos',
      'movimentacoes_financeiras',
      'configuracoes_agendamento',
      'templates_mensagens'
    ]

    // Backup each table's data
    for (const table of tablesToBackup) {
      try {
        let query = supabase.from(table).select('*')

        // Filter by unidade_id if the table has this column
        if (['profissionais', 'servicos', 'clientes', 'agendamentos', 'movimentacoes_financeiras', 'configuracoes_agendamento', 'templates_mensagens'].includes(table)) {
          query = query.in('unidade_id', unidadeIds)
        } else if (table === 'unidades') {
          query = query.eq('user_id', user_id)
        }

        // For incremental backup, only get recent data (last 30 days)
        if (backup_type === 'incremental' && ['agendamentos', 'movimentacoes_financeiras'].includes(table)) {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          query = query.gte('created_at', thirtyDaysAgo.toISOString())
        }

        const { data, error } = await query

        if (error) {
          console.error(`Error backing up table ${table}:`, error)
          backupData[table] = { error: error.message }
        } else {
          backupData[table] = data || []
          console.log(`Backed up ${data?.length || 0} records from ${table}`)
        }
      } catch (tableError) {
        console.error(`Error processing table ${table}:`, tableError)
        backupData[table] = { error: tableError }
      }
    }

    // Log backup operation
    try {
      await supabase.from('logs_notificacoes').insert({
        agendamento_id: null,
        tipo: 'backup',
        canal: 'system',
        destinatario: user_id,
        status: 'concluido',
        resposta_api: {
          backup_type,
          tables_count: tablesToBackup.length,
          timestamp: backupData.timestamp
        },
        tentativas: 1
      })
    } catch (logError) {
      console.error('Error logging backup operation:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${backup_type} backup completed successfully`,
        backup_data: backupData,
        tables_backed_up: tablesToBackup.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in database-backup function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)