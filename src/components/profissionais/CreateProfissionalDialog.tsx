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
import { Label } from "@/components/ui/label"
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
import { Switch } from "@/components/ui/switch"
import { useProfissionais } from "@/hooks/useProfissionais"
import { useServicos } from "@/hooks/useServicos"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

const profissionalSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  especialidades: z.array(z.string()).optional(),
  servicos: z.array(z.string()).optional(),
  comissao_percentual: z.number().min(0).max(100).optional(),
  ativo: z.boolean().default(true),
})

type ProfissionalFormData = z.infer<typeof profissionalSchema>

interface CreateProfissionalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profissional?: any
  onClose: () => void
}

const especialidadesOptions = [
  "Corte Masculino",
  "Corte Feminino",
  "Barba",
  "Bigode",
  "Sobrancelha",
  "Hidratação",
  "Relaxamento",
  "Escova",
  "Penteado",
  "Maquiagem",
]

export function CreateProfissionalDialog({
  open,
  onOpenChange,
  profissional,
  onClose,
}: CreateProfissionalDialogProps) {
  const [unidades, setUnidades] = useState<any[]>([])
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>([])
  const [selectedServicos, setSelectedServicos] = useState<string[]>([])
  const { createProfissional, updateProfissional } = useProfissionais()
  const { servicos } = useServicos()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfissionalFormData>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      especialidades: [],
      servicos: [],
      comissao_percentual: 0,
      ativo: true,
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
    if (profissional) {
      form.reset({
        nome: profissional.nome,
        email: profissional.email || "",
        telefone: profissional.telefone || "",
        especialidades: profissional.especialidades || [],
        servicos: profissional.servicos || [],
        comissao_percentual: profissional.comissao_percentual || 0,
        ativo: profissional.ativo,
      })
      setSelectedEspecialidades(profissional.especialidades || [])
      setSelectedServicos(profissional.servicos || [])
    } else {
      form.reset({
        nome: "",
        email: "",
        telefone: "",
        especialidades: [],
        servicos: [],
        comissao_percentual: 0,
        ativo: true,
      })
      setSelectedEspecialidades([])
      setSelectedServicos([])
    }
  }, [profissional, form])

  const handleEspecialidadeToggle = (especialidade: string) => {
    const newEspecialidades = selectedEspecialidades.includes(especialidade)
      ? selectedEspecialidades.filter(e => e !== especialidade)
      : [...selectedEspecialidades, especialidade]
    
    setSelectedEspecialidades(newEspecialidades)
    form.setValue('especialidades', newEspecialidades)
  }

  const handleServicoToggle = (servicoId: string) => {
    const newServicos = selectedServicos.includes(servicoId)
      ? selectedServicos.filter(s => s !== servicoId)
      : [...selectedServicos, servicoId]
    
    setSelectedServicos(newServicos)
    form.setValue('servicos', newServicos)
  }

  const onSubmit = async (data: ProfissionalFormData) => {
    if (unidades.length === 0) {
      console.error('Nenhuma unidade encontrada')
      return
    }

    setLoading(true)

    try {
      const profissionalData = {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone || null,
        especialidades: selectedEspecialidades,
        servicos: selectedServicos,
        comissao_percentual: data.comissao_percentual || 0,
        ativo: data.ativo,
        unidade_id: unidades[0].id, // Por simplicidade, usar a primeira unidade
      }

      if (profissional) {
        await updateProfissional(profissional.id, profissionalData)
      } else {
        await createProfissional(profissionalData)
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar profissional:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {profissional ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            {profissional 
              ? "Atualize as informações do profissional."
              : "Adicione um novo profissional à sua equipe."
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
                    <Input placeholder="Nome do profissional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="comissao_percentual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comissão (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      min="0" 
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Especialidades</Label>
              <div className="grid grid-cols-2 gap-2">
                {especialidadesOptions.map((especialidade) => (
                  <div key={especialidade} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={especialidade}
                      checked={selectedEspecialidades.includes(especialidade)}
                      onChange={() => handleEspecialidadeToggle(especialidade)}
                      className="w-4 h-4"
                    />
                    <Label 
                      htmlFor={especialidade} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {especialidade}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serviços que pode realizar</Label>
              {servicos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum serviço cadastrado. Cadastre serviços primeiro na página de Serviços.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {servicos.map((servico) => (
                    <div key={servico.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`servico-${servico.id}`}
                        checked={selectedServicos.includes(servico.id)}
                        onChange={() => handleServicoToggle(servico.id)}
                        className="w-4 h-4"
                      />
                      <Label 
                        htmlFor={`servico-${servico.id}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {servico.nome} - R$ {servico.preco.toFixed(2)}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Profissional Ativo
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Profissional pode receber agendamentos
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                  : profissional 
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