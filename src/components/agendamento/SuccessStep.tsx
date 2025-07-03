import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ProfissionalPublico, ServicoPublico } from '@/types/agendamento'

interface SuccessStepProps {
  selectedProfissional: ProfissionalPublico | undefined
  selectedServico: ServicoPublico | undefined
  selectedDate: Date | undefined
  selectedTime: string
  onNewAppointment: () => void
}

export function SuccessStep({
  selectedProfissional,
  selectedServico,
  selectedDate,
  selectedTime,
  onNewAppointment
}: SuccessStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              ✓
            </div>
          </div>
          <CardTitle className="text-green-700">Agendamento Confirmado!</CardTitle>
          <CardDescription>
            Você receberá uma confirmação via WhatsApp em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p><strong>Profissional:</strong> {selectedProfissional?.nome}</p>
            <p><strong>Serviço:</strong> {selectedServico?.nome}</p>
            <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
            <p><strong>Valor:</strong> {selectedServico && formatCurrency(selectedServico.preco)}</p>
          </div>
          <Button 
            onClick={onNewAppointment} 
            className="w-full"
          >
            Fazer Novo Agendamento
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}