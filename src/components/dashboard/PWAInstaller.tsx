import { usePWA } from "@/hooks/usePWA"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Bell, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PWAInstaller() {
  const { isInstallable, isInstalled, installApp, requestNotificationPermission } = usePWA()
  const { toast } = useToast()

  const handleInstall = async () => {
    await installApp()
    toast({
      title: "App instalado!",
      description: "O Smart Barber Nexus foi instalado em seu dispositivo.",
    })
  }

  const handleNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá notificações sobre novos agendamentos.",
      })
    } else {
      toast({
        title: "Permissão negada",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      })
    }
  }

  if (isInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Instalado
          </CardTitle>
          <CardDescription>
            O Smart Barber Nexus está instalado como aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNotifications} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Ativar Notificações
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isInstallable) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Instalar App
        </CardTitle>
        <CardDescription>
          Instale o Smart Barber Nexus em seu dispositivo para acesso rápido e notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={handleInstall} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Instalar Aplicativo
        </Button>
        <Button onClick={handleNotifications} variant="outline" className="w-full">
          <Bell className="h-4 w-4 mr-2" />
          Ativar Notificações
        </Button>
      </CardContent>
    </Card>
  )
}