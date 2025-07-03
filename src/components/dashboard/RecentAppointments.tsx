import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const appointments = [
  {
    id: "1",
    client: "João Silva",
    service: "Corte + Barba",
    time: "10:00",
    barber: "Carlos",
    status: "confirmado" as const,
  },
  {
    id: "2",
    client: "Pedro Santos",
    service: "Corte Tradicional",
    time: "10:30",
    barber: "Miguel",
    status: "pendente" as const,
  },
  {
    id: "3",
    client: "Rafael Costa",
    service: "Barba",
    time: "11:00",
    barber: "Carlos",
    status: "confirmado" as const,
  },
  {
    id: "4",
    client: "André Lima",
    service: "Corte + Barba",
    time: "11:30",
    barber: "Miguel",
    status: "concluido" as const,
  },
]

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const },
  confirmado: { label: "Confirmado", variant: "default" as const },
  concluido: { label: "Concluído", variant: "secondary" as const },
}

export function RecentAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {appointment.client.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{appointment.client}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.service} • {appointment.barber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{appointment.time}</span>
                <Badge variant={statusConfig[appointment.status].variant}>
                  {statusConfig[appointment.status].label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}