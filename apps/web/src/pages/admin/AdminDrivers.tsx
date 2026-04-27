import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../lib/api'

interface DriverItem {
  id: string
  status: string
  availability: string
  vehicleMake: string
  vehicleModel: string
  licensePlate: string
  user: { name: string; phone: string; email?: string }
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<DriverItem[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  function fetchDrivers() {
    setLoading(true)
    const url = filter ? `/admin/drivers?status=${filter}` : '/admin/drivers'
    api.get(url)
      .then(({ data }) => { setDrivers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDrivers() }, [filter])

  async function approve(id: string) {
    await api.put(`/admin/drivers/${id}/approve`)
    fetchDrivers()
  }

  async function block(id: string) {
    if (!confirm('Bloquear este motorista?')) return
    await api.put(`/admin/drivers/${id}/block`)
    fetchDrivers()
  }

  return (
    <Layout title="Motoristas">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { key: '', label: 'Todos' },
            { key: 'PENDING', label: 'Pendentes' },
            { key: 'APPROVED', label: 'Aprovados' },
            { key: 'BLOCKED', label: 'Bloqueados' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : drivers.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhum motorista encontrado</p>
        ) : (
          <div className="space-y-3">
            {drivers.map((d) => (
              <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{d.user.name}</p>
                    <p className="text-sm text-gray-500">{d.user.phone}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {d.vehicleMake} {d.vehicleModel} — {d.licensePlate}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    d.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                    d.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {d.status === 'APPROVED' ? 'Aprovado' : d.status === 'PENDING' ? 'Pendente' : 'Bloqueado'}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  {d.status === 'PENDING' && (
                    <Button size="sm" onClick={() => approve(d.id)}>Aprovar</Button>
                  )}
                  {d.status !== 'BLOCKED' && (
                    <Button size="sm" variant="danger" onClick={() => block(d.id)}>Bloquear</Button>
                  )}
                  {d.status === 'BLOCKED' && (
                    <Button size="sm" onClick={() => approve(d.id)}>Desbloquear</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
