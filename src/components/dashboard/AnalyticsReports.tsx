import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Percent } from "lucide-react"

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))']

export function AnalyticsReports() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'trimestre'>('mes')
  const { analytics, loading } = useAnalytics(periodo)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatórios e Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusData = Object.entries(analytics.agendamentosPorStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }))

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Relatórios e Analytics</h2>
        <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
            <SelectItem value="trimestre">Último Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAgendamentos}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.crescimentoSemanal >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(analytics.crescimentoSemanal).toFixed(1)}% vs semana anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {analytics.faturamentoTotal.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.crescimentoMensal >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(analytics.crescimentoMensal).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clientesUnicos}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: R$ {analytics.mediaTicket.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.taxaCancelamento.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.agendamentosPorStatus.cancelado || 0} cancelamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Services Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.servicosMaisPopulares}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Agendamentos']}
                  labelFormatter={(label) => `Serviço: ${label}`}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Serviços por Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.servicosMaisPopulares.map((servico, index) => (
                <div key={servico.nome} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{servico.nome}</p>
                      <p className="text-sm text-muted-foreground">{servico.count} agendamentos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {servico.receita.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.profissionaisPorformance.map((prof, index) => (
                <div key={prof.nome} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{prof.nome}</p>
                      <p className="text-sm text-muted-foreground">{prof.agendamentos} agendamentos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {prof.receita.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}