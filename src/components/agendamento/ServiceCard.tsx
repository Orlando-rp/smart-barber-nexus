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
        "p-4 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation",
        "min-h-[100px] sm:min-h-auto active:scale-[0.98]",
        selected 
          ? "ring-2 ring-primary bg-primary/5 border-primary" 
          : "hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-base sm:text-base">{nome}</h3>
            {selected && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
          
          {descricao && (
            <p className="text-sm text-muted-foreground leading-relaxed">{descricao}</p>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{duracao_minutos}min</span>
            </div>
            <div className="flex items-center gap-1 text-foreground font-medium">
              <DollarSign className="w-4 h-4" />
              <span className="text-base">{formatCurrency(preco)}</span>
            </div>
          </div>
        </div>
        
        {categoria && (
          <Badge variant="secondary" className="self-start sm:ml-2">
            {categoria}
          </Badge>
        )}
      </div>
    </Card>
  )
}