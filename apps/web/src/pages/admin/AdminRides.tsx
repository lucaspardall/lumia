import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'

interface RideItem {
  id: string
  status: string
  price: number
  paymentMethod: string
  client: { name: string; phone: string }
  driver?: { user: { name: string }; licensePlate: string }
  originZone: { name: string }
  destZone: { name: string }
  createdAt: string
}

export default function AdminRides() {
  const [rides, setRides] = useState<RideItem[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = filter ? `/admin/rides?status=${filter}` : '/admin/rides'
    api.get(url)
      .then(({ data }) => { setRides(data.rides); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  return (
    <Layout title="Corridas">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { key: '', label: 'Todas' },
            { key: 'REQUESTED', label: 'Solicitadas' },
            { key: 'IN_PROGRESS', label: 'Em andamento' },
            { key: 'COMPLETED', label: 'Concluídas' },
            { key: 'CANCELLED', label: 'Canceladas' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : rides.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhuma corrida encontrada</p>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={ride.status} />
                  <span className="font-display font-bold text-primary">{formatCurrency(ride.price)}</span>
                </div>
                <p className="text-sm">
                  {ride.originZone.name} → {ride.destZone.name}
                </p>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{ride.client.name}</span>
                  <span>{ride.driver?.user?.name || '—'}</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">{formatDate(ride.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
