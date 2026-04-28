import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { cn, formatCurrency, formatRelativeDate } from '../../lib/utils'
import api from '../../lib/api'

export default function AdminRides() {
  const [rides, setRides] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/rides').then(({ data }) => {
      setRides(data.rides || data)
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'ALL' ? rides : rides.filter(r => r.status === filter)

  return (
    <Layout title="Corridas" showBack>
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                filter === f ? 'bg-primary text-white' : 'bg-surface text-dark-200 border border-dark-500',
              )}
            >
              {f === 'ALL' ? 'Todas' : f === 'REQUESTED' ? 'Solicitadas' : f === 'IN_PROGRESS' ? 'Em andamento' : f === 'COMPLETED' ? 'Concluídas' : 'Canceladas'}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filtered.map((ride) => (
          <div key={ride.id} className="bg-surface rounded-2xl p-4 border border-dark-600 space-y-3">
            <div className="flex items-center justify-between">
              <StatusBadge status={ride.status} />
              <span className="text-xs text-dark-300">{formatRelativeDate(ride.requestedAt || ride.createdAt)}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-sm text-white">{ride.originZone?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-danger rounded-sm" />
                <span className="text-sm text-white">{ride.destZone?.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-dark-600 text-sm">
              <span className="text-dark-200">👤 {ride.client?.name}</span>
              <span className="font-display font-bold text-white">{formatCurrency(ride.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
