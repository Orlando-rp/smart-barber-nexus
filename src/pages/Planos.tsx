import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const planos = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 49.90,
    icon: Star,
    badge: null,
    descricao: 'Perfeito para começar',
    recursos: [
      '1 unidade',
      'Até 3 barbeiros',
      'Agendamentos ilimitados',
      'Relatórios básicos',
      'Suporte por email'
    ],
    limitacoes: []
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 99.90,
    icon: Zap,
    badge: 'Mais Popular',
    descricao: 'Para negócios em crescimento',
    recursos: [
      'Até 3 unidades',
      'Até 10 barbeiros',
      'Analytics avançados',
      'Notificações WhatsApp/SMS',
      'API básica',
      'Suporte prioritário'
    ],
    limitacoes: []
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 199.90,
    icon: Crown,
    badge: 'Completo',
    descricao: 'Para grandes redes de barbearias',
    recursos: [
      'Unidades ilimitadas',
      'Barbeiros ilimitados',
      'API completa',
      'Customizações avançadas',
      'Multi-tenancy',
      'Suporte 24/7'
    ],
    limitacoes: []
  }
]

const Planos = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      // Redirecionar para auth com plano selecionado
      navigate(`/auth?plano=${planId}`)
      return
    }

    setLoading(planId)
    try {
      const plano = planos.find(p => p.id === planId)
      if (!plano) return

      // Simular processo de contratação
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('saas_client_id')
        .eq('user_id', user.id)
        .single()

      if (!profile?.saas_client_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil de cliente não encontrado"
        })
        return
      }

      // Atualizar plano usando a função do banco
      const { error } = await supabase.rpc('update_client_plan', {
        _saas_client_id: profile.saas_client_id,
        _new_plan: planId,
        _new_price: plano.preco
      })

      if (error) throw error

      toast({
        title: "Plano atualizado!",
        description: `Plano ${plano.nome} ativado com sucesso. Redirecionando...`
      })

      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao contratar plano",
        description: error.message
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Selecione o plano ideal para sua barbearia e comece a gerenciar seus agendamentos de forma profissional
          </p>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {planos.map((plano) => {
            const IconComponent = plano.icon
            const isPopular = plano.badge === 'Mais Popular'
            
            return (
              <Card 
                key={plano.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  isPopular ? 'border-primary shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {plano.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      variant={isPopular ? "default" : "secondary"}
                      className="px-3 py-1"
                    >
                      {plano.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                  <CardDescription>{plano.descricao}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">R$ {plano.preco.toFixed(2)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plano.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{recurso}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plano.id)}
                    disabled={loading === plano.id}
                  >
                    {loading === plano.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processando...
                      </div>
                    ) : user ? (
                      'Contratar Plano'
                    ) : (
                      'Começar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            ✅ Teste grátis por 7 dias • 🔒 Sem compromisso • 📞 Suporte em português
          </p>
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem SSL gratuito, backups automáticos e 99.9% de uptime garantido
          </p>
        </div>
      </div>
    </div>
  )
}

export default Planos