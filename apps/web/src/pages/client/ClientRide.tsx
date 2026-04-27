import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useRideStore } from '../../store/ride.store'
import { formatCurrency } from '../../lib/utils'

export default function ClientRide() {
  const { currentRide, cancelRide, rateRide, listenToRideEvents, clearRide } = useRideStore()
  const navigate = useNavigate()

  useEffect(() => {
    listenToRideEvents()
  }, [])

  if (!currentRide) {
    return (
      <Layout title="Corrida" showBack>
        <div className="p-4 text-center">
          <p className="text-gray-500">Nenhuma corrida ativa</p>
          <Button onClick={() => navigate('/client')} className="mt-4">
            Solicitar corrida
          </Button>
        </div>
      </Layout>
    )
  }

  const status = currentRide.status

  return (
    <Layout title="Sua corrida" showNav={false}>
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Status principal */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <StatusBadge status={status} />

          {status === 'REQUESTED' && (
            <div className="mt-4">
              <LoadingSpinner text="Buscando motorista..." />
            </div>
          )}

          {status === 'ACCEPTED' && currentRide.driver && (
            <div className="mt-4 space-y-2">
              <p className="font-display text-lg font-bold">{currentRide.driver.user.name}</p>
              <p className="text-gray-500">
                {currentRide.driver.vehicleColor} {currentRide.driver.vehicleMake} {currentRide.driver.vehicleModel}
              </p>
              <p className="text-sm font-mono bg-gray-100 inline-block px-3 py-1 rounded-lg">
                {currentRide.driver.licensePlate}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tel: {currentRide.driver.user.phone}
              </p>
            </div>
          )}

          {status === 'ARRIVING' && (
            <div className="mt-4">
              <p className="font-display text-xl font-bold text-accent">Motorista chegou!</p>
              <p className="text-gray-500">Dirija-se ao ponto de encontro</p>
            </div>
          )}

          {status === 'IN_PROGRESS' && (
            <div className="mt-4">
              <p className="font-display text-xl font-bold text-primary">Em viagem</p>
              <p className="text-gray-500">Aproveite o trajeto</p>
            </div>
          )}

          {status === 'COMPLETED' && (
            <div className="mt-4 space-y-3">
              <p className="font-display text-xl font-bold text-accent">Corrida finalizada!</p>
              <p className="font-display text-3xl font-bold text-primary">
                {formatCurrency(currentRide.price)}
              </p>

              {/* Avaliação */}
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">Avalie o motorista</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => { rateRide(star); clearRide(); navigate('/client') }}
                      className="text-3xl hover:scale-110 transition-transform"
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detalhes da rota */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-0.5 h-8 bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-danger" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Origem</p>
                <p className="font-semibold">{currentRide.originZone.name}</p>
                {currentRide.pickupAddress && (
                  <p className="text-sm text-gray-500">{currentRide.pickupAddress}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-semibold">{currentRide.destZone.name}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between">
            <span className="text-gray-500">Pagamento</span>
            <span className="font-semibold">
              {currentRide.paymentMethod === 'PIX' ? 'PIX' : 'Dinheiro'}
            </span>
          </div>
        </div>

        {/* Botão cancelar */}
        {(status === 'REQUESTED' || status === 'ACCEPTED') && (
          <Button variant="danger" className="w-full" onClick={() => cancelRide('Cancelado pelo passageiro')}>
            Cancelar corrida
          </Button>
        )}
      </div>
    </Layout>
  )
}
