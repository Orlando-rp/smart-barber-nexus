-- Fase 1: Expandir estrutura do banco de dados para sistema de agendamento inteligente

-- 1. Adicionar campos necessários à tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN cliente_nome TEXT,
ADD COLUMN cliente_telefone TEXT,
ADD COLUMN cliente_email TEXT,
ADD COLUMN token_link TEXT UNIQUE,
ADD COLUMN reagendamentos_count INTEGER DEFAULT 0,
ADD COLUMN agendamento_origem TEXT DEFAULT 'admin' CHECK (agendamento_origem IN ('admin', 'publico', 'whatsapp'));

-- Tornar cliente_id opcional para permitir agendamentos sem cadastro prévio
ALTER TABLE public.agendamentos ALTER COLUMN cliente_id DROP NOT NULL;

-- Adicionar índices para performance
CREATE INDEX idx_agendamentos_token_link ON public.agendamentos(token_link);
CREATE INDEX idx_agendamentos_cliente_telefone ON public.agendamentos(cliente_telefone);
CREATE INDEX idx_agendamentos_data_hora ON public.agendamentos(data_hora);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);

-- 2. Criar tabela de histórico de agendamentos
CREATE TABLE public.agendamento_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  acao TEXT NOT NULL CHECK (acao IN ('criado', 'confirmado', 'reagendado', 'cancelado', 'concluido', 'notificado')),
  data_anterior TIMESTAMP WITH TIME ZONE,
  data_nova TIMESTAMP WITH TIME ZONE,
  status_anterior TEXT,
  status_novo TEXT,
  motivo TEXT,
  usuario_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agendamento_historico ENABLE ROW LEVEL SECURITY;

-- 3. Criar tabela de configurações de agendamento por unidade
CREATE TABLE public.configuracoes_agendamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL UNIQUE REFERENCES public.unidades(id) ON DELETE CASCADE,
  antecedencia_minima_horas INTEGER DEFAULT 2,
  max_reagendamentos INTEGER DEFAULT 3,
  permite_cancelamento BOOLEAN DEFAULT true,
  horario_limite_cancelamento INTEGER DEFAULT 2,
  permite_agendamento_publico BOOLEAN DEFAULT true,
  slug_publico TEXT UNIQUE,
  cor_tema TEXT DEFAULT '#1a365d',
  logo_url TEXT,
  mensagem_boas_vindas TEXT DEFAULT 'Bem-vindo! Selecione seu horário.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configuracoes_agendamento ENABLE ROW LEVEL SECURITY;

-- 4. Criar tabela de templates de mensagens
CREATE TABLE public.templates_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('confirmacao', 'lembrete_1dia', 'lembrete_2h', 'agradecimento', 'cancelamento', 'reagendamento')),
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email', 'sms')),
  template TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(unidade_id, tipo, canal)
);

-- Enable RLS
ALTER TABLE public.templates_mensagens ENABLE ROW LEVEL SECURITY;

-- 5. Criar tabela de logs de notificações
CREATE TABLE public.logs_notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  canal TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('enviado', 'falha', 'pendente')),
  resposta_api JSONB,
  tentativas INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logs_notificacoes ENABLE ROW LEVEL SECURITY;

-- 6. Inserir configurações padrão para unidades existentes
INSERT INTO public.configuracoes_agendamento (unidade_id, slug_publico)
SELECT 
  id, 
  LOWER(REGEXP_REPLACE(REGEXP_REPLACE(nome, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
FROM public.unidades
ON CONFLICT (unidade_id) DO NOTHING;

-- 7. Inserir templates padrão de mensagens (corrigido)
INSERT INTO public.templates_mensagens (unidade_id, tipo, canal, template) 
SELECT u.id, 'confirmacao', 'whatsapp', 'Olá {{cliente_nome}}! ✅ Seu agendamento foi confirmado para {{data_hora}} com {{profissional_nome}}. Serviço: {{servico_nome}}. Para reagendar ou cancelar: {{link_agendamento}}'
FROM public.unidades u;

INSERT INTO public.templates_mensagens (unidade_id, tipo, canal, template) 
SELECT u.id, 'lembrete_1dia', 'whatsapp', 'Olá {{cliente_nome}}! 📅 Lembrete: você tem agendamento amanhã às {{hora}} com {{profissional_nome}}. Local: {{unidade_nome}}. Para reagendar: {{link_agendamento}}'
FROM public.unidades u;

INSERT INTO public.templates_mensagens (unidade_id, tipo, canal, template) 
SELECT u.id, 'lembrete_2h', 'whatsapp', 'Olá {{cliente_nome}}! ⏰ Seu agendamento é em 2 horas ({{hora}}) com {{profissional_nome}}. Nos vemos em breve! {{unidade_endereco}}'
FROM public.unidades u;

INSERT INTO public.templates_mensagens (unidade_id, tipo, canal, template) 
SELECT u.id, 'agradecimento', 'whatsapp', 'Obrigado {{cliente_nome}}! 🙏 Esperamos que tenha gostado do atendimento com {{profissional_nome}}. Avalie nosso serviço: {{link_avaliacao}}'
FROM public.unidades u;

INSERT INTO public.templates_mensagens (unidade_id, tipo, canal, template) 
SELECT u.id, 'cancelamento', 'whatsapp', 'Agendamento cancelado ❌ Olá {{cliente_nome}}, seu agendamento de {{data_hora}} foi cancelado. Para reagendar: {{link_agendamento}}'
FROM public.unidades u;

-- 8. Função para gerar token único de agendamento
CREATE OR REPLACE FUNCTION public.generate_agendamento_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(24), 'base64');
  token := REPLACE(token, '/', '_');
  token := REPLACE(token, '+', '-');
  token := REPLACE(token, '=', '');
  RETURN token;
END;
$$;

-- 9. Trigger para gerar token automaticamente
CREATE OR REPLACE FUNCTION public.gerar_token_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.token_link IS NULL THEN
    NEW.token_link := public.generate_agendamento_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_gerar_token
  BEFORE INSERT ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_token_agendamento();