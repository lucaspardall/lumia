import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAuthStore } from '../../store/auth.store'
import api from '../../lib/api'

export default function DriverProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/driver/profile').then(({ data }) => setProfile(data))
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await api.put('/driver/profile', {
        vehicleMake: profile.vehicleMake,
        vehicleModel: profile.vehicleModel,
        vehicleColor: profile.vehicleColor,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return <Layout title="Perfil"><div /></Layout>

  return (
    <Layout title="Meu perfil" showBack>
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center text-4xl border border-primary/20">
            🚗
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Nome" value={user?.name || ''} disabled />
          <Input label="Telefone" value={user?.phone || ''} disabled />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" value={profile.vehicleMake || ''} onChange={e => setProfile({ ...profile, vehicleMake: e.target.value })} />
            <Input label="Modelo" value={profile.vehicleModel || ''} onChange={e => setProfile({ ...profile, vehicleModel: e.target.value })} />
          </div>
          <Input label="Cor" value={profile.vehicleColor || ''} onChange={e => setProfile({ ...profile, vehicleColor: e.target.value })} />
          <Input label="Placa" value={profile.licensePlate || ''} disabled />
        </div>

        <Button fullWidth loading={saving} onClick={handleSave}>
          {saved ? '✓ Salvo!' : 'Salvar alterações'}
        </Button>
      </div>
    </Layout>
  )
}
