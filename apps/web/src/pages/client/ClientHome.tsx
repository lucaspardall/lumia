import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRideStore } from '../../store/ride.store'
import { useGeolocation } from '../../hooks/useGeolocation'
import Button from '../../components/Button'
import { cn, formatCurrency } from '../../lib/utils'
import { useAuthStore } from '../../store/auth.store'

export default function ClientHome() {
  const { zones, fetchZones, getPrice, requestRide, currentRide } = useRideStore()
  const { user } = useAuthStore()
  const { latitude, longitude } = useGeolocation()
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement>(null)

  const [originZone, setOriginZone] = useState('')
  const [destZone, setDestZone] = useState('')
  const [price, setPrice] = useState<number | null>(null)
  const [payment, setPayment] = useState<'PIX' | 'CASH'>('PIX')
  const [loading, setLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(true)
  const [step, setStep] = useState<'select' | 'confirm'>('select')

  useEffect(() => { fetchZones() }, [])

  useEffect(() => {
    if (currentRide) navigate('/client/ride')
  }, [currentRide])

  useEffect(() => {
    if (originZone && destZone) {
      getPrice(originZone, destZone).then(setPrice)
    } else {
      setPrice(null)
    }
  }, [originZone, destZone])

  const handleRequest = async () => {
    if (!originZone || !destZone) return
    setLoading(true)
    try {
      await requestRide({
        originZoneId: originZone,
        destZoneId: destZone,
        pickupLat: latitude || -22.3515,
        pickupLng: longitude || -42.4835,
        paymentMethod: payment,
      })
      navigate('/client/ride')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const originName = zones.find(z => z.id === originZone)?.name
  const destName = zones.find(z => z.id === destZone)?.name

  return (
    <div className="h-screen bg-dark-950 flex flex-col relative overflow-hidden">
      {/* Header flutuante */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 map-gradient-top">
        <div className="flex items-center justify-between">
          <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-primary font-display font-bold text-lg">Lu</span>
            <span className="text-white font-display font-bold text-lg">mia</span>
          </div>
          <div className="glass rounded-full p-2.5">
            <span className="text-lg">👋</span>
          </div>
        </div>
        {user && (
          <p className="text-dark-100 text-sm mt-3 ml-1">
            Olá, <span className="text-white font-semibold">{user.name.split(' ')[0]}</span>
          </p>
        )}
      </div>

      {/* Mapa placeholder */}
      <div ref={mapRef} className="flex-1 relative bg-dark-900">
        {/* Simulated map background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,180,216,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,180,216,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Location pin */}
        {latitude && longitude && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 bg-primary rounded-full glow-primary" />
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
              <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-ripple" />
            </div>
          </div>
        )}

        {/* Zone indicators */}
        {originName && (
          <div className="absolute top-1/3 left-1/4 glass rounded-xl px-3 py-1.5 animate-bounce-in">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-accent rounded-full" />
              <span className="text-xs text-white font-medium">{originName}</span>
            </div>
          </div>
        )}
        {destName && (
          <div className="absolute top-2/3 right-1/4 glass rounded-xl px-3 py-1.5 animate-bounce-in">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-danger rounded-full" />
              <span className="text-xs text-white font-medium">{destName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 z-30 transition-all duration-300',
        sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]',
      )}>
        {/* Handle */}
        <button
          onClick={() => setSheetOpen(!sheetOpen)}
          className="w-full flex justify-center pt-3 pb-2"
        >
          <div className="w-10 h-1 rounded-full bg-dark-400" />
        </button>

        <div className="bottom-sheet rounded-t-3xl px-5 pb-8 pt-2 max-h-[70vh] overflow-y-auto">
          {step === 'select' ? (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-white">Para onde?</h2>

              {/* Route card */}
              <div className="bg-dark-800 rounded-2xl p-4 space-y-3">
                {/* Origin */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 border-2 border-accent rounded-full bg-accent/20" />
                    <div className="w-0.5 h-8 bg-dark-500 my-1" />
                  </div>
                  <select
                    value={originZone}
                    onChange={(e) => setOriginZone(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm py-2 border-b border-dark-500 focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="" className="bg-dark-800">Onde você está?</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id} className="bg-dark-800">{z.name}</option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-danger rounded-sm" />
                  </div>
                  <select
                    value={destZone}
                    onChange={(e) => setDestZone(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm py-2 border-b border-dark-500 focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="" className="bg-dark-800">Para onde vai?</option>
                    {zones.filter(z => z.id !== originZone).map((z) => (
                      <option key={z.id} value={z.id} className="bg-dark-800">{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price preview */}
              {price !== null && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-bounce-in">
                  <div>
                    <p className="text-xs text-dark-100 mb-1">Valor estimado</p>
                    <p className="text-2xl font-display font-bold text-primary">{formatCurrency(price)}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </div>
                </div>
              )}

              {price !== null && (
                <Button fullWidth size="lg" onClick={() => setStep('confirm')}>
                  Continuar
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-slide-up">
              <button onClick={() => setStep('select')} className="flex items-center gap-2 text-dark-200 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Voltar</span>
              </button>

              <h2 className="font-display text-xl font-bold text-white">Confirmar corrida</h2>

              {/* Route summary */}
              <div className="bg-dark-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                  <span className="text-sm text-white">{originName}</span>
                </div>
                <div className="ml-1 w-0.5 h-4 bg-dark-500" />
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-danger rounded-sm" />
                  <span className="text-sm text-white">{destName}</span>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-sm text-dark-100 mb-3">Forma de pagamento</p>
                <div className="flex gap-3">
                  {[
                    { value: 'PIX' as const, label: 'Pix', icon: '💠' },
                    { value: 'CASH' as const, label: 'Dinheiro', icon: '💵' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPayment(opt.value)}
                      className={cn(
                        'flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                        payment === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-dark-500 bg-surface hover:border-dark-400',
                      )}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className={cn('font-semibold text-sm', payment === opt.value ? 'text-primary' : 'text-white')}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total + request */}
              <div className="bg-dark-800 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-dark-100">Total</span>
                <span className="text-2xl font-display font-bold text-white">{formatCurrency(price || 0)}</span>
              </div>

              <Button fullWidth size="lg" loading={loading} onClick={handleRequest}>
                Solicitar corrida
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomNav />
      </div>
    </div>
  )
}

function BottomNav() {
  const location = (window as any).location
  return null // Nav is handled by Layout on other pages; on home we show the sheet
}
