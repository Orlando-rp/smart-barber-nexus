-- Criar sistema multi-tenant com super admin

-- Enum para tipos de roles no sistema
CREATE TYPE public.user_role AS ENUM ('super_admin', 'client_owner', 'barber', 'receptionist');

-- Tabela de clientes SaaS (barbearias como clientes do SaaS)
CREATE TABLE public.saas_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  endereco TEXT,
  cnpj TEXT,
  plano TEXT DEFAULT 'basico' CHECK (plano IN ('basico', 'premium', 'enterprise')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado')),
  data_vencimento DATE,
  limite_unidades INTEGER DEFAULT 1,
  limite_usuarios INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de perfis de usuário (estende auth.users)
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE, -- referência ao auth.users
  saas_client_id UUID REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles dos usuários
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- referência ao auth.users
  saas_client_id UUID REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, saas_client_id, role)
);

-- Atualizar tabela de unidades para referenciar clientes SaaS
ALTER TABLE public.unidades 
ADD COLUMN saas_client_id UUID REFERENCES public.saas_clients(id) ON DELETE CASCADE;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.saas_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role, _saas_client_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _saas_client_id IS NULL 
        OR saas_client_id = _saas_client_id 
        OR _role = 'super_admin'
      )
  )
$$;

-- Função para obter cliente SaaS do usuário
CREATE OR REPLACE FUNCTION public.get_user_saas_client_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT saas_client_id
  FROM public.user_profiles
  WHERE user_id = _user_id
$$;

-- Políticas RLS para saas_clients
CREATE POLICY "Super admins podem ver todos os clientes SaaS" 
ON public.saas_clients 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins podem criar clientes SaaS" 
ON public.saas_clients 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins podem atualizar clientes SaaS" 
ON public.saas_clients 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Proprietários podem ver seu próprio cliente SaaS" 
ON public.saas_clients 
FOR SELECT 
USING (
  id = public.get_user_saas_client_id(auth.uid())
  AND public.has_role(auth.uid(), 'client_owner', id)
);

-- Políticas RLS para user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.user_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins podem ver todos os perfis" 
ON public.user_profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários do mesmo cliente SaaS podem ver perfis" 
ON public.user_profiles 
FOR SELECT 
USING (
  saas_client_id = public.get_user_saas_client_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'client_owner', saas_client_id)
    OR public.has_role(auth.uid(), 'barber', saas_client_id)
    OR public.has_role(auth.uid(), 'receptionist', saas_client_id)
  )
);

CREATE POLICY "Usuários podem criar seu próprio perfil" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.user_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Políticas RLS para user_roles
CREATE POLICY "Super admins podem ver todos os roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins podem criar roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Proprietários podem ver roles de seu cliente SaaS" 
ON public.user_roles 
FOR SELECT 
USING (
  saas_client_id = public.get_user_saas_client_id(auth.uid())
  AND public.has_role(auth.uid(), 'client_owner', saas_client_id)
);

CREATE POLICY "Proprietários podem criar roles em seu cliente SaaS" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  saas_client_id = public.get_user_saas_client_id(auth.uid())
  AND public.has_role(auth.uid(), 'client_owner', saas_client_id)
  AND role IN ('barber', 'receptionist')
);

-- Atualizar políticas da tabela unidades para considerar saas_client_id
DROP POLICY IF EXISTS "Usuários podem ver suas próprias unidades" ON public.unidades;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias unidades" ON public.unidades;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias unidades" ON public.unidades;

CREATE POLICY "Super admins podem ver todas as unidades" 
ON public.unidades 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver unidades de seu cliente SaaS" 
ON public.unidades 
FOR SELECT 
USING (
  saas_client_id = public.get_user_saas_client_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'client_owner', saas_client_id)
    OR public.has_role(auth.uid(), 'barber', saas_client_id)
    OR public.has_role(auth.uid(), 'receptionist', saas_client_id)
  )
);

CREATE POLICY "Proprietários podem criar unidades em seu cliente SaaS" 
ON public.unidades 
FOR INSERT 
WITH CHECK (
  saas_client_id = public.get_user_saas_client_id(auth.uid())
  AND public.has_role(auth.uid(), 'client_owner', saas_client_id)
);

CREATE POLICY "Proprietários podem atualizar unidades de seu cliente SaaS" 
ON public.unidades 
FOR UPDATE 
USING (
  saas_client_id = public.get_user_saas_client_id(auth.uid())
  AND public.has_role(auth.uid(), 'client_owner', saas_client_id)
);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_saas_clients_updated_at
  BEFORE UPDATE ON public.saas_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função e trigger para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, nome, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Inserir dados iniciais - criar primeiro cliente SaaS (sua empresa)
INSERT INTO public.saas_clients (nome, email, plano, limite_unidades, limite_usuarios) 
VALUES ('BarberSmart SaaS', 'admin@barbersmart.com', 'enterprise', 999, 999);