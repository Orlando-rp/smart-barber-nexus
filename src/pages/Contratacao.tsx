import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Crown, Star, Zap } from "lucide-react"

interface ContratoForm {
  nome: string
  email: string
  telefone: string
  cnpj?: string
  endereco?: string
  password: string
}

const planos = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 49.90,
    icon: Star,
    recursos: ['1 unidade', 'Até 3 barbeiros', 'Agendamentos ilimitados']
  },
  {
    id: 'premium', 
    nome: 'Premium',
    preco: 99.90,
    icon: Zap,
    recursos: ['Até 3 unidades', 'Até 10 barbeiros', 'Analytics avançados']
  },
  {
    id: 'enterprise',
    nome: 'Enterprise', 
    preco: 199.90,
    icon: Crown,
    recursos: ['Unidades ilimitadas', 'Barbeiros ilimitados', 'API completa']
  }
]

const Contratacao = () => {
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const planoId = searchParams.get('plano') || 'basico'
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const plano = planos.find(p => p.id === planoId) || planos[0]
  const IconComponent = plano.icon

  const { register, handleSubmit, formState: { errors } } = useForm<ContratoForm>()

  const onSubmit = async (data: ContratoForm) => {
    setLoading(true)
    try {
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: data.nome
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      // 2. Criar cliente SaaS
      const { data: saasClient, error: saasError } = await supabase
        .from('saas_clients')
        .insert({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cnpj: data.cnpj,
          endereco: data.endereco,
          plano: planoId,
          plano_tipo: planoId as any,
          preco_mensal: plano.preco,
          status: 'ativo'
        })
        .select()
        .single()

      if (saasError) throw saasError

      // 3. Atualizar perfil do usuário com saas_client_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          saas_client_id: saasClient.id,
          nome: data.nome,
          telefone: data.telefone
        })
        .eq('user_id', authData.user.id)

      if (profileError) throw profileError

      // 4. Criar role de client_owner
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'client_owner',
          saas_client_id: saasClient.id
        })

      if (roleError) throw roleError

      toast({
        title: "Contratação realizada com sucesso!",
        description: `Plano ${plano.nome} ativado. Verifique seu email para confirmar a conta.`
      })

      // Redirecionar para dashboard após login automático
      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na contratação",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Resumo do Plano */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Plano {plano.nome}</CardTitle>
                  <CardDescription>
                    R$ {plano.preco.toFixed(2)}/mês
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="secondary" className="mb-4">
                  7 dias grátis
                </Badge>
                <h4 className="font-medium">Incluído neste plano:</h4>
                <ul className="space-y-2">
                  {plano.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {recurso}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Contratação */}
          <Card>
            <CardHeader>
              <CardTitle>Complete sua contratação</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para ativar seu plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Barbearia *</Label>
                  <Input
                    id="nome"
                    {...register("nome", { required: "Nome é obrigatório" })}
                  />
                  {errors.nome && (
                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { 
                      required: "Email é obrigatório",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido"
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", { 
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "Senha deve ter no mínimo 6 caracteres"
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    {...register("telefone", { required: "Telefone é obrigatório" })}
                  />
                  {errors.telefone && (
                    <p className="text-sm text-destructive">{errors.telefone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    {...register("cnpj")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    {...register("endereco")}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processando contratação...
                      </div>
                    ) : (
                      `Contratar ${plano.nome} - R$ ${plano.preco.toFixed(2)}/mês`
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Ao contratar, você concorda com nossos termos de uso. 
                  Teste grátis por 7 dias, cancele quando quiser.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Contratacao