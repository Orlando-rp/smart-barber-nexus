import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ServiceCard } from '@/components/agendamento/ServiceCard'
import { User } from 'lucide-react'
import { ProfissionalPublico, ServicoPublico, UnidadePublica } from '@/types/agendamento'

interface ServiceSelectionStepProps {
  unidade: UnidadePublica
  profissionais: ProfissionalPublico[]
  servicos: ServicoPublico[]
  selectedProfissional: string
  selectedServico: string
  onProfissionalChange: (value: string) => void
  onServicoChange: (value: string) => void
  onNext: () => void
}

export function ServiceSelectionStep({
  unidade,
  profissionais,
  servicos,
  selectedProfissional,
  selectedServico,
  onProfissionalChange,
  onServicoChange,
  onNext
}: ServiceSelectionStepProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Escolha o Profissional e Serviço</CardTitle>
        <CardDescription className="text-base">
          {unidade.configuracao?.mensagem_boas_vindas}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Profissional</Label>
          <Select value={selectedProfissional} onValueChange={onProfissionalChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {profissionais.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {prof.nome}
                    {prof.especialidades && prof.especialidades.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({prof.especialidades.join(', ')})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Nossos Serviços</Label>
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {servicos.map((servico) => (
              <ServiceCard
                key={servico.id}
                id={servico.id}
                nome={servico.nome}
                descricao={servico.descricao}
                categoria={servico.categoria}
                duracao_minutos={servico.duracao_minutos}
                preco={servico.preco}
                selected={selectedServico === servico.id}
                onClick={() => onServicoChange(servico.id)}
              />
            ))}
          </div>
        </div>

        <Button 
          onClick={onNext} 
          disabled={!selectedProfissional || !selectedServico}
          className="w-full"
        >
          Continuar
        </Button>
      </CardContent>
    </Card>
  )
}