import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../lib/api'
import { formatCurrency } from '../../lib/utils'

interface DashboardData {
  totalUsers: number
  totalDrivers: number
  pendingDrivers: number
  totalRides: number
  activeRides: number
  completedRides: number
  todayRides: number
  totalRevenue: number
  totalCommissions: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => { setData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Dashboard"><LoadingSpinner /></Layout>

  if (!data) return <Layout title="Dashboard"><p className="p-4 text-center text-gray-400">Erro ao carregar</p></Layout>

  const cards = [
    { label: 'Corridas hoje', value: data.todayRides, icon: '📊', color: 'text-primary' },
    { label: 'Corridas ativas', value: data.activeRides, icon: '🚗', color: 'text-accent' },
    { label: 'Total corridas', value: data.completedRides, icon: '✅', color: 'text-gray-700' },
    { label: 'Usuários', value: data.totalUsers, icon: '👥', color: 'text-primary' },
    { label: 'Motoristas', value: data.totalDrivers, icon: '🚙', color: 'text-secondary' },
    { label: 'Pendentes', value: data.pendingDrivers, icon: '⏳', color: 'text-yellow-600' },
  ]

  return (
    <Layout title="Dashboard">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Cards de faturamento */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-primary rounded-2xl p-5 text-white col-span-2 sm:col-span-1">
            <p className="text-sm opacity-80">Faturamento total</p>
            <p className="font-display text-3xl font-bold mt-1">{formatCurrency(data.totalRevenue)}</p>
          </div>
          <div className="bg-accent rounded-2xl p-5 text-white col-span-2 sm:col-span-1">
            <p className="text-sm opacity-80">Comissões acumuladas</p>
            <p className="font-display text-3xl font-bold mt-1">{formatCurrency(data.totalCommissions)}</p>
          </div>
        </div>

        {/* Cards métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <span className="text-2xl">{card.icon}</span>
              <p className={`font-display text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
