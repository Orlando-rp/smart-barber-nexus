import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CalendarioPersonalizado } from '@/components/agendamento/CalendarioPersonalizado'
import { SeletorHorarios } from '@/components/agendamento/SeletorHorarios'
import { addDays, startOfDay } from 'date-fns'
import { DisponibilidadeSlot, ProfissionalPublico, ServicoPublico } from '@/types/agendamento'

interface DateTimeSelectionStepProps {
  selectedProfissional: ProfissionalPublico | undefined
  selectedServico: ServicoPublico | undefined
  selectedDate: Date | undefined
  selectedTime: string
  disponibilidade: DisponibilidadeSlot[]
  loadingDisponibilidade: boolean
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onBack: () => void
  onNext: () => void
}

export function DateTimeSelectionStep({
  selectedProfissional,
  selectedServico,
  selectedDate,
  selectedTime,
  disponibilidade,
  loadingDisponibilidade,
  onDateSelect,
  onTimeSelect,
  onBack,
  onNext
}: DateTimeSelectionStepProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Escolha Data e Horário</CardTitle>
        <CardDescription className="text-base">
          <span className="font-medium text-primary">{selectedServico?.nome}</span> com {selectedProfissional?.nome}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Selecione a Data</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Escolha um dia para ver os horários disponíveis
            </p>
            <CalendarioPersonalizado
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => date < startOfDay(new Date()) || date > addDays(new Date(), 30)}
              className="mx-auto max-w-sm"
            />
          </div>

          {selectedDate && (
            <div className="space-y-3">
              <div>
                <Label className="text-base font-medium">Horários Disponíveis</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <SeletorHorarios
                horarios={disponibilidade}
                selecionado={selectedTime}
                onSelecionar={onTimeSelect}
                loading={loadingDisponibilidade}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="w-full">
            Voltar
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!selectedDate || !selectedTime}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}