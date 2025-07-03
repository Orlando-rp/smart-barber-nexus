import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarioPersonalizadoProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function CalendarioPersonalizado({
  selected,
  onSelect,
  disabled,
  className,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias no futuro
}: CalendarioPersonalizadoProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const currentYear = currentMonth.getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(currentMonth.getFullYear(), parseInt(monthIndex), 1)
    setCurrentMonth(newMonth)
  }

  const handleYearChange = (year: string) => {
    const newMonth = new Date(parseInt(year), currentMonth.getMonth(), 1)
    setCurrentMonth(newMonth)
  }

  const isDayDisabled = (day: Date) => {
    if (isBefore(day, startOfDay(minDate))) return true
    if (isBefore(maxDate, day)) return true
    if (disabled) return disabled(day)
    return false
  }

  // Preencher com dias da semana anterior/posterior para completar a grade
  const startCalendar = new Date(monthStart)
  startCalendar.setDate(startCalendar.getDate() - monthStart.getDay())

  const endCalendar = new Date(monthEnd)
  endCalendar.setDate(endCalendar.getDate() + (6 - monthEnd.getDay()))

  const calendarDays = eachDayOfInterval({ start: startCalendar, end: endCalendar })

  return (
    <div className={cn("bg-card rounded-lg border p-3 sm:p-4", className)}>
      {/* Header com controles de navegação - Otimizado para mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-28 sm:w-32 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-16 sm:w-20 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-10 w-10 p-0 touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-10 w-10 p-0 touch-manipulation"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dias da semana - Mobile otimizado */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => {
          const fullDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
          return (
            <div key={day} className="h-10 flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">{fullDays[index]}</span>
              <span className="sm:hidden">{day}</span>
            </div>
          )
        })}
      </div>

      {/* Grade de dias - Botões maiores para mobile */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelectedDay = selected && isSameDay(day, selected)
          const isTodayDay = isToday(day)
          const isDisabledDay = isDayDisabled(day)

          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              className={cn(
                "h-10 w-full p-0 text-sm transition-colors touch-manipulation min-h-[2.5rem]",
                !isCurrentMonth && "text-muted-foreground/50",
                isSelectedDay && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isTodayDay && !isSelectedDay && "bg-accent text-accent-foreground",
                isDisabledDay && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
              disabled={isDisabledDay}
              onClick={() => onSelect(day)}
            >
              {format(day, 'd')}
            </Button>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-accent"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span>Selecionado</span>
        </div>
      </div>
    </div>
  )
}