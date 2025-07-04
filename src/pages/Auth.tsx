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

        if (userType === "client") {
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

          await supabase
            .from('user_profiles')
            .insert({
              nome: name,
              email: email,
              saas_client_id: saasClient.id,
              user_id: userId
            })

          await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              saas_client_id: saasClient.id,
              role: 'client_owner'
            })
        } else if (userType === "super_admin") {
          await supabase
            .from('user_profiles')
            .insert({
              nome: name,
              email: email,
              user_id: userId
            })

          await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              saas_client_id: null,
              role: 'super_admin'
            })
        }

        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar sua conta."
        })

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
          {/* Mantém os Tabs de login/cadastro aqui */}
          {/* ...mantém como no seu código original... */}
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth
