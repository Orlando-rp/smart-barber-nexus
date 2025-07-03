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
  horario_limite_cancelamento INTEGER DEFAULT 2, -- horas antes
  permite_agendamento_publico BOOLEAN DEFAULT true,
  slug_publico TEXT UNIQUE, -- para URL pública: /agendar/[slug]
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

-- 7. Inserir templates padrão de mensagens
INSERT INTO public.templates_mensagens (unidade_id, tipo, canal, template) 
SELECT 
  u.id,
  unnest(ARRAY['confirmacao', 'lembrete_1dia', 'lembrete_2h', 'agradecimento', 'cancelamento']),
  'whatsapp',
  CASE unnest(ARRAY['confirmacao', 'lembrete_1dia', 'lembrete_2h', 'agradecimento', 'cancelamento'])
    WHEN 'confirmacao' THEN 'Olá {{cliente_nome}}! ✅ Seu agendamento foi confirmado para {{data_hora}} com {{profissional_nome}}. Serviço: {{servico_nome}}. Para reagendar ou cancelar: {{link_agendamento}}'
    WHEN 'lembrete_1dia' THEN 'Olá {{cliente_nome}}! 📅 Lembrete: você tem agendamento amanhã às {{hora}} com {{profissional_nome}}. Local: {{unidade_nome}}. Para reagendar: {{link_agendamento}}'
    WHEN 'lembrete_2h' THEN 'Olá {{cliente_nome}}! ⏰ Seu agendamento é em 2 horas ({{hora}}) com {{profissional_nome}}. Nos vemos em breve! {{unidade_endereco}}'
    WHEN 'agradecimento' THEN 'Obrigado {{cliente_nome}}! 🙏 Esperamos que tenha gostado do atendimento com {{profissional_nome}}. Avalie nosso serviço: {{link_avaliacao}}'
    WHEN 'cancelamento' THEN 'Agendamento cancelado ❌ Olá {{cliente_nome}}, seu agendamento de {{data_hora}} foi cancelado. Para reagendar: {{link_agendamento}}'
  END
FROM public.unidades u
ON CONFLICT (unidade_id, tipo, canal) DO NOTHING;

-- 8. Políticas RLS para novas tabelas
-- Agendamento histórico
CREATE POLICY "Super admins podem ver todo histórico" 
ON public.agendamento_historico 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver histórico de suas unidades" 
ON public.agendamento_historico 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agendamentos a
    JOIN public.unidades u ON u.id = a.unidade_id
    WHERE a.id = agendamento_historico.agendamento_id
    AND (
      u.saas_client_id = public.get_user_saas_client_id(auth.uid())
      AND (
        public.has_role(auth.uid(), 'client_owner', u.saas_client_id)
        OR public.has_role(auth.uid(), 'barber', u.saas_client_id)
        OR public.has_role(auth.uid(), 'receptionist', u.saas_client_id)
      )
    )
  )
);

-- Configurações agendamento
CREATE POLICY "Super admins podem ver todas configurações" 
ON public.configuracoes_agendamento 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver configurações de suas unidades" 
ON public.configuracoes_agendamento 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = configuracoes_agendamento.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Proprietários podem atualizar configurações" 
ON public.configuracoes_agendamento 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = configuracoes_agendamento.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
    AND public.has_role(auth.uid(), 'client_owner', u.saas_client_id)
  )
);

-- Templates mensagens (políticas similares)
CREATE POLICY "Super admins podem gerenciar todos templates" 
ON public.templates_mensagens 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver templates de suas unidades" 
ON public.templates_mensagens 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = templates_mensagens.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Proprietários podem gerenciar templates" 
ON public.templates_mensagens 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = templates_mensagens.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
    AND public.has_role(auth.uid(), 'client_owner', u.saas_client_id)
  )
);

-- Logs notificações
CREATE POLICY "Usuários podem ver logs de suas unidades" 
ON public.logs_notificacoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agendamentos a
    JOIN public.unidades u ON u.id = a.unidade_id
    WHERE a.id = logs_notificacoes.agendamento_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
  )
);

-- 9. Função para gerar token único de agendamento
CREATE OR REPLACE FUNCTION public.generate_agendamento_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Gerar token único de 32 caracteres
  token := encode(gen_random_bytes(24), 'base64');
  token := REPLACE(token, '/', '_');
  token := REPLACE(token, '+', '-');
  token := REPLACE(token, '=', '');
  
  RETURN token;
END;
$$;

-- 10. Função para criar histórico automaticamente
CREATE OR REPLACE FUNCTION public.criar_historico_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir no histórico dependendo da operação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.agendamento_historico (
      agendamento_id, acao, data_nova, status_novo, usuario_id
    ) VALUES (
      NEW.id, 'criado', NEW.data_hora, NEW.status, auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Verificar se houve mudança significativa
    IF OLD.data_hora != NEW.data_hora OR OLD.status != NEW.status THEN
      INSERT INTO public.agendamento_historico (
        agendamento_id, acao, data_anterior, data_nova, 
        status_anterior, status_novo, usuario_id
      ) VALUES (
        NEW.id, 
        CASE 
          WHEN OLD.data_hora != NEW.data_hora THEN 'reagendado'
          WHEN NEW.status = 'cancelado' THEN 'cancelado'
          WHEN NEW.status = 'confirmado' THEN 'confirmado'
          WHEN NEW.status = 'concluído' THEN 'concluido'
          ELSE 'atualizado'
        END,
        OLD.data_hora, NEW.data_hora, 
        OLD.status, NEW.status, auth.uid()
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Criar trigger para histórico automático
CREATE TRIGGER trigger_historico_agendamento
  AFTER INSERT OR UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_historico_agendamento();

-- 11. Trigger para gerar token automaticamente
CREATE OR REPLACE FUNCTION public.gerar_token_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Gerar token se não foi fornecido
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

-- 12. Triggers para updated_at
CREATE TRIGGER update_configuracoes_agendamento_updated_at
  BEFORE UPDATE ON public.configuracoes_agendamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_mensagens_updated_at
  BEFORE UPDATE ON public.templates_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();