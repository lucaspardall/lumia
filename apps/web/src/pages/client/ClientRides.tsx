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
  originZone: { name: string }
  destZone: { name: string }
  driver?: { user: { name: string }; licensePlate: string }
  requestedAt: string
  completedAt?: string
}

export default function ClientRides() {
  const [rides, setRides] = useState<RideItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/client/rides').then(({ data }) => {
      setRides(data.rides)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <Layout title="Minhas corridas">
      <div className="p-4 max-w-lg mx-auto">
        {loading ? (
          <LoadingSpinner />
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhuma corrida ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={ride.status} />
                  <span className="font-display font-bold text-primary">
                    {formatCurrency(ride.price)}
                  </span>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <div className="flex flex-col items-center gap-0.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div className="w-0.5 h-4 bg-gray-300" />
                    <div className="w-2 h-2 rounded-full bg-danger" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ride.originZone.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{ride.destZone.name}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-400">
                  <span>{formatDate(ride.requestedAt)}</span>
                  {ride.driver && <span>{ride.driver.user.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
