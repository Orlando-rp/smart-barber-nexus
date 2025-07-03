import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface AgendamentosFiltersProps {
  onFiltersChange: (filters: {
    search: string
    status: string
    profissional: string
    servico: string
    periodo: string
  }) => void
  profissionais: Array<{ id: string; nome: string }>
  servicos: Array<{ id: string; nome: string }>
}

export function AgendamentosFilters({ 
  onFiltersChange, 
  profissionais, 
  servicos 
}: AgendamentosFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    profissional: 'todos',
    servico: 'todos',
    periodo: 'hoje'
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'todos',
      profissional: 'todos',
      servico: 'todos',
      periodo: 'hoje'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.search || 
    filters.status !== 'todos' || 
    filters.profissional !== 'todos' || 
    filters.servico !== 'todos' || 
    filters.periodo !== 'hoje'

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Busca por cliente */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="faltou">Faltou</SelectItem>
          </SelectContent>
        </Select>

        {/* Profissional */}
        <Select value={filters.profissional} onValueChange={(value) => handleFilterChange('profissional', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Profissionais</SelectItem>
            {profissionais.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Serviço */}
        <Select value={filters.servico} onValueChange={(value) => handleFilterChange('servico', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Serviços</SelectItem>
            {servicos.map((servico) => (
              <SelectItem key={servico.id} value={servico.id}>
                {servico.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Período */}
        <Select value={filters.periodo} onValueChange={(value) => handleFilterChange('periodo', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="amanha">Amanhã</SelectItem>
            <SelectItem value="esta_semana">Esta Semana</SelectItem>
            <SelectItem value="proximo_semana">Próxima Semana</SelectItem>
            <SelectItem value="este_mes">Este Mês</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}