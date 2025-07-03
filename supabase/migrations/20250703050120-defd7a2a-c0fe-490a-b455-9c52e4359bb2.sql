-- Adicionar RLS policies para as novas tabelas

-- Políticas para agendamento_historico
CREATE POLICY "Super admins podem ver todo histórico" 
ON public.agendamento_historico 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver histórico de suas unidades" 
ON public.agendamento_historico 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agendamentos a
    JOIN public.unidades u ON u.id = a.unidade_id
    WHERE a.id = agendamento_historico.agendamento_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'client_owner', u.saas_client_id)
      OR public.has_role(auth.uid(), 'barber', u.saas_client_id)
      OR public.has_role(auth.uid(), 'receptionist', u.saas_client_id)
    )
  )
);

-- Políticas para configuracoes_agendamento
CREATE POLICY "Super admins podem gerenciar todas configurações" 
ON public.configuracoes_agendamento 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver configurações de suas unidades" 
ON public.configuracoes_agendamento 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = configuracoes_agendamento.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Proprietários podem atualizar configurações" 
ON public.configuracoes_agendamento 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = configuracoes_agendamento.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
    AND public.has_role(auth.uid(), 'client_owner', u.saas_client_id)
  )
);

-- Políticas para templates_mensagens
CREATE POLICY "Super admins podem gerenciar todos templates" 
ON public.templates_mensagens 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver templates de suas unidades" 
ON public.templates_mensagens 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = templates_mensagens.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
  )
);

CREATE POLICY "Proprietários podem gerenciar templates" 
ON public.templates_mensagens 
FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.unidades u 
    WHERE u.id = templates_mensagens.unidade_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
    AND public.has_role(auth.uid(), 'client_owner', u.saas_client_id)
  )
);

-- Políticas para logs_notificacoes
CREATE POLICY "Super admins podem ver todos logs" 
ON public.logs_notificacoes 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Usuários podem ver logs de suas unidades" 
ON public.logs_notificacoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agendamentos a
    JOIN public.unidades u ON u.id = a.unidade_id
    WHERE a.id = logs_notificacoes.agendamento_id
    AND u.saas_client_id = public.get_user_saas_client_id(auth.uid())
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_configuracoes_agendamento_updated_at
  BEFORE UPDATE ON public.configuracoes_agendamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_mensagens_updated_at
  BEFORE UPDATE ON public.templates_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();