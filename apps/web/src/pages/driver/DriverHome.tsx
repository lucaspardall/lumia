import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import { useAuthStore } from '../../store/auth.store'
import { getSocket } from '../../lib/socket'
import api from '../../lib/api'
import { formatCurrency } from '../../lib/utils'

interface IncomingRide {
  id: string
  price: number
  originZone: { name: string }
  destZone: { name: string }
  client: { name: string; phone: string }
  pickupAddress?: string
  paymentMethod: string
}

export default function DriverHome() {
  const { user } = useAuthStore()
  const [isOnline, setIsOnline] = useState(false)
  const [incomingRide, setIncomingRide] = useState<IncomingRide | null>(null)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [driverStatus, setDriverStatus] = useState<string>('PENDING')

  // Carrega perfil do motorista
  useEffect(() => {
    api.get('/driver/profile').then(({ data }) => {
      setDriverStatus(data.status)
      setIsOnline(data.availability === 'ONLINE')
      if (data.availability === 'ON_TRIP') {
        // TODO: buscar corrida ativa
      }
    }).catch(() => {})
  }, [])

  // Escuta novos pedidos
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('ride:new-request', (ride: IncomingRide) => {
      if (isOnline) setIncomingRide(ride)
    })

    socket.on('ride:cancelled-by-client', () => {
      setIncomingRide(null)
      setActiveRide(null)
    })

    return () => {
      socket.off('ride:new-request')
      socket.off('ride:cancelled-by-client')
    }
  }, [isOnline])

  async function toggleOnline() {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE'
    try {
      await api.post('/driver/availability', { availability: newStatus })
      setIsOnline(!isOnline)

      const socket = getSocket()
      if (socket) {
        socket.emit(newStatus === 'ONLINE' ? 'driver:online' : 'driver:offline')
      }
    } catch {
      alert('Erro ao alterar status')
    }
  }

  async function acceptRide() {
    if (!incomingRide) return
    try {
      const { data } = await api.put(`/rides/${incomingRide.id}/accept`)
      setActiveRide(data)
      setIncomingRide(null)
    } catch {
      alert('Corrida não está mais disponível')
      setIncomingRide(null)
    }
  }

  async function advanceRideStatus() {
    if (!activeRide) return
    const nextAction: Record<string, string> = {
      ACCEPTED: 'arrive',
      ARRIVING: 'start',
      IN_PROGRESS: 'complete',
    }
    const action = nextAction[activeRide.status]
    if (!action) return

    try {
      const { data } = await api.put(`/rides/${activeRide.id}/${action}`)
      if (data.status === 'COMPLETED') {
        setActiveRide(null)
        alert('Corrida finalizada!')
      } else {
        setActiveRide(data)
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro')
    }
  }

  const actionLabels: Record<string, string> = {
    ACCEPTED: 'Cheguei no local',
    ARRIVING: 'Iniciar corrida',
    IN_PROGRESS: 'Finalizar corrida',
  }

  if (driverStatus === 'PENDING') {
    return (
      <Layout title="Motorista">
        <div className="p-4 text-center py-12">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="font-display text-xl font-bold text-gray-900">Cadastro em análise</h2>
          <p className="text-gray-500 mt-2">
            Seu cadastro está sendo analisado pelo administrador. Você será notificado quando for aprovado.
          </p>
        </div>
      </Layout>
    )
  }

  if (driverStatus === 'BLOCKED') {
    return (
      <Layout title="Motorista">
        <div className="p-4 text-center py-12">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="font-display text-xl font-bold text-danger">Conta bloqueada</h2>
          <p className="text-gray-500 mt-2">
            Entre em contato com o administrador para mais informações.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Status online/offline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 mb-3">Olá, {user?.name?.split(' ')[0]}</p>
          <Button
            onClick={toggleOnline}
            variant={isOnline ? 'danger' : 'primary'}
            size="lg"
            className="w-full"
          >
            {isOnline ? '🔴 Ficar Offline' : '🟢 Ficar Online'}
          </Button>
          {isOnline && !activeRide && (
            <p className="text-accent text-sm mt-3 font-medium">Aguardando corridas...</p>
          )}
        </div>

        {/* Novo pedido */}
        {incomingRide && (
          <div className="bg-secondary/10 border-2 border-secondary rounded-2xl p-5 animate-pulse">
            <h3 className="font-display text-lg font-bold text-secondary mb-3">Nova corrida!</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Passageiro:</strong> {incomingRide.client.name}</p>
              <p><strong>De:</strong> {incomingRide.originZone.name}</p>
              <p><strong>Para:</strong> {incomingRide.destZone.name}</p>
              {incomingRide.pickupAddress && (
                <p><strong>Local:</strong> {incomingRide.pickupAddress}</p>
              )}
              <p className="font-display text-2xl font-bold text-primary text-center mt-3">
                {formatCurrency(incomingRide.price)}
              </p>
              <p className="text-center text-gray-500">
                {incomingRide.paymentMethod === 'PIX' ? 'PIX' : 'Dinheiro'}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setIncomingRide(null)}>
                Recusar
              </Button>
              <Button variant="secondary" className="flex-1" onClick={acceptRide}>
                Aceitar
              </Button>
            </div>
          </div>
        )}

        {/* Corrida ativa */}
        {activeRide && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold">Corrida em andamento</h3>
              <StatusBadge status={activeRide.status} />
            </div>

            <div className="space-y-1 text-sm">
              <p><strong>Passageiro:</strong> {activeRide.client?.name}</p>
              <p><strong>Rota:</strong> {activeRide.originZone?.name} → {activeRide.destZone?.name}</p>
              <p className="font-display text-xl font-bold text-primary">
                {formatCurrency(activeRide.price)}
              </p>
            </div>

            {actionLabels[activeRide.status] && (
              <Button onClick={advanceRideStatus} className="w-full" size="lg">
                {actionLabels[activeRide.status]}
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
