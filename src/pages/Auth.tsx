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
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) navigate("/")
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
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos." })
      return
    }

    setLoading(true)
    try {
      cleanupAuthState()
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {})

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (rolesError || !rolesData) {
        toast({ variant: "destructive", title: "Erro", description: "Tipo de usuário não identificado." })
        return
      }

      toast({ title: "Login realizado!", description: "Bem-vindo ao BarberSmart." })
      navigate(rolesData.role === "super_admin" ? "/admin" : "/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword || !name) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos." })
      return
    }
    if (userType === "client" && !businessName) {
      toast({ variant: "destructive", title: "Erro", description: "Nome da barbearia é obrigatório." })
      return
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erro", description: "Senhas não coincidem." })
      return
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Erro", description: "A senha deve ter pelo menos 6 caracteres." })
      return
    }

    setLoading(true)
    try {
      cleanupAuthState()
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {})

      const redirectUrl = `${window.location.origin}/`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { nome: name, business_name: businessName, user_type: userType }
        }
      })

      if (error) throw error

      if (data.user) {
        const userId = data.user.id

        if (userType === "client") {
          const { data: client, error: saasError } = await supabase
            .from("saas_clients")
            .insert({ nome: businessName, email, plano: "basico" })
            .select()
            .single()
          if (saasError) throw saasError

          await supabase
            .from("user_profiles")
            .insert({ nome: name, saas_client_id: client.id })

          await supabase
            .from("user_roles")
            .insert({ user_id: userId, saas_client_id: client.id, role: "client_owner" })

        } else if (userType === "super_admin") {
          await supabase
            .from("user_roles")
            .insert({ user_id: userId, saas_client_id: null, role: "super_admin" })
        }

        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar sua conta."
        })

        setTimeout(() => { window.location.href = "/auth" }, 3000)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no cadastro", description: error.message })
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
          <CardDescription>Gestão Inteligente para sua Barbearia</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <InputBlock label="Email" icon={<Mail />} value={email} onChange={setEmail} />
                <InputBlock label="Senha" icon={<Lock />} type="password" value={password} onChange={setPassword} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <InputBlock label="Nome Completo" icon={<User />} value={name} onChange={setName} />
                <Label htmlFor="user-type">Tipo de Usuário</Label>
                <Select value={userType} onValueChange={(v) => setUserType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client"><Building2 className="h-4 w-4" /> Cliente</SelectItem>
                    <SelectItem value="super_admin"><Crown className="h-4 w-4" /> Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                {userType === "client" && (
                  <InputBlock label="Nome da Barbearia" icon={<Building2 />} value={businessName} onChange={setBusinessName} />
                )}
                <InputBlock label="Email" icon={<Mail />} value={email} onChange={setEmail} />
                <InputBlock label="Senha" icon={<Lock />} type="password" value={password} onChange={setPassword} />
                <InputBlock label="Confirmar Senha" icon={<Lock />} type="password" value={confirmPassword} onChange={setConfirmPassword} />
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

const InputBlock = ({
  label,
  icon,
  type = "text",
  value,
  onChange
}: {
  label: string,
  icon: React.ReactNode,
  type?: string,
  value: string,
  onChange: (v: string) => void
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{icon}</div>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        required
      />
    </div>
  </div>
)

export default Auth
