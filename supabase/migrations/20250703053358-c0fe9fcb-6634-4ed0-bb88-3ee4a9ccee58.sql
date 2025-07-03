-- Create waitlist table
CREATE TABLE public.fila_espera (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id),
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  cliente_email TEXT,
  profissional_id UUID REFERENCES public.profissionais(id),
  servico_id UUID NOT NULL REFERENCES public.servicos(id),
  data_preferida DATE,
  horario_preferido TEXT,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'contatado', 'agendado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on waitlist
ALTER TABLE public.fila_espera ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist
CREATE POLICY "Usuários podem ver fila de espera de suas unidades" 
ON public.fila_espera 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE unidades.id = fila_espera.unidade_id 
    AND unidades.saas_client_id = get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Usuários podem criar entradas na fila de espera de suas unidades" 
ON public.fila_espera 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE unidades.id = fila_espera.unidade_id 
    AND unidades.saas_client_id = get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Usuários podem atualizar fila de espera de suas unidades" 
ON public.fila_espera 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE unidades.id = fila_espera.unidade_id 
    AND unidades.saas_client_id = get_user_saas_client_id(auth.uid())
  )
);

-- Create financial movements table
CREATE TABLE public.movimentacoes_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  observacoes TEXT,
  agendamento_id UUID REFERENCES public.agendamentos(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on financial movements
ALTER TABLE public.movimentacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Create policies for financial movements
CREATE POLICY "Usuários podem ver movimentações de suas unidades" 
ON public.movimentacoes_financeiras 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE unidades.id = movimentacoes_financeiras.unidade_id 
    AND unidades.saas_client_id = get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Usuários podem criar movimentações em suas unidades" 
ON public.movimentacoes_financeiras 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE unidades.id = movimentacoes_financeiras.unidade_id 
    AND unidades.saas_client_id = get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Usuários podem atualizar movimentações de suas unidades" 
ON public.movimentacoes_financeiras 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE unidades.id = movimentacoes_financeiras.unidade_id 
    AND unidades.saas_client_id = get_user_saas_client_id(auth.uid())
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_fila_espera_updated_at
  BEFORE UPDATE ON public.fila_espera
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add status to agendamentos for better tracking
ALTER TABLE public.agendamentos 
ALTER COLUMN status TYPE TEXT,
ADD CONSTRAINT agendamentos_status_check 
CHECK (status IN ('pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou'));