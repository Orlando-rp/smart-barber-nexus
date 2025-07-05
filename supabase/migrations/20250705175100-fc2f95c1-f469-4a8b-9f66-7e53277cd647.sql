-- Melhorar política RLS para saas_clients
-- Dropar a política existente e criar uma nova mais específica
DROP POLICY IF EXISTS "Permitir criação de clientes SaaS" ON public.saas_clients;

-- Criar função auxiliar para verificar se usuário pode criar saas_client
CREATE OR REPLACE FUNCTION public.can_create_saas_client(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = _user_id AND saas_client_id IS NOT NULL
  ) OR has_role(_user_id, 'super_admin'::user_role)
$$;

-- Nova política melhorada para criação de saas_clients
CREATE POLICY "Permitir criação de clientes SaaS melhorada" 
ON public.saas_clients 
FOR INSERT 
WITH CHECK (
  -- Super admins podem sempre criar
  has_role(auth.uid(), 'super_admin'::user_role) 
  OR 
  -- Usuários autenticados que ainda não têm saas_client podem criar
  (auth.uid() IS NOT NULL AND can_create_saas_client(auth.uid()))
);