import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login(phone, password)
      // Redireciona com base no role do usuário
      const user = useAuthStore.getState().user
      if (user?.role === 'DRIVER') navigate('/driver')
      else if (user?.role === 'ADMIN') navigate('/admin')
      else navigate('/client')
    } catch {
      // Erro já está no store
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-primary">Lumia</h1>
          <p className="text-gray-500 mt-1">Entre na sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">
              {error}
              <button onClick={clearError} className="float-right font-bold">&times;</button>
            </div>
          )}

          <Input
            label="Telefone"
            type="tel"
            placeholder="(22) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={isLoading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
