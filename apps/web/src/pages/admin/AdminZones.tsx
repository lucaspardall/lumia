import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'

import api from '../../lib/api'

export default function AdminZones() {
  const [zones, setZones] = useState<any[]>([])
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/zones'),
      api.get('/zones/prices'),
    ]).then(([zRes, pRes]) => {
      setZones(zRes.data.zones || zRes.data)
      setPrices(pRes.data.prices || pRes.data)
      setLoading(false)
    })
  }, [])

  const updatePrice = async (id: string, newPrice: number) => {
    await api.put(`/admin/prices/${id}`, { price: newPrice })
    setPrices(prices.map(p => p.id === id ? { ...p, price: newPrice } : p))
  }

  if (loading) return <Layout title="Zonas"><LoadingSpinner /></Layout>

  return (
    <Layout title="Zonas e preços" showBack>
      <div className="px-4 py-4 space-y-4">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-surface rounded-2xl p-4 border border-dark-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <h3 className="font-display font-bold text-white">{zone.name}</h3>
            </div>
            <div className="space-y-2">
              {prices
                .filter(p => p.originZoneId === zone.id)
                .map((p) => {
                  const destZone = zones.find(z => z.id === p.destZoneId)
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-dark-800 rounded-xl px-3 py-2">
                      <span className="text-sm text-dark-100">→ {destZone?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-300">R$</span>
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => updatePrice(p.id, Number(e.target.value))}
                          className="w-16 bg-transparent text-white text-right text-sm font-bold border-b border-dark-500 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
