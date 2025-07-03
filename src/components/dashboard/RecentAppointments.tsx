import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRecentAppointments } from "@/hooks/useRecentAppointments"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, color: "text-yellow-600" },
  confirmado: { label: "Confirmado", variant: "default" as const, color: "text-blue-600" },
  em_andamento: { label: "Em Andamento", variant: "outline" as const, color: "text-orange-600" },
  concluido: { label: "Concluído", variant: "secondary" as const, color: "text-green-600" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "text-red-600" },
  faltou: { label: "Faltou", variant: "destructive" as const, color: "text-red-600" },
}

export function RecentAppointments() {
  const { appointments, loading } = useRecentAppointments()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos de Hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum agendamento para hoje
            </p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {appointment.cliente_nome?.split(' ').map(n => n[0]).join('') || 'CL'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{appointment.cliente_nome || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.servico_nome} • {appointment.profissional_nome}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {format(new Date(appointment.data_hora), "HH:mm", { locale: ptBR })}
                  </span>
                  <Badge 
                    variant={statusConfig[appointment.status as keyof typeof statusConfig]?.variant || "outline"}
                    className={statusConfig[appointment.status as keyof typeof statusConfig]?.color || ""}
                  >
                    {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}