import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scissors, Mail, Lock, User, Building2, Crown } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [userType, setUserType] = useState<"client" | "super_admin">("client")
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Plano pré-selecionado via URL
  const preSelectedPlan = searchParams.get('plano') || 'basico'

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate("/")
      }
    }
    checkUser()
  }, [navigate])

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword || !name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos."
      })
      return
    }

    if (userType === "client" && !businessName) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome da barbearia é obrigatório para clientes."
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem."
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres."
      })
      return
    }

    setLoading(true)
    try {
      cleanupAuthState()
      await supabase.auth.signOut({ scope: 'global' })

      const redirectUrl = `${window.location.origin}/`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name, // nome correto se quiser mapear em user_metadata
            user_type: userType
          }
        }
      })

      if (error) throw error

      if (data.user) {
        const userId = data.user.id

        try {
          if (userType === "client") {
            // 1. Primeiro: criar user_profile
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                nome: name,
                email: email,
                user_id: userId
              })

            if (profileError) throw profileError

            // 2. Segundo: criar saas_client com plano selecionado
            const planPrices = { basico: 49.90, premium: 99.90, enterprise: 199.90 }
            const { data: saasClient, error: saasError } = await supabase
              .from('saas_clients')
              .insert({
                nome: businessName,
                email: email,
                plano: preSelectedPlan as 'basico' | 'premium' | 'enterprise',
                preco_mensal: planPrices[preSelectedPlan as keyof typeof planPrices]
              })
              .select()
              .single()

            if (saasError) throw saasError

            // 3. Terceiro: atualizar user_profile com saas_client_id
            const { error: updateProfileError } = await supabase
              .from('user_profiles')
              .update({ saas_client_id: saasClient.id })
              .eq('user_id', userId)

            if (updateProfileError) throw updateProfileError

            // 4. Por último: criar user_role
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                saas_client_id: saasClient.id,
                role: 'client_owner'
              })

            if (roleError) throw roleError

          } else if (userType === "super_admin") {
            // 1. Primeiro: criar user_profile
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                nome: name,
                email: email,
                user_id: userId
              })

            if (profileError) throw profileError

            // 2. Segundo: criar user_role
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                saas_client_id: null,
                role: 'super_admin'
              })

            if (roleError) throw roleError
          }
        } catch (dbError: any) {
          // Se houver erro na criação dos dados, limpar o usuário criado
          console.error('Erro ao criar dados do usuário:', dbError)
          await supabase.auth.admin.deleteUser(userId)
          throw new Error(`Erro ao configurar conta: ${dbError.message}`)
        }

        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo ao BarberSmart! ${userType === "client" ? "Sua barbearia foi configurada." : "Acesso de administrador ativado."}`
        })

        setTimeout(() => {
          window.location.href = userType === "super_admin" ? "/admin" : "/"
        }, 2000)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha email e senha."
      })
      return
    }

    setLoading(true)
    try {
      cleanupAuthState()
      await supabase.auth.signOut({ scope: 'global' })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (rolesError || !rolesData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível identificar o tipo de usuário."
        })
        return
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao BarberSmart."
      })

      if (rolesData.role === "super_admin") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Barber Smart</CardTitle>
          <CardDescription>
            Gestão Inteligente para sua Barbearia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Entrar
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-type">Tipo de Usuário</Label>
                  <Select value={userType} onValueChange={(value: "client" | "super_admin") => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Proprietário de Barbearia
                        </div>
                      </SelectItem>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Super Administrador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {userType === "client" && (
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nome da Barbearia</Label>
                    <Input
                      id="business-name"
                      type="text"
                      placeholder="Nome da sua barbearia"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email-cadastro">Email</Label>
                  <Input
                    id="email-cadastro"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-cadastro">Senha</Label>
                  <Input
                    id="password-cadastro"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Criando conta...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Criar Conta
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth
