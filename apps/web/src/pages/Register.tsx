import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'DRIVER'>('CLIENT')
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await register({ name, phone, email: email || undefined, password, role })
      const user = useAuthStore.getState().user
      if (user?.role === 'DRIVER') navigate('/driver')
      else navigate('/client')
    } catch {
      // Erro já no store
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-primary">Lumia</h1>
          <p className="text-gray-500 mt-1">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">
              {error}
              <button onClick={clearError} className="float-right font-bold">&times;</button>
            </div>
          )}

          {/* Seletor de tipo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                role === 'CLIENT'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Passageiro
            </button>
            <button
              type="button"
              onClick={() => setRole('DRIVER')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                role === 'DRIVER'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Motorista
            </button>
          </div>

          <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Telefone" type="tel" placeholder="(22) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email (opcional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          <Button type="submit" loading={isLoading} className="w-full" variant={role === 'DRIVER' ? 'secondary' : 'primary'}>
            Cadastrar como {role === 'DRIVER' ? 'Motorista' : 'Passageiro'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
