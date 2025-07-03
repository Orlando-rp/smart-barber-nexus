import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ProfissionalPublico, ServicoPublico } from '@/types/agendamento'

interface CustomerDataStepProps {
  selectedProfissional: ProfissionalPublico | undefined
  selectedServico: ServicoPublico | undefined
  selectedDate: Date | undefined
  selectedTime: string
  clienteNome: string
  clienteTelefone: string
  clienteEmail: string
  submitting: boolean
  onClienteNomeChange: (value: string) => void
  onClienteTelefoneChange: (value: string) => void
  onClienteEmailChange: (value: string) => void
  onBack: () => void
  onSubmit: () => void
}

export function CustomerDataStep({
  selectedProfissional,
  selectedServico,
  selectedDate,
  selectedTime,
  clienteNome,
  clienteTelefone,
  clienteEmail,
  submitting,
  onClienteNomeChange,
  onClienteTelefoneChange,
  onClienteEmailChange,
  onBack,
  onSubmit
}: CustomerDataStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Confirmação do Agendamento</CardTitle>
        <CardDescription className="text-base">
          Preencha seus dados para finalizar o agendamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo do agendamento */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-medium mb-2">Resumo do Agendamento</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Profissional</p>
              <p className="font-medium">{selectedProfissional?.nome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Serviço</p>
              <p className="font-medium">{selectedServico?.nome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium">
                {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Horário</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center font-medium">
            <span>Total:</span>
            <span className="text-lg">{selectedServico && formatCurrency(selectedServico.preco)}</span>
          </div>
        </div>

        {/* Formulário de dados */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={clienteNome}
              onChange={(e) => onClienteNomeChange(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">WhatsApp *</Label>
            <Input
              id="telefone"
              value={clienteTelefone}
              onChange={(e) => onClienteTelefoneChange(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={clienteEmail}
              onChange={(e) => onClienteEmailChange(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="w-full">
            Voltar
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!clienteNome || !clienteTelefone || submitting}
            className="w-full"
          >
            {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}