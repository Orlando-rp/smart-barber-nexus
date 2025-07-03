import { useState, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CalendarViewProps {
  agendamentos: any[]
  onDateSelect: (date: Date) => void
  selectedDate: Date
}

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
  confirmado: { label: "Confirmado", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  em_andamento: { label: "Em Andamento", variant: "outline" as const, color: "bg-orange-100 text-orange-800" },
  concluido: { label: "Concluído", variant: "secondary" as const, color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  faltou: { label: "Faltou", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
}

export function CalendarView({ agendamentos, onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const agendamentosPorDia = useMemo(() => {
    const grouped: { [key: string]: any[] } = {}
    
    agendamentos.forEach(agendamento => {
      const date = format(new Date(agendamento.data_hora), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(agendamento)
    })
    
    return grouped
  }, [agendamentos])

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onDateSelect(today)
  }

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Header dos dias da semana */}
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}
      
      {/* Dias do calendário */}
      {calendarDays.map((day, index) => {
        const dayKey = format(day, 'yyyy-MM-dd')
        const dayAgendamentos = agendamentosPorDia[dayKey] || []
        const isCurrentMonth = isSameMonth(day, currentMonth)
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, new Date())
        
        return (
          <div
            key={index}
            className={`
              min-h-[80px] p-1 border cursor-pointer transition-colors
              ${!isCurrentMonth ? 'text-muted-foreground bg-muted/30' : ''}
              ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent'}
              ${isToday ? 'ring-2 ring-primary ring-opacity-50' : ''}
            `}
            onClick={() => onDateSelect(day)}
          >
            <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayAgendamentos.slice(0, 2).map(agendamento => (
                <div
                  key={agendamento.id}
                  className={`text-xs p-1 rounded truncate ${
                    statusConfig[agendamento.status as keyof typeof statusConfig]?.color || 'bg-gray-100'
                  }`}
                >
                  {format(new Date(agendamento.data_hora), 'HH:mm')} - {agendamento.clientes?.nome || 'Cliente'}
                </div>
              ))}
              {dayAgendamentos.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayAgendamentos.length - 2} mais
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderDayView = () => {
    const dayKey = format(selectedDate, 'yyyy-MM-dd')
    const dayAgendamentos = agendamentosPorDia[dayKey] || []
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <div className="space-y-2">
          {dayAgendamentos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento para este dia
            </p>
          ) : (
            dayAgendamentos
              .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
              .map(agendamento => (
                <div
                  key={agendamento.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{agendamento.clientes?.nome || 'Cliente'}</p>
                    <p className="text-sm text-muted-foreground">
                      {agendamento.servicos?.nome} • {agendamento.profissionais?.nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agendamento.data_hora), 'HH:mm')} - R$ {agendamento.preco.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={statusConfig[agendamento.status as keyof typeof statusConfig]?.variant || "outline"}>
                    {statusConfig[agendamento.status as keyof typeof statusConfig]?.label || agendamento.status}
                  </Badge>
                </div>
              ))
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário de Agendamentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="day">Dia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' ? renderMonthView() : renderDayView()}
      </CardContent>
    </Card>
  )
}