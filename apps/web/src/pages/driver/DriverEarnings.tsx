import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'

interface EarningsData {
  totalEarnings: number
  totalCommission: number
  pendingBalance: number
  ridesCount: number
  rides: {
    id: string
    price: number
    driverEarnings: number
    completedAt: string
    originZone: { name: string }
    destZone: { name: string }
  }[]
}

export default function DriverEarnings() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/driver/earnings?period=${period}`)
      .then(({ data }) => { setData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  return (
    <Layout title="Meus ganhos">
      <div className="p-4 max-w-lg mx-auto">
        {/* Filtro período */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'today', label: 'Hoje' },
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mês' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                period === p.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : data ? (
          <>
            {/* Cards resumo */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <p className="text-xs text-gray-500">Ganhos</p>
                <p className="font-display text-xl font-bold text-accent">
                  {formatCurrency(data.totalEarnings)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <p className="text-xs text-gray-500">Corridas</p>
                <p className="font-display text-xl font-bold text-primary">{data.ridesCount}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <p className="text-xs text-gray-500">Comissão devida</p>
                <p className="font-display text-xl font-bold text-secondary">
                  {formatCurrency(data.pendingBalance)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <p className="text-xs text-gray-500">Comissão total</p>
                <p className="font-display text-xl font-bold text-gray-500">
                  {formatCurrency(data.totalCommission)}
                </p>
              </div>
            </div>

            {/* Lista de corridas */}
            <h3 className="font-display font-bold text-gray-900 mb-3">Histórico</h3>
            <div className="space-y-2">
              {data.rides.map((ride) => (
                <div key={ride.id} className="bg-white rounded-xl p-3 shadow-sm border flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">
                      {ride.originZone.name} → {ride.destZone.name}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(ride.completedAt)}</p>
                  </div>
                  <p className="font-display font-bold text-accent">
                    {formatCurrency(ride.driverEarnings)}
                  </p>
                </div>
              ))}
              {data.rides.length === 0 && (
                <p className="text-center text-gray-400 py-8">Nenhuma corrida neste período</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400">Erro ao carregar dados</p>
        )}
      </div>
    </Layout>
  )
}
