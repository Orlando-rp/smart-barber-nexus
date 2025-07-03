-- Adicionar dados de teste para agendamentos e profissionais para demonstrar comissões
-- Verificar se já existem dados antes de inserir

-- Adicionar alguns profissionais com comissões definidas (apenas se não existirem)
DO $$
DECLARE
    unit_id UUID;
    prof_count INTEGER;
    serv_count INTEGER;
BEGIN
    -- Buscar uma unidade ativa
    SELECT id INTO unit_id FROM public.unidades WHERE ativo = true LIMIT 1;
    
    IF unit_id IS NOT NULL THEN
        -- Verificar se já existem profissionais
        SELECT COUNT(*) INTO prof_count FROM public.profissionais WHERE unidade_id = unit_id;
        
        IF prof_count = 0 THEN
            -- Inserir profissionais apenas se não existirem
            INSERT INTO public.profissionais (
                unidade_id, nome, email, telefone, comissao_percentual, especialidades, ativo
            ) VALUES 
            (unit_id, 'João Silva', 'joao@barbearia.com', '(11) 99999-1234', 30.0, ARRAY['Corte', 'Barba', 'Combo'], true),
            (unit_id, 'Carlos Mendes', 'carlos@barbearia.com', '(11) 99999-5678', 25.0, ARRAY['Corte', 'Barba'], true);
        END IF;
        
        -- Verificar se já existem serviços
        SELECT COUNT(*) INTO serv_count FROM public.servicos WHERE unidade_id = unit_id;
        
        IF serv_count = 0 THEN
            -- Inserir serviços apenas se não existirem
            INSERT INTO public.servicos (
                unidade_id, nome, preco, duracao_minutos, categoria, descricao, ativo
            ) VALUES 
            (unit_id, 'Corte Masculino', 35.00, 30, 'Corte', 'Corte tradicional masculino', true),
            (unit_id, 'Barba Completa', 25.00, 20, 'Barba', 'Barba completa com toalha quente', true);
        END IF;
        
        -- Adicionar agendamentos concluídos para demonstrar comissões
        INSERT INTO public.agendamentos (
            unidade_id, profissional_id, servico_id, cliente_nome, cliente_telefone, cliente_email,
            data_hora, duracao_minutos, preco, status, observacoes
        )
        SELECT 
            unit_id,
            p.id,
            s.id,
            'João da Silva',
            '(11) 98765-4321',
            'joao.cliente@email.com',
            (CURRENT_DATE - interval '3 days')::timestamp + TIME '10:00:00',
            s.duracao_minutos,
            s.preco,
            'concluido',
            'Cliente satisfeito'
        FROM public.profissionais p, public.servicos s
        WHERE p.unidade_id = unit_id AND p.nome = 'João Silva'
          AND s.unidade_id = unit_id AND s.nome = 'Corte Masculino'
        LIMIT 1;
        
        INSERT INTO public.agendamentos (
            unidade_id, profissional_id, servico_id, cliente_nome, cliente_telefone, cliente_email,
            data_hora, duracao_minutos, preco, status, observacoes
        )
        SELECT 
            unit_id,
            p.id,
            s.id,
            'Maria Santos',
            '(11) 98765-1111',
            'maria@email.com',
            (CURRENT_DATE - interval '2 days')::timestamp + TIME '14:30:00',
            s.duracao_minutos,
            s.preco,
            'concluido',
            'Primeira vez na barbearia'
        FROM public.profissionais p, public.servicos s
        WHERE p.unidade_id = unit_id AND p.nome = 'Carlos Mendes'
          AND s.unidade_id = unit_id AND s.nome = 'Barba Completa'
        LIMIT 1;
        
        INSERT INTO public.agendamentos (
            unidade_id, profissional_id, servico_id, cliente_nome, cliente_telefone, cliente_email,
            data_hora, duracao_minutos, preco, status, observacoes
        )
        SELECT 
            unit_id,
            p.id,
            s.id,
            'Pedro Oliveira',
            '(11) 98765-2222',
            'pedro@email.com',
            (CURRENT_DATE - interval '1 day')::timestamp + TIME '16:00:00',
            s.duracao_minutos,
            s.preco,
            'concluido',
            'Cliente regular'
        FROM public.profissionais p, public.servicos s
        WHERE p.unidade_id = unit_id AND p.nome = 'João Silva'
          AND s.unidade_id = unit_id AND s.nome = 'Corte Masculino'
        LIMIT 1;
    END IF;
END $$;