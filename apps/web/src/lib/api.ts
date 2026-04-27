import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor — adiciona token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumia:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor — tenta refresh se receber 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('lumia:refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          localStorage.setItem('lumia:token', data.accessToken)
          localStorage.setItem('lumia:refreshToken', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh falhou — limpa tudo e redireciona pro login
          localStorage.removeItem('lumia:token')
          localStorage.removeItem('lumia:refreshToken')
          localStorage.removeItem('lumia:user')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  },
)

export default api
