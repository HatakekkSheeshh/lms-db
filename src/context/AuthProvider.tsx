import { createContext, useContext, ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthContextType {
  user: ReturnType<typeof useAuthStore>['user']
  isAuthenticated: ReturnType<typeof useAuthStore>['isAuthenticated']
  role: ReturnType<typeof useAuthStore>['role']
  login: ReturnType<typeof useAuthStore>['login']
  logout: ReturnType<typeof useAuthStore>['logout']
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, role, login, logout } = useAuthStore()

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

