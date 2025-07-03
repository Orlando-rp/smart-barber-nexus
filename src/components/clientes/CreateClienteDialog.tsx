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
import { useClientes } from "@/hooks/useClientes"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

const clienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  data_nascimento: z.string().optional(),
  observacoes: z.string().optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface CreateClienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: any
  onClose: () => void
}

export function CreateClienteDialog({
  open,
  onOpenChange,
  cliente,
  onClose,
}: CreateClienteDialogProps) {
  const [unidades, setUnidades] = useState<any[]>([])
  const { createCliente, updateCliente } = useClientes()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      data_nascimento: "",
      observacoes: "",
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
    if (cliente) {
      form.reset({
        nome: cliente.nome,
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        data_nascimento: cliente.data_nascimento || "",
        observacoes: cliente.observacoes || "",
      })
    } else {
      form.reset({
        nome: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        observacoes: "",
      })
    }
  }, [cliente, form])

  const onSubmit = async (data: ClienteFormData) => {
    if (unidades.length === 0) {
      console.error('Nenhuma unidade encontrada')
      return
    }

    setLoading(true)

    try {
      const clienteData = {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone || null,
        data_nascimento: data.data_nascimento || null,
        observacoes: data.observacoes || null,
        unidade_id: unidades[0].id,
      }

      if (cliente) {
        await updateCliente(cliente.id, clienteData)
      } else {
        await createCliente(clienteData)
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {cliente 
              ? "Atualize as informações do cliente."
              : "Adicione um novo cliente ao seu sistema."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@exemplo.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="data_nascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o cliente..."
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  : cliente 
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