import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAgendamentoToken } from '@/hooks/useAgendamentoToken'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calendar as CalendarIcon, Clock, MapPin, Phone, User, DollarSign, RefreshCw, X } from 'lucide-react'

export default function GerenciarAgendamento() {
  const { token } = useParams<{ token: string }>()
  const {
    agendamento,
    disponibilidade,
    loading,
    loadingDisponibilidade,
    submitting,
    fetchDisponibilidade,
    reagendar,
    cancelar
  } = useAgendamentoToken(token)

  const [showReagendamento, setShowReagendamento] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando agendamento...</p>
        </div>
      </div>
    )
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Agendamento não encontrado</CardTitle>
            <CardDescription>
              O link pode ter expirado ou o agendamento não existe.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { agendamento: ag, pode_reagendar, pode_cancelar } = agendamento

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime('')
    if (date) {
      fetchDisponibilidade(format(date, 'yyyy-MM-dd'))
    }
  }

  const handleReagendar = async () => {
    if (!selectedDate || !selectedTime) return

    const dataHora = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
    
    try {
      await reagendar(dataHora)
      setShowReagendamento(false)
      setSelectedDate(undefined)
      setSelectedTime('')
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleCancelar = async () => {
    try {
      await cancelar(motivoCancelamento)
      setMotivoCancelamento('')
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

  const getStatusBadge = (status: string) => {
    const variants = {
      'pendente': 'secondary',
      'confirmado': 'default',
      'concluído': 'default',
      'cancelado': 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {ag.unidade.logo_url && (
              <img 
                src={ag.unidade.logo_url} 
                alt={ag.unidade.nome} 
                className="w-12 h-12 rounded-lg object-cover" 
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{ag.unidade.nome}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {ag.unidade.endereco && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {ag.unidade.endereco}
                  </div>
                )}
                {ag.unidade.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {ag.unidade.telefone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Detalhes do Agendamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Agendamento</CardTitle>
                {getStatusBadge(ag.status)}
              </div>
              <CardDescription>
                Gerencie seu agendamento ou faça alterações necessárias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{ag.cliente_nome}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{ag.cliente_telefone}</p>
                  </div>

                  {ag.cliente_email && (
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{ag.cliente_email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Profissional</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{ag.profissional.nome}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Serviço</p>
                    <p className="font-medium">{ag.servico.nome}</p>
                    {ag.servico.descricao && (
                      <p className="text-sm text-muted-foreground">{ag.servico.descricao}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {ag.servico.duracao_minutos}min
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(ag.servico.preco)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5" />
                  <h3 className="font-medium">Data e Horário</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(new Date(ag.data_hora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">
                      {format(new Date(ag.data_hora), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {ag.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm bg-muted p-3 rounded">{ag.observacoes}</p>
                </div>
              )}

              {/* Informações sobre reagendamentos */}
              {ag.reagendamentos_count && ag.reagendamentos_count > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Reagendamentos realizados: {ag.reagendamentos_count} de {ag.unidade.configuracao?.max_reagendamentos}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações disponíveis apenas para agendamentos ativos */}
          {ag.status !== 'cancelado' && ag.status !== 'concluído' && (
            <Card>
              <CardHeader>
                <CardTitle>Ações Disponíveis</CardTitle>
                <CardDescription>
                  O que você gostaria de fazer com seu agendamento?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pode_reagendar && (
                    <Button
                      onClick={() => setShowReagendamento(!showReagendamento)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reagendar
                    </Button>
                  )}

                  {pode_cancelar && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                          <Label htmlFor="motivo">Motivo do cancelamento (opcional)</Label>
                          <Textarea
                            id="motivo"
                            value={motivoCancelamento}
                            onChange={(e) => setMotivoCancelamento(e.target.value)}
                            placeholder="Conte-nos o motivo do cancelamento..."
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Voltar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelar}
                            disabled={submitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {submitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {!pode_reagendar && !pode_cancelar && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Não é possível modificar este agendamento no momento.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interface de Reagendamento */}
          {showReagendamento && pode_reagendar && (
            <Card>
              <CardHeader>
                <CardTitle>Reagendar Horário</CardTitle>
                <CardDescription>
                  Escolha uma nova data e horário para seu agendamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nova Data</Label>
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
                    <Label>Horários Disponíveis</Label>
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
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReagendamento(false)
                      setSelectedDate(undefined)
                      setSelectedTime('')
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleReagendar}
                    disabled={!selectedDate || !selectedTime || submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Reagendando...' : 'Confirmar Reagendamento'}
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