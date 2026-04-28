import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRideStore } from '../../store/ride.store'
import Button from '../../components/Button'
import { cn, formatCurrency } from '../../lib/utils'

const statusSteps = [
  { key: 'REQUESTED', label: 'Buscando motorista', icon: '🔍' },
  { key: 'ACCEPTED', label: 'Motorista a caminho', icon: '🚗' },
  { key: 'ARRIVING', label: 'Motorista chegando', icon: '📍' },
  { key: 'IN_PROGRESS', label: 'Em viagem', icon: '🛣️' },
  { key: 'COMPLETED', label: 'Finalizada', icon: '✅' },
]

export default function ClientRide() {
  const { currentRide, cancelRide, rateRide, listenToRideEvents, clearRide } = useRideStore()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!currentRide) {
      navigate('/client')
      return
    }
    const unsub = listenToRideEvents()
    return unsub
  }, [])

  if (!currentRide) return null

  const currentStepIdx = statusSteps.findIndex(s => s.key === currentRide.status)
  const isCompleted = currentRide.status === 'COMPLETED'
  const isCancelled = currentRide.status === 'CANCELLED'

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelRide()
    } finally {
      setCancelling(false)
    }
  }

  const handleRate = async (stars: number) => {
    setRating(stars)
    await rateRide(stars)
    setTimeout(() => {
      clearRide()
      navigate('/client')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Map area */}
      <div className="flex-1 relative bg-dark-900 min-h-[40vh]">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0,180,216,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,180,216,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />

        {/* Status overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-bounce-in">
            <div className="text-5xl mb-3">
              {statusSteps[currentStepIdx]?.icon || '🚗'}
            </div>
            <p className="text-white font-display font-bold text-lg">
              {statusSteps[currentStepIdx]?.label}
            </p>
            {currentRide.status === 'REQUESTED' && (
              <div className="flex items-center gap-2 mt-3 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>

        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-20 map-gradient-top" />
      </div>

      {/* Bottom panel */}
      <div className="bottom-sheet rounded-t-3xl -mt-6 relative z-10 px-5 pt-6 pb-8">
        {/* Progress steps */}
        {!isCancelled && (
          <div className="flex items-center justify-between mb-6 px-2">
            {statusSteps.slice(0, -1).map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className={cn(
                  'w-3 h-3 rounded-full transition-all duration-500 flex-shrink-0',
                  i <= currentStepIdx ? 'bg-primary glow-primary' : 'bg-dark-500',
                )} />
                {i < 3 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-1 transition-all duration-500',
                    i < currentStepIdx ? 'bg-primary' : 'bg-dark-500',
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Driver info */}
        {currentRide.driver && (
          <div className="bg-dark-800 rounded-2xl p-4 flex items-center gap-4 mb-4 animate-slide-up">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-2xl">
              🧑‍✈️
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{(currentRide.driver as any).user?.name || 'Motorista'}</p>
              <p className="text-dark-200 text-sm">{(currentRide.driver as any).vehicleModel} • {(currentRide.driver as any).vehicleColor}</p>
              <p className="text-dark-300 text-xs mt-0.5">{(currentRide.driver as any).licensePlate}</p>
            </div>
          </div>
        )}

        {/* Ride details */}
        <div className="bg-dark-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-dark-200 mb-1">Valor da corrida</p>
              <p className="text-xl font-display font-bold text-white">{formatCurrency(currentRide.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-dark-200 mb-1">Pagamento</p>
              <p className="text-sm font-semibold text-white">
                {currentRide.paymentMethod === 'PIX' ? '💠 Pix' : '💵 Dinheiro'}
              </p>
            </div>
          </div>
        </div>

        {/* Rating (completed) */}
        {isCompleted && !rating && (
          <div className="text-center space-y-4 animate-bounce-in">
            <p className="font-display font-bold text-white text-lg">Como foi a viagem?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="text-4xl transition-transform hover:scale-125 active:scale-95"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        )}

        {rating > 0 && (
          <div className="text-center animate-bounce-in">
            <p className="text-accent font-display font-bold text-lg">Obrigado pela avaliação!</p>
          </div>
        )}

        {/* Cancel */}
        {isCancelled && (
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-danger font-display font-bold">Corrida cancelada</p>
            <Button variant="secondary" fullWidth onClick={() => { clearRide(); navigate('/client') }}>
              Voltar ao início
            </Button>
          </div>
        )}

        {!isCompleted && !isCancelled && currentRide.status !== 'IN_PROGRESS' && (
          <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>
            Cancelar corrida
          </Button>
        )}
      </div>
    </div>
  )
}
