import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { NewClientData } from "@/types/superAdmin"

interface CreateClientDialogProps {
  onCreateClient: (data: NewClientData) => Promise<boolean>
}

export const CreateClientDialog = ({ onCreateClient }: CreateClientDialogProps) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<NewClientData>({
    nome: "",
    email: "",
    telefone: "",
    plano: "basico",
    limite_unidades: 1,
    limite_usuarios: 5
  })

  const handleSubmit = async () => {
    const success = await onCreateClient(formData)
    if (success) {
      setOpen(false)
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        plano: "basico",
        limite_unidades: 1,
        limite_usuarios: 5
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Cliente SaaS</DialogTitle>
          <DialogDescription>
            Adicione um novo cliente (barbearia) ao sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Barbearia</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Barbearia do João"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contato@barbearia.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select 
              value={formData.plano} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, plano: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basico">Básico</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limite_unidades">Limite de Unidades</Label>
              <Input
                id="limite_unidades"
                type="number"
                value={formData.limite_unidades}
                onChange={(e) => setFormData(prev => ({ ...prev, limite_unidades: parseInt(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limite_usuarios">Limite de Usuários</Label>
              <Input
                id="limite_usuarios"
                type="number"
                value={formData.limite_usuarios}
                onChange={(e) => setFormData(prev => ({ ...prev, limite_usuarios: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}