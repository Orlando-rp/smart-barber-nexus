export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ativo': return 'default'
    case 'suspenso': return 'secondary'
    case 'cancelado': return 'destructive'
    default: return 'outline'
  }
}

export const getPlanoBadgeVariant = (plano: string) => {
  switch (plano) {
    case 'basico': return 'outline'
    case 'premium': return 'default'
    case 'enterprise': return 'secondary'
    default: return 'outline'
  }
}