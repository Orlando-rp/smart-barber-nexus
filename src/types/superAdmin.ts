export interface SaasClient {
  id: string
  nome: string
  email: string
  telefone: string | null
  plano: string
  status: string
  data_vencimento: string | null
  limite_unidades: number
  limite_usuarios: number
  created_at: string
}

export interface NewClientData {
  nome: string
  email: string
  telefone: string
  plano: string
  limite_unidades: number
  limite_usuarios: number
}