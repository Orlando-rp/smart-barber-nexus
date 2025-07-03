import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  id: string
  nome: string
  descricao?: string
  categoria?: string
  duracao_minutos: number
  preco: number
  selected: boolean
  onClick: () => void
}

export function ServiceCard({
  id,
  nome,
  descricao,
  categoria,
  duracao_minutos,
  preco,
  selected,
  onClick
}: ServiceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
        selected 
          ? "ring-2 ring-primary bg-primary/5 border-primary" 
          : "hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{nome}</h3>
            {selected && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
          
          {descricao && (
            <p className="text-sm text-muted-foreground">{descricao}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{duracao_minutos}min</span>
            </div>
            <div className="flex items-center gap-1 text-foreground font-medium">
              <DollarSign className="w-4 h-4" />
              <span>{formatCurrency(preco)}</span>
            </div>
          </div>
        </div>
        
        {categoria && (
          <Badge variant="secondary" className="ml-2">
            {categoria}
          </Badge>
        )}
      </div>
    </Card>
  )
}