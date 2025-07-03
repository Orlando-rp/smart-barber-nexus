-- Função para criar histórico automaticamente
CREATE OR REPLACE FUNCTION public.criar_historico_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir no histórico dependendo da operação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.agendamento_historico (
      agendamento_id, acao, data_nova, status_novo, usuario_id
    ) VALUES (
      NEW.id, 'criado', NEW.data_hora, NEW.status, auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Verificar se houve mudança significativa
    IF OLD.data_hora != NEW.data_hora OR OLD.status != NEW.status THEN
      INSERT INTO public.agendamento_historico (
        agendamento_id, acao, data_anterior, data_nova, 
        status_anterior, status_novo, usuario_id
      ) VALUES (
        NEW.id, 
        CASE 
          WHEN OLD.data_hora != NEW.data_hora THEN 'reagendado'
          WHEN NEW.status = 'cancelado' THEN 'cancelado'
          WHEN NEW.status = 'confirmado' THEN 'confirmado'
          WHEN NEW.status = 'concluído' THEN 'concluido'
          ELSE 'atualizado'
        END,
        OLD.data_hora, NEW.data_hora, 
        OLD.status, NEW.status, auth.uid()
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Criar trigger para histórico automático
CREATE TRIGGER trigger_historico_agendamento
  AFTER INSERT OR UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_historico_agendamento();