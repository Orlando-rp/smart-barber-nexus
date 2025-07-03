import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAgendamentos } from "@/hooks/useAgendamentos"
import { useClientes } from "@/hooks/useClientes"
import { useProfissionais } from "@/hooks/useProfissionais"
import { useServicos } from "@/hooks/useServicos"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

const agendamentoSchema = z.object({
  cliente_id: z.string().optional(),
  cliente_nome: z.string().optional(),
  cliente_telefone: z.string().optional(),
  cliente_email: z.string().optional(),
  profissional_id: z.string().min(1, "Selecione um profissional"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  data_hora: z.string().min(1, "Selecione data e horário"),
  observacoes: z.string().optional(),
  agendamento_origem: z.string().default("admin"),
})

type AgendamentoFormData = z.infer<typeof agendamentoSchema>

interface CreateAgendamentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agendamento?: any
  onClose: () => void
}

export function CreateAgendamentoDialog({
  open,
  onOpenChange,
  agendamento,
  onClose,
}: CreateAgendamentoDialogProps) {
  const [unidades, setUnidades] = useState<any[]>([])
  const [selectedServico, setSelectedServico] = useState<any>(null)
  const { createAgendamento, updateAgendamento } = useAgendamentos()
  const { clientes } = useClientes()
  const { profissionais } = useProfissionais()
  const { servicos } = useServicos()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      cliente_id: "",
      cliente_nome: "",
      cliente_telefone: "",
      cliente_email: "",
      profissional_id: "",
      servico_id: "",
      data_hora: "",
      observacoes: "",
      agendamento_origem: "admin",
    },
  })

  useEffect(() => {
    const fetchUnidades = async () => {
      if (!user) return

      const { data } = await supabase
        .from('unidades')
        .select('id, nome')
        .eq('user_id', user.id)

      setUnidades(data || [])
    }

    fetchUnidades()
  }, [user])

  useEffect(() => {
    if (agendamento) {
      form.reset({
        cliente_id: agendamento.cliente_id || "",
        cliente_nome: agendamento.cliente_nome || "",
        cliente_telefone: agendamento.cliente_telefone || "",
        cliente_email: agendamento.cliente_email || "",
        profissional_id: agendamento.profissional_id,
        servico_id: agendamento.servico_id,
        data_hora: agendamento.data_hora ? agendamento.data_hora.slice(0, 16) : "",
        observacoes: agendamento.observacoes || "",
        agendamento_origem: agendamento.agendamento_origem || "admin",
      })
    } else {
      form.reset({
        cliente_id: "",
        cliente_nome: "",
        cliente_telefone: "",
        cliente_email: "",
        profissional_id: "",
        servico_id: "",
        data_hora: "",
        observacoes: "",
        agendamento_origem: "admin",
      })
    }
  }, [agendamento, form])

  const watchServicoId = form.watch("servico_id")

  useEffect(() => {
    if (watchServicoId) {
      const servico = servicos.find(s => s.id === watchServicoId)
      setSelectedServico(servico)
    }
  }, [watchServicoId, servicos])

  const onSubmit = async (data: AgendamentoFormData) => {
    if (unidades.length === 0) {
      console.error('Nenhuma unidade encontrada')
      return
    }

    if (!selectedServico) {
      console.error('Serviço não encontrado')
      return
    }

    setLoading(true)

    try {
      const agendamentoData = {
        cliente_id: data.cliente_id || null,
        cliente_nome: data.cliente_nome || null,
        cliente_telefone: data.cliente_telefone || null,
        cliente_email: data.cliente_email || null,
        profissional_id: data.profissional_id,
        servico_id: data.servico_id,
        data_hora: data.data_hora,
        duracao_minutos: selectedServico.duracao_minutos,
        preco: selectedServico.preco,
        status: "pendente",
        observacoes: data.observacoes || null,
        agendamento_origem: data.agendamento_origem,
        unidade_id: unidades[0].id,
      }

      if (agendamento) {
        await updateAgendamento(agendamento.id, agendamentoData)
      } else {
        await createAgendamento(agendamentoData)
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {agendamento 
              ? "Atualize as informações do agendamento."
              : "Crie um novo agendamento para um cliente."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente Cadastrado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Novo cliente</SelectItem>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Serviço e Profissional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="servico_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servicos.map((servico) => (
                          <SelectItem key={servico.id} value={servico.id}>
                            {servico.nome} - R$ {servico.preco.toFixed(2)} ({servico.duracao_minutos}min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profissional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profissionais.filter(p => p.ativo).map((profissional) => (
                          <SelectItem key={profissional.id} value={profissional.id}>
                            {profissional.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Data e Hora */}
            <FormField
              control={form.control}
              name="data_hora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Horário *</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o agendamento..."
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resumo do Serviço */}
            {selectedServico && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Resumo do Serviço</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Serviço:</span> {selectedServico.nome}</p>
                  <p><span className="font-medium">Duração:</span> {selectedServico.duracao_minutos} minutos</p>
                  <p><span className="font-medium">Preço:</span> R$ {selectedServico.preco.toFixed(2)}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? "Salvando..." 
                  : agendamento 
                    ? "Atualizar" 
                    : "Criar"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}