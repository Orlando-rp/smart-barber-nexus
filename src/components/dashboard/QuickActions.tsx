import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export const QuickActions = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">Ações Rápidas</h3>
      <p className="text-sm opacity-90 mb-4">
        Gerencie seu dia com eficiência
      </p>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => navigate('/agendamentos')}
          className="bg-white/20 hover:bg-white/30 border-0"
        >
          Novo Agendamento
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => navigate('/agendamentos')}
          className="bg-white/20 hover:bg-white/30 border-0"
        >
          Ver Agenda
        </Button>
      </div>
    </div>
  )
}