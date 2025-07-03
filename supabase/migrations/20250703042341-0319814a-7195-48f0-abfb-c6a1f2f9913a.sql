-- Criar estrutura básica para agendamentos do BarberSmart

-- Tabela de unidades (barbearias)
CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- proprietário da unidade
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  logo_url TEXT,
  horario_funcionamento JSONB DEFAULT '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}, "sabado": {"inicio": "08:00", "fim": "16:00"}, "domingo": null}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  categoria TEXT DEFAULT 'corte',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de profissionais
CREATE TABLE public.profissionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  user_id UUID, -- referência ao auth.users se for um usuário do sistema
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  especialidades TEXT[], -- array de especialidades
  horario_trabalho JSONB DEFAULT '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}, "sabado": {"inicio": "08:00", "fim": "16:00"}, "domingo": null}',
  comissao_percentual DECIMAL(5,2) DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_nascimento DATE,
  observacoes TEXT,
  ultima_visita TIMESTAMP WITH TIME ZONE,
  total_visitas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para unidades
CREATE POLICY "Usuários podem ver suas próprias unidades" 
ON public.unidades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias unidades" 
ON public.unidades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias unidades" 
ON public.unidades 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para serviços
CREATE POLICY "Usuários podem ver serviços de suas unidades" 
ON public.servicos 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = servicos.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem criar serviços em suas unidades" 
ON public.servicos 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.unidades WHERE id = servicos.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar serviços de suas unidades" 
ON public.servicos 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = servicos.unidade_id AND user_id = auth.uid()));

-- Políticas RLS para profissionais
CREATE POLICY "Usuários podem ver profissionais de suas unidades" 
ON public.profissionais 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = profissionais.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem criar profissionais em suas unidades" 
ON public.profissionais 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.unidades WHERE id = profissionais.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar profissionais de suas unidades" 
ON public.profissionais 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = profissionais.unidade_id AND user_id = auth.uid()));

-- Políticas RLS para clientes
CREATE POLICY "Usuários podem ver clientes de suas unidades" 
ON public.clientes 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = clientes.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem criar clientes em suas unidades" 
ON public.clientes 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.unidades WHERE id = clientes.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar clientes de suas unidades" 
ON public.clientes 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = clientes.unidade_id AND user_id = auth.uid()));

-- Políticas RLS para agendamentos
CREATE POLICY "Usuários podem ver agendamentos de suas unidades" 
ON public.agendamentos 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = agendamentos.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem criar agendamentos em suas unidades" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.unidades WHERE id = agendamentos.unidade_id AND user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar agendamentos de suas unidades" 
ON public.agendamentos 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.unidades WHERE id = agendamentos.unidade_id AND user_id = auth.uid()));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON public.unidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at
  BEFORE UPDATE ON public.profissionais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();