-- Adicionar dados de teste para demonstração do sistema financeiro
-- Primeiro, vamos inserir algumas movimentações financeiras de exemplo

INSERT INTO public.movimentacoes_financeiras (
  unidade_id,
  tipo,
  categoria,
  descricao,
  valor,
  data_vencimento,
  data_pagamento,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  'receita' as tipo,
  'Serviços' as categoria,
  'Receita de agendamentos - ' || to_char(CURRENT_DATE - interval '5 days', 'DD/MM/YYYY') as descricao,
  850.00 as valor,
  (CURRENT_DATE - interval '5 days')::date as data_vencimento,
  (CURRENT_DATE - interval '5 days')::date as data_pagamento,
  'pago' as status,
  'Receita dos serviços prestados' as observacoes
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1;

INSERT INTO public.movimentacoes_financeiras (
  unidade_id,
  tipo,
  categoria,
  descricao,
  valor,
  data_vencimento,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  'despesa' as tipo,
  'Aluguel' as categoria,
  'Aluguel do mês - ' || to_char(CURRENT_DATE, 'MM/YYYY') as descricao,
  1200.00 as valor,
  (CURRENT_DATE + interval '5 days')::date as data_vencimento,
  'pendente' as status,
  'Aluguel mensal da unidade' as observacoes
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1;

INSERT INTO public.movimentacoes_financeiras (
  unidade_id,
  tipo,
  categoria,
  descricao,
  valor,
  data_vencimento,
  data_pagamento,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  'receita' as tipo,
  'Produtos' as categoria,
  'Venda de produtos - ' || to_char(CURRENT_DATE - interval '2 days', 'DD/MM/YYYY') as descricao,
  180.00 as valor,
  (CURRENT_DATE - interval '2 days')::date as data_vencimento,
  (CURRENT_DATE - interval '2 days')::date as data_pagamento,
  'pago' as status,
  'Venda de pomadas e produtos' as observacoes
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1;

INSERT INTO public.movimentacoes_financeiras (
  unidade_id,
  tipo,
  categoria,
  descricao,
  valor,
  data_vencimento,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  'despesa' as tipo,
  'Materiais' as categoria,
  'Compra de materiais e produtos' as descricao,
  320.00 as valor,
  CURRENT_DATE::date as data_vencimento,
  'pendente' as status,
  'Reposição de estoque' as observacoes
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1;

INSERT INTO public.movimentacoes_financeiras (
  unidade_id,
  tipo,
  categoria,
  descricao,
  valor,
  data_vencimento,
  data_pagamento,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  'receita' as tipo,
  'Serviços' as categoria,
  'Receita de agendamentos - ' || to_char(CURRENT_DATE - interval '1 day', 'DD/MM/YYYY') as descricao,
  420.00 as valor,
  (CURRENT_DATE - interval '1 day')::date as data_vencimento,
  (CURRENT_DATE - interval '1 day')::date as data_pagamento,
  'pago' as status,
  'Serviços realizados ontem' as observacoes
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1;