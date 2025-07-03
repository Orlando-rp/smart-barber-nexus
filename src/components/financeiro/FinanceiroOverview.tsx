import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFinanceiro } from "@/hooks/useFinanceiro"
import { DollarSign, TrendingUp, TrendingDown, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function FinanceiroOverview() {
  const { comissoes, movimentacoes, loading, getResumoFinanceiro } = useFinanceiro()
  const resumo = getResumoFinanceiro()

  if (loading) {
    return <div className="flex justify-center p-8">Carregando dados financeiros...</div>
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {resumo.receitas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {resumo.despesas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {resumo.saldo.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {resumo.totalComissoes.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comissões dos Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões dos Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comissoes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma comissão calculada para este período
              </p>
            ) : (
              comissoes.map((comissao) => (
                <div key={comissao.profissional_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{comissao.profissional_nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {comissao.quantidade_servicos} serviços • {comissao.percentual_comissao}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {comissao.valor_comissao.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      de R$ {comissao.valor_total_servicos.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movimentações Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações Recentes</CardTitle>
          <Button size="sm">Ver Todas</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movimentacoes.slice(0, 5).map((mov) => (
              <div key={mov.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={mov.tipo === 'receita' ? 'default' : 'secondary'}>
                      {mov.tipo}
                    </Badge>
                    <span className="font-medium">{mov.descricao}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mov.categoria} • {format(new Date(mov.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-right ${mov.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="font-bold">
                      {mov.tipo === 'receita' ? '+' : '-'}R$ {Number(mov.valor).toFixed(2)}
                    </div>
                  </div>
                  <Badge variant={mov.status === 'pago' ? 'default' : 'secondary'}>
                    {mov.status}
                  </Badge>
                </div>
              </div>
            ))}
            {movimentacoes.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma movimentação registrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}