import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { Calendar, DollarSign, Users, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

const Index = () => {
  const { userProfile, userRoles, isSuperAdmin, isClientOwner } = useAuth()
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    faturamentoMensal: 0,
    clientesAtivos: 0,
    taxaOcupacao: 0
  })
  const [hasUnidades, setHasUnidades] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (userProfile && !isSuperAdmin) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [userProfile, isSuperAdmin])

  const fetchDashboardData = async () => {
    try {
      // Verificar se tem unidades cadastradas
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)

      setHasUnidades((unidades?.length || 0) > 0)

      if (unidades && unidades.length > 0) {
        // Buscar estatísticas se tem unidades
        const today = new Date().toISOString().split('T')[0]
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()

        // Agendamentos hoje
        const { data: agendamentosHoje } = await supabase
          .from('agendamentos')
          .select('id')
          .gte('data_hora', today)
          .lt('data_hora', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .in('unidade_id', unidades.map(u => u.id))

        // Faturamento mensal
        const { data: agendamentosMes } = await supabase
          .from('agendamentos')
          .select('preco')
          .gte('data_hora', firstDayOfMonth)
          .lte('data_hora', lastDayOfMonth)
          .eq('status', 'concluido')
          .in('unidade_id', unidades.map(u => u.id))

        // Clientes únicos
        const { data: clientes } = await supabase
          .from('clientes')
          .select('id')
          .eq('unidade_id', unidades[0].id)

        const faturamento = agendamentosMes?.reduce((sum, a) => sum + (Number(a.preco) || 0), 0) || 0

        setStats({
          agendamentosHoje: agendamentosHoje?.length || 0,
          faturamentoMensal: faturamento,
          clientesAtivos: clientes?.length || 0,
          taxaOcupacao: 85 // Placeholder por enquanto
        })
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupBusiness = () => {
    navigate('/servicos')
    toast({
      title: "Configure seu negócio",
      description: "Comece adicionando seus serviços e profissionais."
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Setup inicial para novos usuários
  if (!isSuperAdmin && !hasUnidades) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao BarberSmart. Aqui está um resumo do seu negócio hoje.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Agendamentos Hoje"
            value={stats.agendamentosHoje.toString()}
            description={`${Math.floor(stats.agendamentosHoje * 0.25)} pendentes de confirmação`}
            icon={Calendar}
            trend={{ value: "20%", isPositive: true }}
          />
          <StatsCard
            title="Faturamento Mensal"
            value={`R$ ${stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            description="Meta: R$ 10.000"
            icon={DollarSign}
            trend={{ value: "15%", isPositive: true }}
          />
          <StatsCard
            title="Clientes Ativos"
            value={stats.clientesAtivos.toString()}
            description={`${Math.floor(stats.clientesAtivos * 0.1)} novos este mês`}
            icon={Users}
            trend={{ value: "3%", isPositive: true }}
          />
          <StatsCard
            title="Taxa de Ocupação"
            value={`${stats.taxaOcupacao}%`}
            description={`Hoje: ${Math.floor(stats.agendamentosHoje * 0.8)}/${stats.agendamentosHoje} horários`}
            icon={TrendingUp}
            trend={{ value: "5%", isPositive: true }}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentAppointments />
          
          <div className="space-y-4">
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Ações Rápidas</h3>
              <p className="text-sm opacity-90 mb-4">
                Gerencie seu dia com eficiência
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate('/agendamentos')}
                  className="bg-white/20 hover:bg-white/30 border-0"
                >
                  Novo Agendamento
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate('/agendamentos')}
                  className="bg-white/20 hover:bg-white/30 border-0"
                >
                  Ver Agenda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
