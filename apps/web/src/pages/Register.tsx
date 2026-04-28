import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import Button from '../components/Button'
import Input from '../components/Input'
import { cn } from '../lib/utils'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'DRIVER'>('CLIENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, phone, password, role)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Criar conta</h1>
          <p className="text-dark-200 text-sm">Comece a usar o Lumia agora</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-3 max-w-sm mx-auto w-full mb-8 animate-slide-up">
          {[
            { value: 'CLIENT' as const, label: 'Passageiro', icon: '🧑', desc: 'Quero pedir corridas' },
            { value: 'DRIVER' as const, label: 'Motorista', icon: '🚗', desc: 'Quero dirigir' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={cn(
                'flex-1 p-4 rounded-2xl border-2 transition-all duration-200 text-left',
                role === opt.value
                  ? 'border-primary bg-primary/10 shadow-glow-sm'
                  : 'border-dark-500 bg-surface hover:border-dark-400',
              )}
            >
              <span className="text-2xl block mb-2">{opt.icon}</span>
              <span className={cn('font-display font-semibold text-sm block', role === opt.value ? 'text-primary' : 'text-white')}>
                {opt.label}
              </span>
              <span className="text-xs text-dark-200">{opt.desc}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full animate-slide-up">
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
          />

          <Input
            label="Telefone"
            placeholder="(22) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            }
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            }
          />

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-2xl px-4 py-3 animate-bounce-in">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Criar conta
          </Button>
        </form>

        <p className="text-center mt-8 text-dark-200 text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-400 transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
