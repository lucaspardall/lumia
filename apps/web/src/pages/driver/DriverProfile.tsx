import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAuthStore } from '../../store/auth.store'
import api from '../../lib/api'

interface DriverData {
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  licensePlate: string
  cnhNumber: string
  status: string
}

export default function DriverProfile() {
  const { user, logout } = useAuthStore()
  const [driver, setDriver] = useState<DriverData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/driver/profile').then(({ data }) => {
      setDriver({
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        vehicleColor: data.vehicleColor,
        licensePlate: data.licensePlate,
        cnhNumber: data.cnhNumber,
        status: data.status,
      })
    }).catch(() => {})
  }, [])

  async function handleSave() {
    if (!driver) return
    setSaving(true)
    try {
      await api.put('/driver/profile', {
        vehicleMake: driver.vehicleMake,
        vehicleModel: driver.vehicleModel,
        vehicleYear: driver.vehicleYear,
        vehicleColor: driver.vehicleColor,
      })
      alert('Salvo!')
    } catch {
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="Meu perfil">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Info pessoal */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-2xl font-display font-bold text-secondary mx-auto">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p className="font-display font-bold text-lg mt-2">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.phone}</p>
          {driver && (
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
              driver.status === 'APPROVED' ? 'bg-green-50 text-accent' :
              driver.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
              'bg-red-50 text-danger'
            }`}>
              {driver.status === 'APPROVED' ? 'Aprovado' : driver.status === 'PENDING' ? 'Pendente' : 'Bloqueado'}
            </span>
          )}
        </div>

        {/* Veículo */}
        {driver && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-3">
            <h3 className="font-display font-bold">Veículo</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Marca" value={driver.vehicleMake}
                onChange={(e) => setDriver({ ...driver, vehicleMake: e.target.value })} />
              <Input label="Modelo" value={driver.vehicleModel}
                onChange={(e) => setDriver({ ...driver, vehicleModel: e.target.value })} />
              <Input label="Ano" type="number" value={String(driver.vehicleYear)}
                onChange={(e) => setDriver({ ...driver, vehicleYear: parseInt(e.target.value) || 0 })} />
              <Input label="Cor" value={driver.vehicleColor}
                onChange={(e) => setDriver({ ...driver, vehicleColor: e.target.value })} />
            </div>
            <Input label="Placa" value={driver.licensePlate} disabled />
            <Input label="CNH" value={driver.cnhNumber} disabled />

            <Button onClick={handleSave} loading={saving} className="w-full">
              Salvar alterações
            </Button>
          </div>
        )}

        <Button variant="ghost" className="w-full text-danger" onClick={logout}>
          Sair da conta
        </Button>
      </div>
    </Layout>
  )
}
