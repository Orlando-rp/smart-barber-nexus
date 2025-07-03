import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAgendamentoPublico } from '@/hooks/useAgendamentoPublico'
import { MapPin, Phone } from 'lucide-react'
import { ProgressSteps } from '@/components/agendamento/ProgressSteps'
import { ServiceSelectionStep } from '@/components/agendamento/ServiceSelectionStep'
import { DateTimeSelectionStep } from '@/components/agendamento/DateTimeSelectionStep'
import { CustomerDataStep } from '@/components/agendamento/CustomerDataStep'
import { SuccessStep } from '@/components/agendamento/SuccessStep'

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
      setStep(4)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  if (step === 4) {
    return (
      <SuccessStep
        selectedProfissional={selectedProfissionalObj}
        selectedServico={selectedServicoObj}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onNewAppointment={() => window.location.reload()}
      />
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
          <ProgressSteps currentStep={step} />

          {step === 1 && (
            <ServiceSelectionStep
              unidade={unidade}
              profissionais={profissionais}
              servicos={servicos}
              selectedProfissional={selectedProfissional}
              selectedServico={selectedServico}
              onProfissionalChange={setSelectedProfissional}
              onServicoChange={setSelectedServico}
              onNext={handleNextStep}
            />
          )}

          {step === 2 && (
            <DateTimeSelectionStep
              selectedProfissional={selectedProfissionalObj}
              selectedServico={selectedServicoObj}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              disponibilidade={disponibilidade}
              loadingDisponibilidade={loadingDisponibilidade}
              onDateSelect={handleDateSelect}
              onTimeSelect={setSelectedTime}
              onBack={() => setStep(1)}
              onNext={handleNextStep}
            />
          )}

          {step === 3 && (
            <CustomerDataStep
              selectedProfissional={selectedProfissionalObj}
              selectedServico={selectedServicoObj}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              clienteNome={clienteNome}
              clienteTelefone={clienteTelefone}
              clienteEmail={clienteEmail}
              submitting={submitting}
              onClienteNomeChange={setClienteNome}
              onClienteTelefoneChange={setClienteTelefone}
              onClienteEmailChange={setClienteEmail}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  )
}