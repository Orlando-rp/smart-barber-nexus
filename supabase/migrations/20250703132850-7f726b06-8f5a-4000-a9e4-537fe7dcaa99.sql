-- Criar dados de demonstração básicos apenas se não existirem
-- Verificar se já existe uma unidade para o usuário atual
DO $$
DECLARE
    current_user_id uuid := auth.uid();
    existing_unidade_count integer;
BEGIN
    -- Verificar se o usuário já tem unidades
    SELECT COUNT(*) INTO existing_unidade_count 
    FROM public.unidades 
    WHERE user_id = current_user_id;
    
    -- Se não tem unidades, criar dados de demonstração
    IF existing_unidade_count = 0 THEN
        -- Criar unidade de demonstração
        INSERT INTO public.unidades (nome, user_id, endereco, telefone) 
        VALUES (
            'Barbearia Demo',
            current_user_id,
            'Rua das Flores, 123 - Centro',
            '(11) 98765-4321'
        );
        
        -- Criar profissionais de demonstração
        INSERT INTO public.profissionais (nome, telefone, email, unidade_id, especialidades) 
        SELECT 
            'João Silva',
            '(11) 99999-1111',
            'joao@demo.com',
            u.id,
            ARRAY['Corte Masculino', 'Barba', 'Bigode']
        FROM public.unidades u 
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
        INSERT INTO public.profissionais (nome, telefone, email, unidade_id, especialidades) 
        SELECT 
            'Maria Santos',
            '(11) 99999-2222',
            'maria@demo.com',
            u.id,
            ARRAY['Corte Feminino', 'Escova', 'Tratamentos']
        FROM public.unidades u 
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
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
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
        INSERT INTO public.servicos (nome, preco, duracao_minutos, categoria, descricao, unidade_id) 
        SELECT 
            'Barba + Bigode',
            25.00,
            20,
            'barba',
            'Aparar barba e bigode com navalha',
            u.id
        FROM public.unidades u 
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
        INSERT INTO public.servicos (nome, preco, duracao_minutos, categoria, descricao, unidade_id) 
        SELECT 
            'Corte + Barba',
            50.00,
            45,
            'combo',
            'Pacote completo: corte masculino + barba',
            u.id
        FROM public.unidades u 
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
        -- Criar clientes de demonstração
        INSERT INTO public.clientes (nome, telefone, email, unidade_id, total_visitas) 
        SELECT 
            'Carlos Oliveira',
            '(11) 97777-1111',
            'carlos@email.com',
            u.id,
            5
        FROM public.unidades u 
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
        INSERT INTO public.clientes (nome, telefone, email, unidade_id, total_visitas) 
        SELECT 
            'Pedro Costa',
            '(11) 97777-2222',
            'pedro@email.com',
            u.id,
            3
        FROM public.unidades u 
        WHERE u.user_id = current_user_id
        AND u.nome = 'Barbearia Demo';
        
    END IF;
END $$;