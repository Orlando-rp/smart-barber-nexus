import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}

export const ProtectedRoute = ({ children, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isSuperAdmin, userRoles, userDataLoaded, getRedirectPath } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('ProtectedRoute effect:', { 
      loading, 
      user: !!user, 
      userDataLoaded, 
      isSuperAdmin, 
      currentPath: location.pathname,
      requireSuperAdmin 
    })

    if (!loading && !user) {
      console.log('Redirecting to auth - no user')
      navigate('/auth')
      return
    }

    if (!loading && user && userDataLoaded) {
      console.log('User data loaded, checking redirection')
      const correctPath = getRedirectPath()
      console.log('Correct path for user:', correctPath)
      
      // Se está na página raiz e deveria estar na página de admin
    if (correctPath === '/admin' && location.pathname !== '/admin') {
      console.log('Super admin logado e fora de /admin, redirecionando...')
      navigate('/admin')
      return
    }
     
      // Verificar se usuário tem acesso à rota protegida para super admin
      if (requireSuperAdmin && !isSuperAdmin) {
        console.log('Redirecting non-super-admin from protected route')
        navigate('/')
        return
      }
    }
  }, [user, loading, navigate, isSuperAdmin, userRoles, userDataLoaded, location.pathname, requireSuperAdmin, getRedirectPath])

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