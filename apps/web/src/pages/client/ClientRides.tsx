import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../lib/api'
import { formatCurrency, formatRelativeDate } from '../../lib/utils'

export default function ClientRides() {
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/client/rides').then(({ data }) => {
      setRides(data.rides || data)
      setLoading(false)
    })
  }, [])

  return (
    <Layout title="Minhas corridas" showBack>
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <LoadingSpinner text="Carregando corridas..." />
        ) : rides.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-dark-200">Nenhuma corrida ainda</p>
            <p className="text-dark-300 text-sm mt-1">Suas corridas aparecerão aqui</p>
          </div>
        ) : (
          rides.map((ride, i) => (
            <div
              key={ride.id}
              className="bg-surface rounded-2xl p-4 border border-dark-600 hover:border-dark-400 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={ride.status} />
                <span className="text-xs text-dark-300">{formatRelativeDate(ride.requestedAt || ride.createdAt)}</span>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm text-white truncate">{ride.originZone?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger rounded-sm flex-shrink-0" />
                  <span className="text-sm text-white truncate">{ride.destZone?.name}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dark-600">
                <span className="font-display font-bold text-white">{formatCurrency(ride.price)}</span>
                <span className="text-xs text-dark-200">{ride.paymentMethod === 'PIX' ? '💠 Pix' : '💵 Dinheiro'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
