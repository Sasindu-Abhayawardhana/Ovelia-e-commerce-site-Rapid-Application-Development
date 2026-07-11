import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user     = useAuthStore(s => s.user)
  const isAdmin  = useAuthStore(s => s.isAdmin)
  const initialized = useAuthStore(s => s.initialized)

  if (!initialized) return null

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
