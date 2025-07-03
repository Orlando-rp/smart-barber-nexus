import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

interface ValidationRules {
  [key: string]: ValidationRule
}

interface ValidationErrors {
  [key: string]: string
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const { toast } = useToast()

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = rules[name]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || value.toString().trim() === "")) {
      return "Este campo é obrigatório"
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === "") {
      return null
    }

    // MinLength validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return `Deve ter pelo menos ${rule.minLength} caracteres`
    }

    // MaxLength validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return `Deve ter no máximo ${rule.maxLength} caracteres`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return "Formato inválido"
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }, [rules])

  const validateForm = useCallback((data: Record<string, any>): boolean => {
    const newErrors: ValidationErrors = {}
    let hasErrors = false

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName])
      if (error) {
        newErrors[fieldName] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (hasErrors) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      })
    }

    return !hasErrors
  }, [rules, validateField, toast])

  const validateSingleField = useCallback((name: string, value: any) => {
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ""
    }))
    return !error
  }, [validateField])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }))
  }, [])

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).some(key => errors[key])
  }
}

// Validações comuns pré-definidas
export const commonValidations = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Email inválido"
      }
      return null
    }
  },
  phone: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    custom: (value: string) => {
      if (value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
        return "Telefone deve estar no formato (11) 99999-9999"
      }
      return null
    }
  },
  money: {
    custom: (value: string) => {
      if (value && isNaN(parseFloat(value))) {
        return "Valor deve ser um número válido"
      }
      if (value && parseFloat(value) < 0) {
        return "Valor deve ser positivo"
      }
      return null
    }
  },
  time: {
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    custom: (value: string) => {
      if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
        return "Horário deve estar no formato HH:MM"
      }
      return null
    }
  }
}