import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import { useRideStore } from '../../store/ride.store'
import { useAuthStore } from '../../store/auth.store'
import { formatCurrency } from '../../lib/utils'

export default function ClientHome() {
  const { user } = useAuthStore()
  const { zones, fetchZones, getPrice, requestRide, currentRide, isLoading, error } = useRideStore()
  const navigate = useNavigate()

  const [originZoneId, setOriginZoneId] = useState('')
  const [destZoneId, setDestZoneId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CASH'>('PIX')
  const [price, setPrice] = useState<number | null>(null)
  const [pickupAddress, setPickupAddress] = useState('')

  useEffect(() => {
    fetchZones()
  }, [])

  // Se já tem corrida ativa, redireciona
  useEffect(() => {
    if (currentRide && currentRide.status !== 'COMPLETED' && currentRide.status !== 'CANCELLED') {
      navigate('/client/ride')
    }
  }, [currentRide])

  // Buscar preço quando seleciona zonas
  useEffect(() => {
    if (originZoneId && destZoneId && originZoneId !== destZoneId) {
      getPrice(originZoneId, destZoneId).then(setPrice)
    } else {
      setPrice(null)
    }
  }, [originZoneId, destZoneId])

  async function handleRequest() {
    if (!originZoneId || !destZoneId) return

    const originZone = zones.find((z) => z.id === originZoneId)
    if (!originZone) return

    try {
      await requestRide({
        originZoneId,
        destZoneId,
        pickupLat: originZone.centerLat,
        pickupLng: originZone.centerLng,
        pickupAddress: pickupAddress || undefined,
        paymentMethod,
      })
      navigate('/client/ride')
    } catch {
      // Erro no store
    }
  }

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto">
        {/* Saudação */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Olá, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-gray-500">Para onde vamos?</p>
        </div>

        {/* Card de solicitação */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          {error && (
            <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* Origem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">De onde?</label>
            <select
              value={originZoneId}
              onChange={(e) => setOriginZoneId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecione a zona de origem</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Endereço pickup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ponto de encontro (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Em frente à padaria"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Para onde?</label>
            <select
              value={destZoneId}
              onChange={(e) => setDestZoneId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecione o destino</option>
              {zones.filter((z) => z.id !== originZoneId).map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Preço */}
          {price !== null && (
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Valor da corrida</p>
              <p className="font-display text-3xl font-bold text-primary">{formatCurrency(price)}</p>
            </div>
          )}

          {/* Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de pagamento</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  paymentMethod === 'PIX' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                PIX
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  paymentMethod === 'CASH' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Dinheiro
              </button>
            </div>
          </div>

          {/* Botão */}
          <Button
            onClick={handleRequest}
            loading={isLoading}
            disabled={!originZoneId || !destZoneId || originZoneId === destZoneId}
            className="w-full"
            size="lg"
          >
            Solicitar Corrida
          </Button>
        </div>
      </div>
    </Layout>
  )
}
