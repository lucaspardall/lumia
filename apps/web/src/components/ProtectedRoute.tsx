import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redireciona para a área correta do usuário
    const roleRoutes: Record<string, string> = {
      CLIENT: '/client',
      DRIVER: '/driver',
      ADMIN: '/admin',
    }
    return <Navigate to={roleRoutes[user.role] || '/'} replace />
  }

  return <>{children}</>
}
