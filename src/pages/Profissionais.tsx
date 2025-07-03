import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateProfissionalDialog } from "@/components/profissionais/CreateProfissionalDialog"
import { useProfissionais } from "@/hooks/useProfissionais"

const Profissionais = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingProfissional, setEditingProfissional] = useState<any>(null)
  
  const { 
    profissionais, 
    loading, 
    toggleProfissionalStatus,
    deleteProfissional,
    refetch 
  } = useProfissionais()

  const filteredProfissionais = profissionais.filter(prof =>
    prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (profissional: any) => {
    setEditingProfissional(profissional)
    setCreateDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setCreateDialogOpen(false)
    setEditingProfissional(null)
    refetch()
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const formatEspecialidades = (especialidades: string[] | null) => {
    if (!especialidades || especialidades.length === 0) return 'Nenhuma'
    return especialidades.join(', ')
  }

  const formatComissao = (comissao: number | null) => {
    if (!comissao) return '0%'
    return `${comissao}%`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe de profissionais, horários e comissões.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Profissional
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profissionais.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profissionais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profissionais.filter(p => p.ativo).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissão Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profissionais.length > 0 
                  ? `${(profissionais.reduce((sum, p) => sum + (p.comissao_percentual || 0), 0) / profissionais.length).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profissionais Inativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profissionais.filter(p => !p.ativo).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Profissionais</CardTitle>
            <CardDescription>
              Gerencie os profissionais da sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar profissionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredProfissionais.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        {searchTerm ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfissionais.map((profissional) => (
                      <TableRow key={profissional.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(profissional.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{profissional.nome}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {profissional.email && (
                              <div className="text-sm">{profissional.email}</div>
                            )}
                            {profissional.telefone && (
                              <div className="text-sm text-muted-foreground">
                                {profissional.telefone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatEspecialidades(profissional.especialidades)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatComissao(profissional.comissao_percentual)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={profissional.ativo ? "default" : "secondary"}>
                            {profissional.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(profissional)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => toggleProfissionalStatus(profissional.id, !profissional.ativo)}
                              >
                                {profissional.ativo ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteProfissional(profissional.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog for Create/Edit */}
        <CreateProfissionalDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          profissional={editingProfissional}
          onClose={handleCloseDialog}
        />
      </div>
    </DashboardLayout>
  )
}

export default Profissionais