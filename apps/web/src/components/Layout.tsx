import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  showNav?: boolean
}

export default function Layout({ children, title, showBack = false, showNav = true }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const rolePrefix = user?.role === 'DRIVER' ? '/driver' : user?.role === 'ADMIN' ? '/admin' : '/client'

  const navItems = {
    CLIENT: [
      { path: '/client', label: 'Início', icon: '🏠' },
      { path: '/client/rides', label: 'Corridas', icon: '🚗' },
      { path: '/client/profile', label: 'Perfil', icon: '👤' },
    ],
    DRIVER: [
      { path: '/driver', label: 'Início', icon: '🏠' },
      { path: '/driver/earnings', label: 'Ganhos', icon: '💰' },
      { path: '/driver/profile', label: 'Perfil', icon: '👤' },
    ],
    ADMIN: [
      { path: '/admin', label: 'Dashboard', icon: '📊' },
      { path: '/admin/drivers', label: 'Motoristas', icon: '🚗' },
      { path: '/admin/rides', label: 'Corridas', icon: '📋' },
      { path: '/admin/zones', label: 'Zonas', icon: '📍' },
    ],
  }

  const items = user ? navItems[user.role] || [] : []

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {title ? (
            <h1 className="font-display text-lg font-bold text-gray-900">{title}</h1>
          ) : (
            <Link to={rolePrefix} className="font-display text-xl font-bold text-primary">
              Lumia
            </Link>
          )}
        </div>
        {user && (
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="text-sm text-gray-500 hover:text-danger transition-colors"
          >
            Sair
          </button>
        )}
      </header>

      {/* Conteúdo */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Navegação inferior (mobile) */}
      {showNav && items.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around py-2">
            {items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
                    isActive ? 'text-primary' : 'text-gray-400',
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
