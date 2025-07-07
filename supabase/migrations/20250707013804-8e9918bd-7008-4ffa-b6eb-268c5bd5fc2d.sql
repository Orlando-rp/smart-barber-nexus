-- Corrigir política RLS para permitir criação de saas_client na contratação
-- Primeiro, dropar a política existente problemática
DROP POLICY IF EXISTS "Permitir criação de clientes SaaS melhorada" ON public.saas_clients;

-- Criar nova política que permite usuários autenticados criarem seu primeiro cliente SaaS
CREATE POLICY "Permitir criação de cliente SaaS na contratação" 
ON public.saas_clients 
FOR INSERT 
WITH CHECK (
  -- Super admins podem sempre criar
  has_role(auth.uid(), 'super_admin'::user_role) 
  OR 
  -- Usuários autenticados que ainda não têm saas_client podem criar seu primeiro
  (auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND saas_client_id IS NOT NULL
  ))
);

-- Garantir que cada usuário pode ter apenas um saas_client_id
-- Atualizar constraint na tabela user_profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_user_id_saas_client_unique' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT user_profiles_user_id_saas_client_unique 
    UNIQUE (user_id, saas_client_id);
  END IF;
END $$;