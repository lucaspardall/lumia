import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { cn, formatCurrency } from '../../lib/utils'
import api from '../../lib/api'

export default function DriverEarnings() {
  const [earnings, setEarnings] = useState<any>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/driver/earnings?period=${period}`).then(({ data }) => {
      setEarnings(data)
      setLoading(false)
    })
  }, [period])

  return (
    <Layout title="Ganhos" showBack>
      <div className="px-4 py-6 space-y-6">
        {/* Period selector */}
        <div className="flex gap-2 bg-surface rounded-2xl p-1.5">
          {[
            { key: 'today' as const, label: 'Hoje' },
            { key: 'week' as const, label: 'Semana' },
            { key: 'month' as const, label: 'Mês' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                period === p.key
                  ? 'bg-primary text-white shadow-glow-sm'
                  : 'text-dark-200 hover:text-white',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Carregando..." />
        ) : earnings ? (
          <>
            {/* Total card */}
            <div className="bg-surface rounded-3xl p-6 text-center border border-dark-500">
              <p className="text-dark-200 text-sm mb-2">Total do período</p>
              <p className="text-4xl font-display font-bold text-white mb-1">
                {formatCurrency(earnings.total || 0)}
              </p>
              <p className="text-dark-300 text-sm">{earnings.ridesCount || 0} corridas</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-2xl p-4 border border-dark-600">
                <p className="text-xs text-dark-200 mb-1">Comissão paga</p>
                <p className="text-lg font-display font-bold text-danger">{formatCurrency(earnings.commission || 0)}</p>
              </div>
              <div className="bg-surface rounded-2xl p-4 border border-dark-600">
                <p className="text-xs text-dark-200 mb-1">Líquido</p>
                <p className="text-lg font-display font-bold text-accent">{formatCurrency(earnings.net || earnings.total || 0)}</p>
              </div>
            </div>

            {/* Rides list */}
            {earnings.rides?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-white text-sm px-1">Corridas</h3>
                {earnings.rides.map((ride: any) => (
                  <div key={ride.id} className="bg-surface rounded-2xl p-4 border border-dark-600 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{ride.originZone?.name} → {ride.destZone?.name}</p>
                      <p className="text-xs text-dark-300">{ride.paymentMethod === 'PIX' ? '💠 Pix' : '💵 Dinheiro'}</p>
                    </div>
                    <span className="font-display font-bold text-white">{formatCurrency(ride.driverEarnings)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </Layout>
  )
}
