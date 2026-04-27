import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { redis } from './redis'

// Mapeia socket.id → driverId e vice-versa
const driverSockets = new Map<string, string>() // driverId → socketId
const socketDrivers = new Map<string, string>() // socketId → driverId
const clientSockets = new Map<string, string>() // visitorId (oderId) → socketId

export function setupSocketHandlers(io: Server) {
  // Middleware de autenticação via token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Token não fornecido'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string
        role: string
      }
      socket.data.userId = decoded.sub
      socket.data.role = decoded.role
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', async (socket: Socket) => {
    const { userId, role } = socket.data
    console.log(`🔌 Conectado: ${userId} (${role}) — ${socket.id}`)

    // Motorista entra na sala de motoristas
    if (role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId } })
      if (driver) {
        driverSockets.set(driver.id, socket.id)
        socketDrivers.set(socket.id, driver.id)
        socket.join('drivers')

        // Cache no Redis para consulta rápida
        await redis.hset(`driver:${driver.id}`, {
          socketId: socket.id,
          userId,
          lat: driver.currentLat?.toString() || '0',
          lng: driver.currentLng?.toString() || '0',
        })
      }
    }

    // Cliente entra na sua sala pessoal
    if (role === 'CLIENT') {
      clientSockets.set(userId, socket.id)
      socket.join(`client:${userId}`)
    }

    // === EVENTOS DO MOTORISTA ===

    socket.on('driver:online', async () => {
      const driverId = socketDrivers.get(socket.id)
      if (!driverId) return

      await prisma.driver.update({
        where: { id: driverId },
        data: { availability: 'ONLINE', lastSeenAt: new Date() },
      })
      await redis.hset(`driver:${driverId}`, 'status', 'ONLINE')
      console.log(`🟢 Motorista online: ${driverId}`)
    })

    socket.on('driver:offline', async () => {
      const driverId = socketDrivers.get(socket.id)
      if (!driverId) return

      await prisma.driver.update({
        where: { id: driverId },
        data: { availability: 'OFFLINE', lastSeenAt: new Date() },
      })
      await redis.hset(`driver:${driverId}`, 'status', 'OFFLINE')
      console.log(`🔴 Motorista offline: ${driverId}`)
    })

    socket.on('driver:update-location', async (data: { lat: number; lng: number }) => {
      const driverId = socketDrivers.get(socket.id)
      if (!driverId) return

      // Atualiza no banco (pode ser throttled em produção)
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          currentLat: data.lat,
          currentLng: data.lng,
          lastSeenAt: new Date(),
        },
      })

      // Cache no Redis
      await redis.hset(`driver:${driverId}`, {
        lat: data.lat.toString(),
        lng: data.lng.toString(),
      })

      // Se o motorista está em corrida, enviar localização para o cliente
      const activeRide = await prisma.ride.findFirst({
        where: {
          driverId,
          status: { in: ['ACCEPTED', 'ARRIVING', 'IN_PROGRESS'] },
        },
      })

      if (activeRide) {
        io.to(`client:${activeRide.clientId}`).emit('ride:driver-location', {
          lat: data.lat,
          lng: data.lng,
        })
      }
    })

    // === DESCONEXÃO ===

    socket.on('disconnect', async () => {
      const driverId = socketDrivers.get(socket.id)
      if (driverId) {
        driverSockets.delete(driverId)
        socketDrivers.delete(socket.id)
        await redis.del(`driver:${driverId}`)
      }

      if (role === 'CLIENT') {
        clientSockets.delete(userId)
      }

      console.log(`❌ Desconectado: ${userId} — ${socket.id}`)
    })
  })

  return {
    // Notifica motoristas online sobre nova corrida
    notifyNewRide: (ride: any) => {
      io.to('drivers').emit('ride:new-request', ride)
    },

    // Notifica cliente que motorista aceitou
    notifyRideAccepted: (clientId: string, data: any) => {
      io.to(`client:${clientId}`).emit('ride:driver-accepted', data)
    },

    // Notifica cliente que motorista chegou
    notifyDriverArrived: (clientId: string) => {
      io.to(`client:${clientId}`).emit('ride:driver-arrived')
    },

    // Notifica cliente que corrida começou
    notifyRideStarted: (clientId: string) => {
      io.to(`client:${clientId}`).emit('ride:started')
    },

    // Notifica cliente que corrida completou
    notifyRideCompleted: (clientId: string, data: any) => {
      io.to(`client:${clientId}`).emit('ride:completed', data)
    },

    // Notifica motorista que cliente cancelou
    notifyRideCancelled: (driverId: string) => {
      const socketId = driverSockets.get(driverId)
      if (socketId) {
        io.to(socketId).emit('ride:cancelled-by-client')
      }
    },
  }
}
