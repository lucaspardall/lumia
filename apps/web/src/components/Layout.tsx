import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  showNav?: boolean
  transparent?: boolean
  overlay?: boolean
}

export default function Layout({ children, title, showBack = false, showNav = true, transparent = false, overlay = false }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const rolePrefix = user?.role === 'DRIVER' ? '/driver' : user?.role === 'ADMIN' ? '/admin' : '/client'

  const navItems = {
    CLIENT: [
      { path: '/client', label: 'Início', icon: HomeIcon },
      { path: '/client/rides', label: 'Corridas', icon: CarIcon },
      { path: '/client/profile', label: 'Perfil', icon: UserIcon },
    ],
    DRIVER: [
      { path: '/driver', label: 'Início', icon: HomeIcon },
      { path: '/driver/earnings', label: 'Ganhos', icon: WalletIcon },
      { path: '/driver/profile', label: 'Perfil', icon: UserIcon },
    ],
    ADMIN: [
      { path: '/admin', label: 'Dashboard', icon: ChartIcon },
      { path: '/admin/drivers', label: 'Motoristas', icon: CarIcon },
      { path: '/admin/rides', label: 'Corridas', icon: ListIcon },
      { path: '/admin/zones', label: 'Zonas', icon: MapPinIcon },
    ],
  }

  const items = user ? navItems[user.role] || [] : []

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      {!overlay && (
        <header className={cn(
          'px-4 py-3 flex items-center justify-between sticky top-0 z-50',
          transparent ? 'bg-transparent' : 'bg-dark-900/80 backdrop-blur-xl border-b border-white/5'
        )}>
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={() => navigate(-1)} className="text-dark-100 hover:text-white p-1 -ml-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {title ? (
              <h1 className="font-display text-lg font-bold text-white">{title}</h1>
            ) : (
              <Link to={rolePrefix} className="font-display text-xl font-bold">
                <span className="text-primary">Lu</span>
                <span className="text-white">mia</span>
              </Link>
            )}
          </div>
          {user && (
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="text-sm text-dark-200 hover:text-danger transition-colors"
            >
              Sair
            </button>
          )}
        </header>
      )}

      {/* Conteúdo */}
      <main className={cn('flex-1', !overlay && 'pb-24')}>{children}</main>

      {/* Bottom Nav moderna */}
      {showNav && items.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-dark-900/90 backdrop-blur-xl border-t border-white/5">
            <div className="flex items-center justify-around py-2 px-2">
              {items.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 relative',
                      isActive ? 'text-primary' : 'text-dark-200 hover:text-dark-100',
                    )}
                  >
                    {isActive && (
                      <div className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                    <Icon className="w-5 h-5" filled={isActive} />
                    <span className={cn('text-[10px] font-semibold', isActive && 'text-primary')}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}

// SVG Icons
function HomeIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.97 2.59a1.5 1.5 0 00-1.94 0l-7.5 6.363A1.5 1.5 0 003 10.097V19.5A1.5 1.5 0 004.5 21h4.75a.75.75 0 00.75-.75V14h4v6.25c0 .414.336.75.75.75h4.75a1.5 1.5 0 001.5-1.5v-9.403a1.5 1.5 0 00-.53-1.144l-7.5-6.363z"/></svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
  )
}

function CarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  )
}

function UserIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd"/></svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
  )
}

function WalletIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z"/></svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"/></svg>
  )
}

function ChartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"/></svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>
  )
}

function ListIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd"/></svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
  )
}

function MapPinIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
  )
}
