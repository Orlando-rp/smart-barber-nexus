import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Plus, Clock, DollarSign } from "lucide-react"

// Mock data - será substituído por dados reais do Supabase
const servicosData = [
  {
    id: "1",
    nome: "Corte Tradicional",
    descricao: "Corte clássico masculino",
    preco: 25,
    duracao_minutos: 30,
    categoria: "corte",
    ativo: true,
  },
  {
    id: "2",
    nome: "Corte + Barba",
    descricao: "Corte completo com barba",
    preco: 45,
    duracao_minutos: 60,
    categoria: "combo",
    ativo: true,
  },
  {
    id: "3",
    nome: "Barba",
    descricao: "Serviço de barba",
    preco: 20,
    duracao_minutos: 30,
    categoria: "barba",
    ativo: true,
  },
  {
    id: "4",
    nome: "Sobrancelha",
    descricao: "Design de sobrancelha masculina",
    preco: 15,
    duracao_minutos: 15,
    categoria: "estética",
    ativo: true,
  },
]

const categoriaConfig = {
  corte: { label: "Corte", color: "bg-blue-100 text-blue-800" },
  barba: { label: "Barba", color: "bg-green-100 text-green-800" },
  combo: { label: "Combo", color: "bg-purple-100 text-purple-800" },
  estética: { label: "Estética", color: "bg-pink-100 text-pink-800" },
}

const Servicos = () => {
  const totalServicos = servicosData.length
  const servicosAtivos = servicosData.filter(s => s.ativo).length
  const precoMedio = servicosData.reduce((total, s) => total + s.preco, 0) / servicosData.length
  const duracaoMedia = servicosData.reduce((total, s) => total + s.duracao_minutos, 0) / servicosData.length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie os serviços oferecidos pela barbearia
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Serviços
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServicos}</div>
              <p className="text-xs text-muted-foreground">cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Serviços Ativos
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{servicosAtivos}</div>
              <p className="text-xs text-muted-foreground">disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Preço Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {precoMedio.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">por serviço</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Duração Média
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(duracaoMedia)} min
              </div>
              <p className="text-xs text-muted-foreground">por atendimento</p>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servicosData.map((servico) => (
                <Card key={servico.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{servico.nome}</CardTitle>
                      <Badge 
                        variant="secondary"
                        className={categoriaConfig[servico.categoria as keyof typeof categoriaConfig]?.color}
                      >
                        {categoriaConfig[servico.categoria as keyof typeof categoriaConfig]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {servico.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          R$ {servico.preco.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600">
                          {servico.duracao_minutos} min
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      <Button 
                        variant={servico.ativo ? "destructive" : "default"}
                        size="sm"
                        className="flex-1"
                      >
                        {servico.ativo ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Servicos