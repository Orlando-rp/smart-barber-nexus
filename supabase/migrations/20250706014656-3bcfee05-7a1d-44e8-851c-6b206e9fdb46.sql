-- Criar enum para tipos de planos
CREATE TYPE public.plano_tipo AS ENUM ('basico', 'premium', 'enterprise');

-- Adicionar campos para controle de planos na tabela saas_clients
ALTER TABLE public.saas_clients 
ADD COLUMN IF NOT EXISTS plano_tipo plano_tipo DEFAULT 'basico',
ADD COLUMN IF NOT EXISTS preco_mensal DECIMAL(10,2) DEFAULT 49.90,
ADD COLUMN IF NOT EXISTS data_inicio_plano TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS data_proxima_cobranca TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
ADD COLUMN IF NOT EXISTS historico_planos JSONB DEFAULT '[]'::jsonb;

-- Atualizar limite padrões baseados no plano
UPDATE public.saas_clients 
SET limite_unidades = CASE 
  WHEN plano = 'basico' THEN 1
  WHEN plano = 'premium' THEN 3
  WHEN plano = 'enterprise' THEN 999
  ELSE 1
END,
limite_usuarios = CASE 
  WHEN plano = 'basico' THEN 3
  WHEN plano = 'premium' THEN 10
  WHEN plano = 'enterprise' THEN 999
  ELSE 3
END;

-- Função para verificar limites do plano
CREATE OR REPLACE FUNCTION public.check_plan_limits(
  _saas_client_id UUID,
  _resource_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  plan_limit INTEGER;
  client_plan TEXT;
BEGIN
  -- Buscar plano atual do cliente
  SELECT plano INTO client_plan
  FROM public.saas_clients 
  WHERE id = _saas_client_id;
  
  IF _resource_type = 'unidades' THEN
    -- Contar unidades atuais
    SELECT COUNT(*) INTO current_count
    FROM public.unidades 
    WHERE saas_client_id = _saas_client_id AND ativo = true;
    
    -- Buscar limite do plano
    SELECT limite_unidades INTO plan_limit
    FROM public.saas_clients 
    WHERE id = _saas_client_id;
    
  ELSIF _resource_type = 'usuarios' THEN
    -- Contar usuários atuais
    SELECT COUNT(*) INTO current_count
    FROM public.user_profiles 
    WHERE saas_client_id = _saas_client_id AND ativo = true;
    
    -- Buscar limite do plano
    SELECT limite_usuarios INTO plan_limit
    FROM public.saas_clients 
    WHERE id = _saas_client_id;
    
  ELSE
    RETURN FALSE;
  END IF;
  
  RETURN current_count < plan_limit;
END;
$$;

-- Função para atualizar plano
CREATE OR REPLACE FUNCTION public.update_client_plan(
  _saas_client_id UUID,
  _new_plan TEXT,
  _new_price DECIMAL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_plan TEXT;
  old_price DECIMAL;
BEGIN
  -- Buscar plano atual
  SELECT plano, preco_mensal INTO old_plan, old_price
  FROM public.saas_clients 
  WHERE id = _saas_client_id;
  
  -- Atualizar plano e limites
  UPDATE public.saas_clients 
  SET 
    plano = _new_plan,
    plano_tipo = _new_plan::plano_tipo,
    preco_mensal = _new_price,
    data_proxima_cobranca = NOW() + INTERVAL '1 month',
    limite_unidades = CASE 
      WHEN _new_plan = 'basico' THEN 1
      WHEN _new_plan = 'premium' THEN 3
      WHEN _new_plan = 'enterprise' THEN 999
      ELSE 1
    END,
    limite_usuarios = CASE 
      WHEN _new_plan = 'basico' THEN 3
      WHEN _new_plan = 'premium' THEN 10
      WHEN _new_plan = 'enterprise' THEN 999
      ELSE 3
    END,
    historico_planos = historico_planos || jsonb_build_object(
      'data_mudanca', NOW(),
      'plano_anterior', old_plan,
      'plano_novo', _new_plan,
      'preco_anterior', old_price,
      'preco_novo', _new_price
    )
  WHERE id = _saas_client_id;
  
  RETURN FOUND;
END;
$$;