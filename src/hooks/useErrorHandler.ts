import { useToast } from "@/hooks/use-toast"
import { useCallback } from "react"

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  customMessage?: string
}

export const useErrorHandler = () => {
  const { toast } = useToast()

  const handleError = useCallback((
    error: any, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = false, // Changed from true to false to reduce console pollution
      customMessage
    } = options

    // Extract meaningful error message
    let errorMessage = "Ocorreu um erro inesperado"
    
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    } else if (error?.error?.message) {
      errorMessage = error.error.message
    }

    // Log to console only if explicitly requested
    if (logToConsole) {
      console.error("Error handled:", error)
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: "Erro",
        description: customMessage || errorMessage,
        variant: "destructive",
      })
    }

    return errorMessage
  }, [toast])

  const handleSuccess = useCallback((message: string) => {
    toast({
      title: "Sucesso",
      description: message,
    })
  }, [toast])

  const handleWarning = useCallback((message: string) => {
    toast({
      title: "Atenção",
      description: message,
      variant: "default",
    })
  }, [toast])

  return {
    handleError,
    handleSuccess,
    handleWarning
  }
}