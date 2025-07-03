import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}

export const ProtectedRoute = ({ children, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isSuperAdmin, userRoles } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
      return
    }

    if (!loading && user && userRoles.length > 0) {
      // Redirecionamento baseado em roles após login
      if (isSuperAdmin && location.pathname === '/') {
        navigate('/admin')
        return
      }
      
      // Verificar se usuário tem acesso à rota protegida para super admin
      if (requireSuperAdmin && !isSuperAdmin) {
        navigate('/')
        return
      }
    }
  }, [user, loading, navigate, isSuperAdmin, userRoles, location.pathname, requireSuperAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}