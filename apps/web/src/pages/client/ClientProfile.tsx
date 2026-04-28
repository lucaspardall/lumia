import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAuthStore } from '../../store/auth.store'
import api from '../../lib/api'

export default function ClientProfile() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/client/profile').then(({ data }) => {
      setName(data.name)
      setEmail(data.email || '')
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/client/profile', { name, email: email || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="Meu perfil" showBack>
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center text-4xl border border-primary/20">
            👤
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          <Input label="Telefone" value={user?.phone || ''} disabled />
        </div>

        <Button fullWidth loading={saving} onClick={handleSave}>
          {saved ? '✓ Salvo!' : 'Salvar alterações'}
        </Button>
      </div>
    </Layout>
  )
}
