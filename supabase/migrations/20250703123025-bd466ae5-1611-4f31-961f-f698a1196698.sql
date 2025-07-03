-- Adicionar dados de teste para agendamentos e profissionais para demonstrar comissões

-- Primeiro, adicionar alguns profissionais com comissões definidas
INSERT INTO public.profissionais (
  unidade_id,
  nome,
  email,
  telefone,
  comissao_percentual,
  especialidades,
  ativo
)
SELECT 
  u.id as unidade_id,
  'João Silva' as nome,
  'joao@barbearia.com' as email,
  '(11) 99999-1234' as telefone,
  30.0 as comissao_percentual,
  ARRAY['Corte', 'Barba', 'Combo'] as especialidades,
  true as ativo
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1
ON CONFLICT (unidade_id, nome) DO NOTHING;

INSERT INTO public.profissionais (
  unidade_id,
  nome,
  email,
  telefone,
  comissao_percentual,
  especialidades,
  ativo
)
SELECT 
  u.id as unidade_id,
  'Carlos Mendes' as nome,
  'carlos@barbearia.com' as email,
  '(11) 99999-5678' as telefone,
  25.0 as comissao_percentual,
  ARRAY['Corte', 'Barba'] as especialidades,
  true as ativo
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1
ON CONFLICT (unidade_id, nome) DO NOTHING;

-- Adicionar alguns serviços se não existirem
INSERT INTO public.servicos (
  unidade_id,
  nome,
  preco,
  duracao_minutos,
  categoria,
  descricao,
  ativo
)
SELECT 
  u.id as unidade_id,
  'Corte Masculino' as nome,
  35.00 as preco,
  30 as duracao_minutos,
  'Corte' as categoria,
  'Corte tradicional masculino' as descricao,
  true as ativo
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1
ON CONFLICT (unidade_id, nome) DO NOTHING;

INSERT INTO public.servicos (
  unidade_id,
  nome,
  preco,
  duracao_minutos,
  categoria,
  descricao,
  ativo
)
SELECT 
  u.id as unidade_id,
  'Barba Completa' as nome,
  25.00 as preco,
  20 as duracao_minutos,
  'Barba' as categoria,
  'Barba completa com toalha quente' as descricao,
  true as ativo
FROM public.unidades u
WHERE u.ativo = true
LIMIT 1
ON CONFLICT (unidade_id, nome) DO NOTHING;

-- Adicionar agendamentos concluídos para gerar comissões
INSERT INTO public.agendamentos (
  unidade_id,
  profissional_id,
  servico_id,
  cliente_nome,
  cliente_telefone,
  cliente_email,
  data_hora,
  duracao_minutos,
  preco,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  p.id as profissional_id,
  s.id as servico_id,
  'João da Silva' as cliente_nome,
  '(11) 98765-4321' as cliente_telefone,
  'joao.cliente@email.com' as cliente_email,
  (CURRENT_DATE - interval '3 days')::date + TIME '10:00:00' as data_hora,
  s.duracao_minutos,
  s.preco,
  'concluido' as status,
  'Cliente satisfeito' as observacoes
FROM public.unidades u
JOIN public.profissionais p ON p.unidade_id = u.id AND p.nome = 'João Silva'
JOIN public.servicos s ON s.unidade_id = u.id AND s.nome = 'Corte Masculino'
WHERE u.ativo = true
LIMIT 1;

INSERT INTO public.agendamentos (
  unidade_id,
  profissional_id,
  servico_id,
  cliente_nome,
  cliente_telefone,
  cliente_email,
  data_hora,
  duracao_minutos,
  preco,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  p.id as profissional_id,
  s.id as servico_id,
  'Maria Santos' as cliente_nome,
  '(11) 98765-1111' as cliente_telefone,
  'maria@email.com' as cliente_email,
  (CURRENT_DATE - interval '2 days')::date + TIME '14:30:00' as data_hora,
  s.duracao_minutos,
  s.preco,
  'concluido' as status,
  'Primeira vez na barbearia' as observacoes
FROM public.unidades u
JOIN public.profissionais p ON p.unidade_id = u.id AND p.nome = 'Carlos Mendes'
JOIN public.servicos s ON s.unidade_id = u.id AND s.nome = 'Barba Completa'
WHERE u.ativo = true
LIMIT 1;

INSERT INTO public.agendamentos (
  unidade_id,
  profissional_id,
  servico_id,
  cliente_nome,
  cliente_telefone,
  cliente_email,
  data_hora,
  duracao_minutos,
  preco,
  status,
  observacoes
)
SELECT 
  u.id as unidade_id,
  p.id as profissional_id,
  s.id as servico_id,
  'Pedro Oliveira' as cliente_nome,
  '(11) 98765-2222' as cliente_telefone,
  'pedro@email.com' as cliente_email,
  (CURRENT_DATE - interval '1 day')::date + TIME '16:00:00' as data_hora,
  s.duracao_minutos,
  s.preco,
  'concluido' as status,
  'Cliente regular' as observacoes
FROM public.unidades u
JOIN public.profissionais p ON p.unidade_id = u.id AND p.nome = 'João Silva'
JOIN public.servicos s ON s.unidade_id = u.id AND s.nome = 'Corte Masculino'
WHERE u.ativo = true
LIMIT 1;