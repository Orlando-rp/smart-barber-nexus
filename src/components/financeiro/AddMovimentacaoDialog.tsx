import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFinanceiro, MovimentacaoFinanceira } from "@/hooks/useFinanceiro"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Plus } from "lucide-react"

interface AddMovimentacaoDialogProps {
  onSuccess?: () => void
}

export function AddMovimentacaoDialog({ onSuccess }: AddMovimentacaoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { adicionarMovimentacao } = useFinanceiro()
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const [formData, setFormData] = useState({
    tipo: '' as 'receita' | 'despesa' | '',
    categoria: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    observacoes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.saas_client_id) return

    setLoading(true)
    try {
      // Get first active unit for the user
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('saas_client_id', userProfile?.saas_client_id)
        .eq('ativo', true)
        .limit(1)

      if (!unidades || unidades.length === 0) {
        throw new Error('Nenhuma unidade encontrada')
      }

      const unidadeId = unidades[0].id
      
      const movimentacao: Omit<MovimentacaoFinanceira, 'id' | 'created_at'> = {
        unidade_id: unidadeId,
        tipo: formData.tipo as 'receita' | 'despesa',
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        status: 'pendente',
        observacoes: formData.observacoes || undefined
      }

      const result = await adicionarMovimentacao(movimentacao)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Movimentação adicionada com sucesso!"
        })
        setOpen(false)
        setFormData({
          tipo: '' as 'receita' | 'despesa' | '',
          categoria: '',
          descricao: '',
          valor: '',
          data_vencimento: '',
          observacoes: ''
        })
        onSuccess?.()
      } else {
        throw new Error('Erro ao adicionar movimentação')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar movimentação. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const categoriasByTipo = {
    receita: ['Serviços', 'Produtos', 'Comissões', 'Outros'],
    despesa: ['Aluguel', 'Salários', 'Materiais', 'Energia', 'Internet', 'Marketing', 'Outros']
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Movimentação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Movimentação Financeira</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou despesa ao sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: 'receita' | 'despesa') => 
                setFormData(prev => ({ ...prev, tipo: value, categoria: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo && (
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasByTipo[formData.tipo].map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Aluguel do mês"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_vencimento">Data de Vencimento</Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.tipo || !formData.categoria}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}