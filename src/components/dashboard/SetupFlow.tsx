import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export const SetupFlow = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSetupBusiness = () => {
    navigate('/servicos')
    toast({
      title: "Configure seu negócio",
      description: "Comece adicionando seus serviços e profissionais."
    })
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bem-vindo ao BarberSmart!</CardTitle>
          <CardDescription>
            Para começar, você precisa configurar seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Configure:</p>
            <ul className="mt-2 space-y-1">
              <li>• Seus serviços e preços</li>
              <li>• Profissionais da equipe</li>
              <li>• Informações da barbearia</li>
            </ul>
          </div>
          <Button onClick={handleSetupBusiness} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Configurar Negócio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}