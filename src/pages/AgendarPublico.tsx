import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAgendamentoPublico } from '@/hooks/useAgendamentoPublico'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar as CalendarIcon, Clock, MapPin, Phone, User, DollarSign } from 'lucide-react'

export default function AgendarPublico() {
  const { slug } = useParams<{ slug: string }>()
  const {
    unidade,
    profissionais,
    servicos,
    disponibilidade,
    loading,
    loadingDisponibilidade,
    submitting,
    fetchDisponibilidade,
    criarAgendamento
  } = useAgendamentoPublico(slug)

  const [step, setStep] = useState(1)
  const [selectedProfissional, setSelectedProfissional] = useState('')
  const [selectedServico, setSelectedServico] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!unidade) {
    return <Navigate to="/404" replace />
  }

  const selectedServicoObj = servicos.find(s => s.id === selectedServico)
  const selectedProfissionalObj = profissionais.find(p => p.id === selectedProfissional)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime('')
    if (date && selectedProfissional && selectedServico) {
      fetchDisponibilidade(selectedProfissional, selectedServico, format(date, 'yyyy-MM-dd'))
    }
  }

  const handleNextStep = () => {
    if (step === 1 && selectedProfissional && selectedServico) {
      setStep(2)
    } else if (step === 2 && selectedDate && selectedTime) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !clienteNome || !clienteTelefone) return

    const dataHora = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`

    try {
      await criarAgendamento({
        unidade_id: unidade.id,
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail,
        profissional_id: selectedProfissional,
        servico_id: selectedServico,
        data_hora: dataHora
      })
      setStep(4) // Página de sucesso
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
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
              <p><strong>Profissional:</strong> {selectedProfissionalObj?.nome}</p>
              <p><strong>Serviço:</strong> {selectedServicoObj?.nome}</p>
              <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {selectedTime}</p>
              <p><strong>Valor:</strong> {selectedServicoObj && formatCurrency(selectedServicoObj.preco)}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Fazer Novo Agendamento
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {unidade.logo_url && (
              <img src={unidade.logo_url} alt={unidade.nome} className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{unidade.nome}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {unidade.endereco && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {unidade.endereco}
                  </div>
                )}
                {unidade.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {unidade.telefone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Escolher Profissional e Serviço */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Escolha o Profissional e Serviço</CardTitle>
                <CardDescription>{unidade.configuracao?.mensagem_boas_vindas}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Select value={selectedProfissional} onValueChange={setSelectedProfissional}>
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

                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <div className="grid gap-3">
                    {servicos.map((servico) => (
                      <div
                        key={servico.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedServico === servico.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedServico(servico.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium">{servico.nome}</h3>
                            {servico.descricao && (
                              <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {servico.duracao_minutos}min
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(servico.preco)}
                              </div>
                            </div>
                          </div>
                          {servico.categoria && (
                            <Badge variant="secondary">{servico.categoria}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleNextStep} 
                  disabled={!selectedProfissional || !selectedServico}
                  className="w-full"
                >
                  Continuar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Escolher Data e Horário */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Escolha Data e Horário</CardTitle>
                <CardDescription>
                  {selectedServicoObj?.nome} com {selectedProfissionalObj?.nome}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < startOfDay(new Date()) || date > addDays(new Date(), 30)}
                    className="rounded-md border"
                    locale={ptBR}
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Horário Disponível</Label>
                    {loadingDisponibilidade ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {disponibilidade
                          .filter(slot => slot.disponivel)
                          .map((slot) => {
                            const time = new Date(slot.data_hora).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            return (
                              <Button
                                key={slot.data_hora}
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            )
                          })}
                      </div>
                    )}
                    {disponibilidade.length === 0 && !loadingDisponibilidade && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum horário disponível para esta data
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!selectedDate || !selectedTime}
                    className="w-full"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Dados do Cliente */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>Preencha seus dados para confirmar o agendamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo do agendamento */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-medium mb-2">Resumo do Agendamento</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Profissional</p>
                      <p className="font-medium">{selectedProfissionalObj?.nome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serviço</p>
                      <p className="font-medium">{selectedServicoObj?.nome}</p>
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
                    <span className="text-lg">{selectedServicoObj && formatCurrency(selectedServicoObj.preco)}</span>
                  </div>
                </div>

                {/* Formulário de dados */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">WhatsApp *</Label>
                    <Input
                      id="telefone"
                      value={clienteTelefone}
                      onChange={(e) => setClienteTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clienteEmail}
                      onChange={(e) => setClienteEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!clienteNome || !clienteTelefone || submitting}
                    className="w-full"
                  >
                    {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}