import { useState, FormEvent } from 'react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAuthStore } from '../../store/auth.store'
import api from '../../lib/api'

export default function ClientProfile() {
  const { user, logout } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/client/profile', { name, email: email || undefined })
      // Atualiza o localStorage
      const updated = { ...user!, name, email }
      localStorage.setItem('lumia:user', JSON.stringify(updated))
      useAuthStore.setState({ user: updated })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="Meu perfil">
      <div className="p-4 max-w-lg mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-display font-bold text-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-500 text-sm mt-2">{user?.phone}</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Button type="submit" loading={saving} className="w-full">
            {saved ? 'Salvo!' : 'Salvar alterações'}
          </Button>
        </form>

        <Button variant="ghost" className="w-full mt-4 text-danger" onClick={logout}>
          Sair da conta
        </Button>
      </div>
    </Layout>
  )
}
