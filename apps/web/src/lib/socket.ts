import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket

  socket = io('/', {
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
