-- Inserir dados de demonstração para tornar o sistema produtivo
-- Primeiro, criar um cliente SaaS de demonstração
INSERT INTO public.saas_clients (nome, email, status, plano) VALUES 
('Barbearia Moderna Ltda', 'contato@barbeariamoderna.com', 'ativo', 'premium')
ON CONFLICT DO NOTHING;

-- Criar unidade de demonstração
INSERT INTO public.unidades (nome, user_id, endereco, telefone, saas_client_id) 
SELECT 
  'Barbearia Moderna - Centro',
  auth.uid(),
  'Rua das Flores, 123 - Centro',
  '(11) 98765-4321',
  sc.id
FROM public.saas_clients sc 
WHERE sc.email = 'contato@barbeariamoderna.com'
ON CONFLICT DO NOTHING;

-- Criar profissionais de demonstração
INSERT INTO public.profissionais (nome, telefone, email, unidade_id, especialidades) 
SELECT 
  'João Silva',
  '(11) 99999-1111',
  'joao@barbeariamoderna.com',
  u.id,
  ARRAY['Corte Masculino', 'Barba', 'Bigode']
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.profissionais (nome, telefone, email, unidade_id, especialidades) 
SELECT 
  'Maria Santos',
  '(11) 99999-2222',
  'maria@barbeariamoderna.com',
  u.id,
  ARRAY['Corte Feminino', 'Escova', 'Tratamentos']
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

-- Criar serviços de demonstração
INSERT INTO public.servicos (nome, preco, duracao_minutos, categoria, descricao, unidade_id) 
SELECT 
  'Corte Masculino',
  35.00,
  30,
  'corte',
  'Corte tradicional masculino com acabamento',
  u.id
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicos (nome, preco, duracao_minutos, categoria, descricao, unidade_id) 
SELECT 
  'Barba + Bigode',
  25.00,
  20,
  'barba',
  'Aparar barba e bigode com navalha',
  u.id
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicos (nome, preco, duracao_minutos, categoria, descricao, unidade_id) 
SELECT 
  'Corte + Barba',
  50.00,
  45,
  'combo',
  'Pacote completo: corte masculino + barba',
  u.id
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

-- Criar clientes de demonstração
INSERT INTO public.clientes (nome, telefone, email, unidade_id, total_visitas) 
SELECT 
  'Carlos Oliveira',
  '(11) 97777-1111',
  'carlos@email.com',
  u.id,
  5
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.clientes (nome, telefone, email, unidade_id, total_visitas) 
SELECT 
  'Pedro Costa',
  '(11) 97777-2222',
  'pedro@email.com',
  u.id,
  3
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.clientes (nome, telefone, email, unidade_id, total_visitas) 
SELECT 
  'Ana Silva',
  '(11) 97777-3333',
  'ana@email.com',
  u.id,
  2
FROM public.unidades u 
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

-- Criar agendamentos de demonstração
INSERT INTO public.agendamentos (
  cliente_id, profissional_id, servico_id, data_hora, 
  duracao_minutos, preco, status, agendamento_origem, unidade_id
)
SELECT 
  c.id,
  p.id,
  s.id,
  NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
  s.duracao_minutos,
  s.preco,
  'confirmado',
  'admin',
  u.id
FROM public.unidades u
JOIN public.clientes c ON c.unidade_id = u.id AND c.nome = 'Carlos Oliveira'
JOIN public.profissionais p ON p.unidade_id = u.id AND p.nome = 'João Silva'
JOIN public.servicos s ON s.unidade_id = u.id AND s.nome = 'Corte + Barba'
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.agendamentos (
  cliente_id, profissional_id, servico_id, data_hora, 
  duracao_minutos, preco, status, agendamento_origem, unidade_id
)
SELECT 
  c.id,
  p.id,
  s.id,
  NOW() + INTERVAL '2 days' + INTERVAL '14 hours',
  s.duracao_minutos,
  s.preco,
  'pendente',
  'publico',
  u.id
FROM public.unidades u
JOIN public.clientes c ON c.unidade_id = u.id AND c.nome = 'Pedro Costa'
JOIN public.profissionais p ON p.unidade_id = u.id AND p.nome = 'Maria Santos'
JOIN public.servicos s ON s.unidade_id = u.id AND s.nome = 'Corte Masculino'
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

-- Criar movimentações financeiras de demonstração
INSERT INTO public.movimentacoes_financeiras (
  tipo, categoria, descricao, valor, data_vencimento, 
  status, agendamento_id, unidade_id
)
SELECT 
  'receita',
  'servicos',
  'Pagamento - Corte + Barba',
  50.00,
  CURRENT_DATE,
  'pago',
  a.id,
  u.id
FROM public.unidades u
JOIN public.agendamentos a ON a.unidade_id = u.id
JOIN public.servicos s ON s.id = a.servico_id AND s.nome = 'Corte + Barba'
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;

INSERT INTO public.movimentacoes_financeiras (
  tipo, categoria, descricao, valor, data_vencimento, 
  status, unidade_id
)
SELECT 
  'despesa',
  'aluguel',
  'Aluguel do imóvel - Março 2025',
  2500.00,
  CURRENT_DATE + INTERVAL '5 days',
  'pendente',
  u.id
FROM public.unidades u
WHERE u.nome = 'Barbearia Moderna - Centro'
ON CONFLICT DO NOTHING;