export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agendamento_historico: {
        Row: {
          acao: string
          agendamento_id: string
          created_at: string
          data_anterior: string | null
          data_nova: string | null
          id: string
          motivo: string | null
          status_anterior: string | null
          status_novo: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          agendamento_id: string
          created_at?: string
          data_anterior?: string | null
          data_nova?: string | null
          id?: string
          motivo?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          agendamento_id?: string
          created_at?: string
          data_anterior?: string | null
          data_nova?: string | null
          id?: string
          motivo?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_historico_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          agendamento_origem: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          created_at: string
          data_hora: string
          duracao_minutos: number
          id: string
          observacoes: string | null
          preco: number
          profissional_id: string
          reagendamentos_count: number | null
          servico_id: string
          status: string
          token_link: string | null
          unidade_id: string
          updated_at: string
        }
        Insert: {
          agendamento_origem?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          created_at?: string
          data_hora: string
          duracao_minutos: number
          id?: string
          observacoes?: string | null
          preco: number
          profissional_id: string
          reagendamentos_count?: number | null
          servico_id: string
          status?: string
          token_link?: string | null
          unidade_id: string
          updated_at?: string
        }
        Update: {
          agendamento_origem?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          created_at?: string
          data_hora?: string
          duracao_minutos?: number
          id?: string
          observacoes?: string | null
          preco?: number
          profissional_id?: string
          reagendamentos_count?: number | null
          servico_id?: string
          status?: string
          token_link?: string | null
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          total_visitas: number | null
          ultima_visita: string | null
          unidade_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          total_visitas?: number | null
          ultima_visita?: string | null
          unidade_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          total_visitas?: number | null
          ultima_visita?: string | null
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_agendamento: {
        Row: {
          antecedencia_minima_horas: number | null
          cor_tema: string | null
          created_at: string
          horario_limite_cancelamento: number | null
          id: string
          logo_url: string | null
          max_reagendamentos: number | null
          mensagem_boas_vindas: string | null
          permite_agendamento_publico: boolean | null
          permite_cancelamento: boolean | null
          slug_publico: string | null
          unidade_id: string
          updated_at: string
        }
        Insert: {
          antecedencia_minima_horas?: number | null
          cor_tema?: string | null
          created_at?: string
          horario_limite_cancelamento?: number | null
          id?: string
          logo_url?: string | null
          max_reagendamentos?: number | null
          mensagem_boas_vindas?: string | null
          permite_agendamento_publico?: boolean | null
          permite_cancelamento?: boolean | null
          slug_publico?: string | null
          unidade_id: string
          updated_at?: string
        }
        Update: {
          antecedencia_minima_horas?: number | null
          cor_tema?: string | null
          created_at?: string
          horario_limite_cancelamento?: number | null
          id?: string
          logo_url?: string | null
          max_reagendamentos?: number | null
          mensagem_boas_vindas?: string | null
          permite_agendamento_publico?: boolean | null
          permite_cancelamento?: boolean | null
          slug_publico?: string | null
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_agendamento_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: true
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_espera: {
        Row: {
          cliente_email: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at: string
          data_preferida: string | null
          horario_preferido: string | null
          id: string
          observacoes: string | null
          prioridade: string
          profissional_id: string | null
          servico_id: string
          status: string
          unidade_id: string
          updated_at: string
        }
        Insert: {
          cliente_email?: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at?: string
          data_preferida?: string | null
          horario_preferido?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string
          profissional_id?: string | null
          servico_id: string
          status?: string
          unidade_id: string
          updated_at?: string
        }
        Update: {
          cliente_email?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          created_at?: string
          data_preferida?: string | null
          horario_preferido?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string
          profissional_id?: string | null
          servico_id?: string
          status?: string
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fila_espera_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_espera_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_espera_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_notificacoes: {
        Row: {
          agendamento_id: string
          canal: string
          created_at: string
          destinatario: string
          id: string
          resposta_api: Json | null
          status: string
          tentativas: number | null
          tipo: string
        }
        Insert: {
          agendamento_id: string
          canal: string
          created_at?: string
          destinatario: string
          id?: string
          resposta_api?: Json | null
          status: string
          tentativas?: number | null
          tipo: string
        }
        Update: {
          agendamento_id?: string
          canal?: string
          created_at?: string
          destinatario?: string
          id?: string
          resposta_api?: Json | null
          status?: string
          tentativas?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_notificacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_financeiras: {
        Row: {
          agendamento_id: string | null
          categoria: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          observacoes: string | null
          status: string
          tipo: string
          unidade_id: string
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          categoria: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          observacoes?: string | null
          status?: string
          tipo: string
          unidade_id: string
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          categoria?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          unidade_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_financeiras_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_financeiras_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          ativo: boolean
          comissao_percentual: number | null
          created_at: string
          email: string | null
          especialidades: string[] | null
          horario_trabalho: Json | null
          id: string
          nome: string
          telefone: string | null
          unidade_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          comissao_percentual?: number | null
          created_at?: string
          email?: string | null
          especialidades?: string[] | null
          horario_trabalho?: Json | null
          id?: string
          nome: string
          telefone?: string | null
          unidade_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          comissao_percentual?: number | null
          created_at?: string
          email?: string | null
          especialidades?: string[] | null
          horario_trabalho?: Json | null
          id?: string
          nome?: string
          telefone?: string | null
          unidade_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_clients: {
        Row: {
          cnpj: string | null
          created_at: string
          data_vencimento: string | null
          email: string
          endereco: string | null
          id: string
          limite_unidades: number | null
          limite_usuarios: number | null
          nome: string
          plano: string | null
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          data_vencimento?: string | null
          email: string
          endereco?: string | null
          id?: string
          limite_unidades?: number | null
          limite_usuarios?: number | null
          nome: string
          plano?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          data_vencimento?: string | null
          email?: string
          endereco?: string | null
          id?: string
          limite_unidades?: number | null
          limite_usuarios?: number | null
          nome?: string
          plano?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          preco: number
          unidade_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome: string
          preco: number
          unidade_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          preco?: number
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_mensagens: {
        Row: {
          ativo: boolean | null
          canal: string
          created_at: string
          id: string
          template: string
          tipo: string
          unidade_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          canal: string
          created_at?: string
          id?: string
          template: string
          tipo: string
          unidade_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          canal?: string
          created_at?: string
          id?: string
          template?: string
          tipo?: string
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_mensagens_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          ativo: boolean
          created_at: string
          endereco: string | null
          horario_funcionamento: Json | null
          id: string
          logo_url: string | null
          nome: string
          saas_client_id: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          endereco?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome: string
          saas_client_id?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          endereco?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          saas_client_id?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nome: string
          saas_client_id: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          saas_client_id?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          saas_client_id?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          saas_client_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          saas_client_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          saas_client_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_agendamento_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_saas_client_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _saas_client_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "super_admin" | "client_owner" | "barber" | "receptionist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["super_admin", "client_owner", "barber", "receptionist"],
    },
  },
} as const
