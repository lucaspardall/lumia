import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import { cn, formatCurrency } from '../../lib/utils'
import { useAuthStore } from '../../store/auth.store'
import api from '../../lib/api'
import { useGeolocation } from '../../hooks/useGeolocation'
import { connectSocket, disconnectSocket, getSocket } from '../../lib/socket'

export default function DriverHome() {
  const { user } = useAuthStore()
  const { latitude, longitude } = useGeolocation(true)
  const [isOnline, setIsOnline] = useState(false)
  const [incomingRide, setIncomingRide] = useState<any>(null)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('lumia:token')
    if (!token) return

    const socket = connectSocket(token)

    socket.on('ride:new-request', (ride: any) => {
      setIncomingRide(ride)
    })

    socket.on('ride:cancelled-by-client', () => {
      setIncomingRide(null)
      setActiveRide(null)
    })

    return () => { disconnectSocket() }
  }, [])

  useEffect(() => {
    if (isOnline && latitude && longitude) {
      const socket = getSocket()
      socket?.emit('driver:update-location', { lat: latitude, lng: longitude })
    }
  }, [latitude, longitude, isOnline])

  const toggleOnline = async () => {
    try {
      const newStatus = isOnline ? 'OFFLINE' : 'ONLINE'
      await api.post('/driver/availability', { availability: newStatus })
      setIsOnline(!isOnline)
      const socket = getSocket()
      if (newStatus === 'ONLINE') {
        socket?.emit('driver:online')
      } else {
        socket?.emit('driver:offline')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const acceptRide = async () => {
    if (!incomingRide) return
    setLoading(true)
    try {
      const { data } = await api.put(`/rides/${incomingRide.id}/accept`)
      setActiveRide(data)
      setIncomingRide(null)
    } finally {
      setLoading(false)
    }
  }

  const advanceRide = async (action: string) => {
    if (!activeRide) return
    setLoading(true)
    try {
      const { data } = await api.put(`/rides/${activeRide.id}/${action}`)
      if (action === 'complete') {
        setActiveRide(null)
      } else {
        setActiveRide(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const getNextAction = () => {
    if (!activeRide) return null
    switch (activeRide.status) {
      case 'ACCEPTED': return { action: 'arrive', label: 'Cheguei no local', icon: '📍' }
      case 'ARRIVING': return { action: 'start', label: 'Iniciar corrida', icon: '🚀' }
      case 'IN_PROGRESS': return { action: 'complete', label: 'Finalizar corrida', icon: '✅' }
      default: return null
    }
  }

  const nextAction = getNextAction()

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        {/* Welcome + Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-200 text-sm">Olá,</p>
            <h1 className="font-display text-2xl font-bold text-white">{user?.name.split(' ')[0]}</h1>
          </div>

          {/* Online toggle */}
          <button
            onClick={toggleOnline}
            className={cn(
              'relative w-20 h-10 rounded-full transition-all duration-300',
              isOnline ? 'bg-accent glow-accent' : 'bg-dark-500',
            )}
          >
            <div className={cn(
              'absolute top-1 w-8 h-8 rounded-full bg-white shadow-lg transition-all duration-300',
              isOnline ? 'left-11' : 'left-1',
            )} />
          </button>
        </div>

        {/* Status card */}
        <div className={cn(
          'rounded-3xl p-6 text-center transition-all duration-500',
          isOnline ? 'bg-accent/10 border border-accent/20' : 'bg-surface border border-dark-500',
        )}>
          <div className={cn(
            'w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-4',
            isOnline ? 'bg-accent/20' : 'bg-dark-500/50',
          )}>
            {isOnline ? '🟢' : '🔴'}
          </div>
          <h2 className={cn('font-display text-xl font-bold mb-1', isOnline ? 'text-accent' : 'text-dark-200')}>
            {isOnline ? 'Online' : 'Offline'}
          </h2>
          <p className="text-dark-200 text-sm">
            {isOnline ? 'Aguardando chamados...' : 'Fique online para receber corridas'}
          </p>
        </div>

        {/* Incoming ride notification */}
        {incomingRide && (
          <div className="bg-primary/10 border-2 border-primary rounded-3xl p-5 animate-bounce-in glow-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-white">Nova corrida!</h3>
                <p className="text-primary text-sm font-bold">{formatCurrency(incomingRide.price)}</p>
              </div>
            </div>

            <div className="bg-dark-800/50 rounded-2xl p-3 mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-sm text-white">{incomingRide.originZone?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-danger rounded-sm" />
                <span className="text-sm text-white">{incomingRide.destZone?.name}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="danger" className="flex-1" onClick={() => setIncomingRide(null)}>
                Recusar
              </Button>
              <Button className="flex-1" loading={loading} onClick={acceptRide}>
                Aceitar
              </Button>
            </div>
          </div>
        )}

        {/* Active ride */}
        {activeRide && (
          <div className="bg-surface border border-dark-500 rounded-3xl p-5 animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white">Corrida ativa</h3>
              <span className="text-lg font-display font-bold text-primary">{formatCurrency(activeRide.price)}</span>
            </div>

            <div className="bg-dark-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-sm text-white">{activeRide.originZone?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-danger rounded-sm" />
                <span className="text-sm text-white">{activeRide.destZone?.name}</span>
              </div>
            </div>

            <div className="bg-dark-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="text-white text-sm font-semibold">{activeRide.client?.name}</p>
                <p className="text-dark-200 text-xs">{activeRide.paymentMethod === 'PIX' ? '💠 Pix' : '💵 Dinheiro'}</p>
              </div>
            </div>

            {nextAction && (
              <Button fullWidth size="lg" loading={loading} onClick={() => advanceRide(nextAction.action)}>
                {nextAction.icon} {nextAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
