import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://187.127.28.229:3333'

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('🔌 Socket conectado')
  })

  socket.on('disconnect', () => {
    console.log('❌ Socket desconectado')
  })

  socket.on('connect_error', (err) => {
    console.error('Erro de conexão socket:', err.message)
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
