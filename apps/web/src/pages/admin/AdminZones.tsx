import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../lib/api'
import { formatCurrency } from '../../lib/utils'

interface ZonePrice {
  id: string
  price: number
  isActive: boolean
  originZone: { id: string; name: string }
  destZone: { id: string; name: string }
}

export default function AdminZones() {
  const [prices, setPrices] = useState<ZonePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')

  useEffect(() => {
    api.get('/zones/prices')
      .then(({ data }) => { setPrices(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function savePrice(id: string) {
    try {
      await api.put(`/admin/prices/${id}`, { price: parseFloat(editPrice) })
      setPrices(prices.map((p) =>
        p.id === id ? { ...p, price: parseFloat(editPrice) } : p
      ))
      setEditingId(null)
    } catch {
      alert('Erro ao salvar')
    }
  }

  // Agrupa por zona de origem
  const grouped = prices.reduce<Record<string, ZonePrice[]>>((acc, p) => {
    const key = p.originZone.name
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <Layout title="Zonas e Preços">
      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          Object.entries(grouped).map(([zoneName, zoneprices]) => (
            <div key={zoneName} className="mb-6">
              <h3 className="font-display font-bold text-gray-900 mb-2">De {zoneName}</h3>
              <div className="space-y-2">
                {zoneprices.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm border flex items-center justify-between">
                    <span className="text-sm">→ {p.destZone.name}</span>

                    {editingId === p.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 px-2 py-1 border rounded-lg text-sm text-right"
                          step="0.01"
                        />
                        <Button size="sm" onClick={() => savePrice(p.id)}>OK</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>X</Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(p.id); setEditPrice(String(p.price)) }}
                        className="font-display font-bold text-primary hover:underline"
                      >
                        {formatCurrency(p.price)}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
