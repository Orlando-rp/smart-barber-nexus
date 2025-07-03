export interface Agendamento {
  id: string
  unidade_id: string
  cliente_id?: string
  cliente_nome?: string
  cliente_telefone?: string
  cliente_email?: string
  profissional_id: string
  servico_id: string
  data_hora: string
  duracao_minutos: number
  preco: number
  status: 'pendente' | 'confirmado' | 'concluído' | 'cancelado'
  observacoes?: string
  token_link?: string
  reagendamentos_count?: number
  agendamento_origem?: 'admin' | 'publico' | 'whatsapp'
  created_at: string
  updated_at: string
}

export interface ConfiguracaoAgendamento {
  id: string
  unidade_id: string
  antecedencia_minima_horas: number
  max_reagendamentos: number
  permite_cancelamento: boolean
  horario_limite_cancelamento: number
  permite_agendamento_publico: boolean
  slug_publico?: string
  cor_tema: string
  logo_url?: string
  mensagem_boas_vindas: string
  created_at: string
  updated_at: string
}

export interface TemplateMensagem {
  id: string
  unidade_id: string
  tipo: 'confirmacao' | 'lembrete_1dia' | 'lembrete_2h' | 'agradecimento' | 'cancelamento' | 'reagendamento'
  canal: 'whatsapp' | 'email' | 'sms'
  template: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface LogNotificacao {
  id: string
  agendamento_id: string
  tipo: string
  canal: string
  destinatario: string
  status: 'enviado' | 'falha' | 'pendente'
  resposta_api?: any
  tentativas: number
  created_at: string
}

export interface AgendamentoHistorico {
  id: string
  agendamento_id: string
  acao: 'criado' | 'confirmado' | 'reagendado' | 'cancelado' | 'concluido' | 'notificado'
  data_anterior?: string
  data_nova?: string
  status_anterior?: string
  status_novo?: string
  motivo?: string
  usuario_id?: string
  created_at: string
}

export interface UnidadePublica {
  id: string
  nome: string
  endereco?: string
  telefone?: string
  horario_funcionamento?: any
  logo_url?: string
  configuracao?: ConfiguracaoAgendamento
}

export interface ProfissionalPublico {
  id: string
  nome: string
  especialidades?: string[]
  ativo: boolean
}

export interface ServicoPublico {
  id: string
  nome: string
  descricao?: string
  categoria?: string
  duracao_minutos: number
  preco: number
  ativo: boolean
}

export interface DisponibilidadeSlot {
  data_hora: string
  disponivel: boolean
  profissional_id: string
}

export interface NovoAgendamentoPublico {
  unidade_id: string
  cliente_nome: string
  cliente_telefone: string
  cliente_email?: string
  profissional_id: string
  servico_id: string
  data_hora: string
}

export interface AgendamentoToken {
  agendamento: Agendamento & {
    unidade: UnidadePublica
    profissional: ProfissionalPublico
    servico: ServicoPublico
  }
  pode_reagendar: boolean
  pode_cancelar: boolean
}