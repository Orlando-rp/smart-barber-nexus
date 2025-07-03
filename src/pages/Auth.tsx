import { useState, useEffect } from "react"
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

  useEffect(() => {
    // Verificar se já está logado
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos."
      })
      return
    }

    setLoading(true)
    try {
      cleanupAuthState()
      
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (err) {
        // Continue mesmo se falhar
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();
      
        if (rolesError || !rolesData) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível identificar o tipo de usuário."
          });
          return;
        }
      
        const role = rolesData.role;
      
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao BarberSmart."
        });
      
        if (role === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação dos campos obrigatórios
    if (!email || !password || !confirmPassword || !name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos."
      })
      return
    }

    // Validação específica para clientes
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
      
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (err) {
        // Continue mesmo se falhar
      }

      const redirectUrl = `${window.location.origin}/`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            business_name: businessName,
            user_type: userType,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Criar cliente SaaS se for cliente e adicionar roles
        if (userType === "client") {
          // Criar cliente SaaS
          const { data: saasClient, error: saasError } = await supabase
            .from('saas_clients')
            .insert({
              nome: businessName,
              email: email,
              plano: 'basico'
            })
            .select()
            .single()

          if (saasError) throw saasError

          // Atualizar perfil com saas_client_id
          await supabase
            .from('user_profiles')
            .update({ saas_client_id: saasClient.id })
            .eq('user_id', data.user.id)

          // Criar role de client_owner
          await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              saas_client_id: saasClient.id,
              role: 'client_owner'
            })
        } else if (userType === "super_admin") {
          // Criar role de super_admin
          console.log("Criando role super_admin para:", data.user.id)
          
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              saas_client_id: null,
              role: 'super_admin'
            })
          
          if (roleError) {
            console.error("Erro ao inserir role super_admin:", roleError)
            toast({
              variant: "destructive",
              title: "Erro",
              description: "Não foi possível atribuir o perfil de super admin."
            })
            return
          }
        }

          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar sua conta."
          })
          
          // Redirecionamento manual forçado após o toast
          setTimeout(() => {
            window.location.href = "/auth"
          }, 3000)

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
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-type">Tipo de Usuário</Label>
                  <Select value={userType} onValueChange={(value: "client" | "super_admin") => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Cliente (Proprietário de Barbearia)
                        </div>
                      </SelectItem>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Super Administrador SaaS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userType === "client" && (
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nome da Barbearia</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="Nome da sua barbearia"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta"}
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