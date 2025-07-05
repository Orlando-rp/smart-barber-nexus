import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface UserProfile {
  id: string
  user_id: string
  saas_client_id: string | null
  nome: string
  email: string
  telefone: string | null
  avatar_url: string | null
  ativo: boolean
}

interface UserRole {
  role: 'super_admin' | 'client_owner' | 'barber' | 'receptionist'
  saas_client_id: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  userRoles: UserRole[]
  loading: boolean
  userDataLoaded: boolean
  isSuperAdmin: boolean
  isClientOwner: boolean
  signOut: () => Promise<void>
  refetchUserData: () => Promise<void>
  getRedirectPath: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [userDataLoaded, setUserDataLoaded] = useState(false)

  const isSuperAdmin = userRoles.some(role => role.role === 'super_admin')
  const isClientOwner = userRoles.some(role => role.role === 'client_owner')

  const getRedirectPath = () => {
    if (isSuperAdmin) {
      return '/admin'
    }
    return '/'
  }

  const fetchUserData = async (userId: string) => {
    try {
      setUserDataLoaded(false)
      
      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      // Buscar roles do usuário
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role, saas_client_id')
        .eq('user_id', userId)

      if (roles) {
        setUserRoles(roles)
      }
      
      setUserDataLoaded(true)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserDataLoaded(true)
    }
  }

  const refetchUserData = async () => {
    if (user?.id) {
      await fetchUserData(user.id)
    }
  }

  useEffect(() => {
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            fetchUserData(session.user.id)
          }, 0)
        } else {
          setUserProfile(null)
          setUserRoles([])
          setUserDataLoaded(false)
        }
        
        setLoading(false)
      }
    )

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchUserData(session.user.id)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      // Limpar estado local primeiro
      setUserProfile(null)
      setUserRoles([])
      
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // Tentar logout global
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (err) {
        // Ignorar erros
      }
      
      // Forçar refresh da página para estado limpo
      window.location.href = '/auth'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    session,
    userProfile,
    userRoles,
    loading,
    userDataLoaded,
    isSuperAdmin,
    isClientOwner,
    signOut,
    refetchUserData,
    getRedirectPath,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}