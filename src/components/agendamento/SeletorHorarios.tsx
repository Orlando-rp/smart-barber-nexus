import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DisponibilidadeSlot } from '@/types/agendamento'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle } from 'lucide-react'

interface SeletorHorariosProps {
  horarios: DisponibilidadeSlot[]
  selecionado?: string
  onSelecionar: (horario: string) => void
  loading?: boolean
  className?: string
}

export function SeletorHorarios({
  horarios,
  selecionado,
  onSelecionar,
  loading = false,
  className
}: SeletorHorariosProps) {
  const horariosDisponiveis = horarios.filter(slot => slot.disponivel)

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verificando disponibilidade...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-14 sm:h-12 bg-muted animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    )
  }

  if (horariosDisponiveis.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-muted rounded-full">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Nenhum horário disponível</p>
            <p className="text-sm text-muted-foreground">Tente selecionar outra data</p>
          </div>
        </div>
      </div>
    )
  }

  // Agrupar horários por período
  const manhãHorarios = horariosDisponiveis.filter(slot => {
    const hour = new Date(slot.data_hora).getHours()
    return hour < 12
  })

  const tardeHorarios = horariosDisponiveis.filter(slot => {
    const hour = new Date(slot.data_hora).getHours()
    return hour >= 12
  })

  const formatarHorario = (dataHora: string) => {
    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const HorarioButton = ({ slot }: { slot: DisponibilidadeSlot }) => {
    const horario = formatarHorario(slot.data_hora)
    const isSelected = selecionado === horario

    return (
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        onClick={() => onSelecionar(horario)}
        className={cn(
          "relative h-14 sm:h-12 transition-all duration-200 touch-manipulation",
          "active:scale-95 flex flex-col items-center justify-center gap-1",
          isSelected && "ring-2 ring-primary/20 shadow-lg"
        )}
      >
        <span className="text-sm sm:text-xs font-medium leading-tight">{horario}</span>
        {isSelected && (
          <CheckCircle className="h-3 w-3 opacity-70" />
        )}
      </Button>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cabeçalho com contagem */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {horariosDisponiveis.length} horário{horariosDisponiveis.length !== 1 ? 's' : ''} disponível{horariosDisponiveis.length !== 1 ? 'eis' : ''}
          </span>
        </div>
        {selecionado && (
          <Badge variant="secondary">
            {selecionado} selecionado
          </Badge>
        )}
      </div>

      {/* Manhã */}
      {manhãHorarios.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Manhã ({manhãHorarios.length} horário{manhãHorarios.length !== 1 ? 's' : ''})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {manhãHorarios.map((slot) => (
              <HorarioButton key={slot.data_hora} slot={slot} />
            ))}
          </div>
        </div>
      )}

      {/* Tarde */}
      {tardeHorarios.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Tarde ({tardeHorarios.length} horário{tardeHorarios.length !== 1 ? 's' : ''})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {tardeHorarios.map((slot) => (
              <HorarioButton key={slot.data_hora} slot={slot} />
            ))}
          </div>
        </div>
      )}

      {/* Dica */}
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Os horários mostrados são apenas os disponíveis. 
          Horários já ocupados não aparecem na lista.
        </p>
      </div>
    </div>
  )
}