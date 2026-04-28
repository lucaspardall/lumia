import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatCurrency } from '../../lib/utils'
import api from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Layout><LoadingSpinner text="Carregando dashboard..." fullScreen /></Layout>

  const cards = [
    { label: 'Receita total', value: formatCurrency(stats?.totalRevenue || 0), icon: '💰', color: 'from-accent/20 to-accent/5 border-accent/20' },
    { label: 'Corridas', value: stats?.totalRides || 0, icon: '🚗', color: 'from-primary/20 to-primary/5 border-primary/20' },
    { label: 'Usuários', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20' },
    { label: 'Motoristas', value: stats?.totalDrivers || 0, icon: '🧑‍✈️', color: 'from-warning/20 to-warning/5 border-warning/20' },
  ]

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, i) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 border animate-fade-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl block mb-2">{card.icon}</span>
              <p className="text-2xl font-display font-bold text-white">{card.value}</p>
              <p className="text-xs text-dark-100 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
