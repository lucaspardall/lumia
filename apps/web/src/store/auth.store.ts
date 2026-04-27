import { create } from 'zustand'
import api from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: 'CLIENT' | 'DRIVER' | 'ADMIN'
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (phone: string, password: string) => Promise<void>
  register: (data: { name: string; phone: string; email?: string; password: string; role?: string }) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
  clearError: () => void
  updateFcmToken: (fcmToken: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (phone, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { phone, password })
      localStorage.setItem('lumia:token', data.accessToken)
      localStorage.setItem('lumia:refreshToken', data.refreshToken)
      localStorage.setItem('lumia:user', JSON.stringify(data.user))

      connectSocket(data.accessToken)

      set({ user: data.user, token: data.accessToken, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao fazer login'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  register: async (input) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', input)
      localStorage.setItem('lumia:token', data.accessToken)
      localStorage.setItem('lumia:refreshToken', data.refreshToken)
      localStorage.setItem('lumia:user', JSON.stringify(data.user))

      connectSocket(data.accessToken)

      set({ user: data.user, token: data.accessToken, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao cadastrar'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: () => {
    localStorage.removeItem('lumia:token')
    localStorage.removeItem('lumia:refreshToken')
    localStorage.removeItem('lumia:user')
    disconnectSocket()
    set({ user: null, token: null })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('lumia:token')
    const userStr = localStorage.getItem('lumia:user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        connectSocket(token)
        set({ user, token })
      } catch {
        localStorage.removeItem('lumia:user')
      }
    }
  },

  clearError: () => set({ error: null }),

  updateFcmToken: async (fcmToken) => {
    try {
      await api.put('/client/profile', { fcmToken })
    } catch {
      // silencioso — não é crítico
    }
  },
}))
