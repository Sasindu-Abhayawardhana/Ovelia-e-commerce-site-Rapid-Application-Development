import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Skeleton } from '@/components/ui/Skeleton'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user        = useAuthStore(s => s.user)
  const initialized = useAuthStore(s => s.initialized)
  const location    = useLocation()

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
