-- Criar configuração de agendamento público para unidades existentes
INSERT INTO public.configuracoes_agendamento (
  unidade_id, 
  permite_agendamento_publico, 
  slug_publico,
  mensagem_boas_vindas,
  antecedencia_minima_horas,
  max_reagendamentos,
  permite_cancelamento,
  horario_limite_cancelamento
)
SELECT 
  u.id,
  true,
  LOWER(REPLACE(REPLACE(REPLACE(u.nome, ' ', '-'), 'ã', 'a'), 'ç', 'c')) || '-' || SUBSTR(u.id::text, 1, 8),
  'Bem-vindo à ' || u.nome || '! Selecione seu horário preferido.',
  2,
  3,
  true,
  2
FROM public.unidades u
WHERE NOT EXISTS (
  SELECT 1 FROM public.configuracoes_agendamento ca 
  WHERE ca.unidade_id = u.id
);