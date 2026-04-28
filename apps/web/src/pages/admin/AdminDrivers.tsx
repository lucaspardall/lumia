import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/LoadingSpinner'
import { cn } from '../../lib/utils'
import api from '../../lib/api'

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchDrivers = () => {
    api.get('/admin/drivers').then(({ data }) => {
      setDrivers(data.drivers || data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchDrivers() }, [])

  const handleAction = async (id: string, action: 'approve' | 'block') => {
    await api.put(`/admin/drivers/${id}/${action}`)
    fetchDrivers()
  }

  const filtered = filter === 'ALL' ? drivers : drivers.filter(d => d.status === filter)

  return (
    <Layout title="Motoristas" showBack>
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'APPROVED', 'BLOCKED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                filter === f ? 'bg-primary text-white' : 'bg-surface text-dark-200 border border-dark-500',
              )}
            >
              {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendentes' : f === 'APPROVED' ? 'Aprovados' : 'Bloqueados'}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filtered.map((d) => (
          <div key={d.id} className="bg-surface rounded-2xl p-4 border border-dark-600 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{d.user?.name}</p>
                <p className="text-xs text-dark-300">{d.user?.phone}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="text-xs text-dark-200 space-y-0.5">
              <p>🚗 {d.vehicleMake} {d.vehicleModel} — {d.vehicleColor}</p>
              <p>📋 Placa: {d.licensePlate}</p>
            </div>
            <div className="flex gap-2">
              {d.status === 'PENDING' && (
                <Button size="sm" className="flex-1" onClick={() => handleAction(d.id, 'approve')}>Aprovar</Button>
              )}
              {d.status !== 'BLOCKED' && (
                <Button size="sm" variant="danger" className="flex-1" onClick={() => handleAction(d.id, 'block')}>Bloquear</Button>
              )}
              {d.status === 'BLOCKED' && (
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleAction(d.id, 'approve')}>Desbloquear</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
